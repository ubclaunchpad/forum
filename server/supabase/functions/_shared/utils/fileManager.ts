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
  supportedMimeTypes: ["image/jpeg", "image/png", "image/gif"],
  maxFileSizeInMB: 10,
  conflictResolution: "appendTimestamp",
  signedUrlExpirationSeconds: 600,
};

export type FileManagerBuilder = ReturnType<typeof fileManager>;
export type FileManager = ReturnType<FileManagerBuilder>;

export const fileManager =
  (db: SupabaseClient) => (defaultOptions: FileManagerOptions) => {
    return {
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

              const { data, error } = await db.storage.from(bucketName).upload(
                file.name,
                file,
              );

              if (error) {
                await db.from("files").delete().eq("id", fileRecord.id);
                throw new StorageBucketNotFoundError(error.message);
              }

              const { data: updatedFileRecord } = await db.from("files").update(
                {
                  path: data.fullPath,
                  updated_at: new Date().toISOString(),
                },
              ).eq("id", fileRecord.id).select().single();

              return updatedFileRecord;
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
          }
      },
    };
  };
