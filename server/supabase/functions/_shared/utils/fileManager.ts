// import { supa } from "../db.ts";

import { SupabaseClient } from "jsr:@supabase/supabase-js@2";
import { DuplicateBucketError, StorageBucketNotFoundError } from "../errors.ts";

interface FileManagerOptions {
  supportedMimeTypes: string[];
  maxFileSizeInMB: number;
  conflictResolution: "appendTimestamp" | "overwrite" | "raiseError" | "ignore";
  signedUrlExpirationSeconds: number;
}

export const DEFAULT_FILE_MANAGER_OPTIONS: FileManagerOptions = {
  supportedMimeTypes: ["image/jpeg", "image/png", "image/gif", "application/pdf"],
  maxFileSizeInMB: 10,
  conflictResolution: "appendTimestamp",
  signedUrlExpirationSeconds: 600,
};

export type FileManagerBuilder = ReturnType<typeof fileManager>;
export type FileManager = ReturnType<FileManagerBuilder>;

export const fileManager =
  (db: SupabaseClient) => (defaultOptions: FileManagerOptions) => {
    const manager = {
      buckets: {
        createBucket: async (bucketName: string, options: {
          public: boolean;
          allowedMimeTypes?: string[];
          maxFileSizeInMB?: number;
        }) => {
          const createOptions = {
            public: options.public,
            allowedMimeTypes: options.allowedMimeTypes || defaultOptions.supportedMimeTypes,
            fileSizeLimit: (options.maxFileSizeInMB || defaultOptions.maxFileSizeInMB) * 1024 * 1024,
          };
          const { data, error } = await db.storage.createBucket(bucketName, createOptions);
          if (error) {
            console.error(error);
            throw new DuplicateBucketError(error.message);
          }
          return data;
        },
        deleteBucket: async (bucketName: string) => {
          await db.storage.emptyBucket(bucketName);
          const { data, error } = await db.storage.deleteBucket(bucketName);
          if (error) {
            throw new StorageBucketNotFoundError(error.message);
          }
          return data;
        },
        listBuckets: async () => {
          const { data, error } = await db.storage.listBuckets();
          if (error) {
            throw new Error(error.message);
          }
          return data;
        },
        usingBucket: (bucketName: string) => {
          return {
            uploadFile: async (file: File) => {
              const { data: bucket } = await db.storage.getBucket(bucketName);

              if (!bucket) {
                await manager.buckets.createBucket(bucketName, {
                  public: false,
                  allowedMimeTypes: defaultOptions.supportedMimeTypes,
                  maxFileSizeInMB: defaultOptions.maxFileSizeInMB,
                });
              }
              // console.log("bucket created/ now uploading file");
              const { data: fileRecord, error: fileRecordError } = await db
                .from("files").insert({
                  name: file.name,
                  type: file.type,
                  size: file.size,
                  path: null,
                  bucket: bucketName,
                }).select().single();

              if (fileRecordError) {
                throw new Error(fileRecordError.message);
              }

              // console.log("file record created, now uploading file");
              // console.log(fileRecord);
              const { data, error } = await db.storage.from(bucketName).upload(
                fileRecord.id,
                file,
                {
                  upsert: true,
                }
              );

              if (error) {
                await db.from("files").delete().eq("id", fileRecord.id);
                throw new StorageBucketNotFoundError(error.message);
              }

              // console.log("file uploaded, now updating file record");
              const { data: updatedFileRecord } = await db.from("files").update(
                {
                  path: data.fullPath,
                  updated_at: new Date().toISOString(),
                },
              ).eq("id", fileRecord.id).select().single();

              // console.log("file record updated");
              // console.log(updatedFileRecord);

              return updatedFileRecord;
            },
            getFiles: async () => {
              const { data, error } = await db.storage.from(bucketName).list();
              if (error) {
                throw new Error(error.message);
              }
              return data;
            },
            getFileSignedUrls: async (fileIds: string[]) => {
              const { data: files, error: filesError } = await db.from("files")
                .select("*").in("id", fileIds);

              if (filesError) {
                throw new Error(filesError.message);
              }

              if (files.some((file) => file.bucket !== bucketName)) {
                throw new Error("All files must be in the same bucket");
              }

              const signedUrls = await db.storage.from(bucketName)
                .createSignedUrls(
                  files.map((file) => file.name),
                  defaultOptions.signedUrlExpirationSeconds,
                );

              return signedUrls;
            },
            getFileData: async (filePath: string) => {
              console.log("getting file data", filePath);
              console.log("bucketName", bucketName);
            const { data, error } = await db.storage.from(bucketName).download(filePath);
              if (error) {
                throw new Error(error.message);
              }
              return data;
            },
            getFileSignedUrl: async (filePath: string) => {
              const { data, error } = await db.storage.from(bucketName).createSignedUrl(filePath, defaultOptions.signedUrlExpirationSeconds);
              if (error) {
                throw new Error(error.message);
              }
              return {
                signed_url: data.signedUrl,
              }
            },
          };
        },

      },
      files: {
        getFiles: async (bucketName?: string) => {
          let q = db.from("files").select("*")
          if (bucketName) {
            q = q.eq("bucket", bucketName);
          }
          const { data } = await q;
          
          return data;
        },
        deleteFile: async (fileId: string) => {
          await db.from("files").delete().eq("id", fileId);
        },
        getFile: async (fileId: string) => {
          const { data, error } = await db.from("files").select("*").eq(
            "id",
            fileId,
          ).single();

          if (error) {
            throw new Error(error.message);
          }

          return data;
        },
        deleteFiles: async (bucketName: string) => {
            const q = db.from("files").delete().eq("bucket", bucketName);
            const { data, error } = await q;

            if (error) {
                throw error
            }
        
            return data;
        },
        getFileData: async (fileId: string) => {
          const {data: fileRecord, error: fileRecordError} = await db.from("files").select("*").eq("id", fileId).single();
          if (fileRecordError) {
            throw new Error(fileRecordError.message);
          }
          console.log("fileRecord", fileRecord);
          return manager.buckets.usingBucket(fileRecord.bucket).getFileData(fileRecord.path);
        },
      },
    };
    return manager;
  };
