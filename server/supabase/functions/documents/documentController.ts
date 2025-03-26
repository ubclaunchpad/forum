import { GetDocument, NewDocumentUpload } from "@shared/mod.ts";
import { DEFAULT_FILE_MANAGER_OPTIONS, fileManager } from "../_shared/utils/fileManager.ts";
import { getSupabaseClient } from "../_shared/db.ts";
type DB = ReturnType<typeof getSupabaseClient>;

export const documentHandler = () => {
  const client = getSupabaseClient();
  const fileManagerInstance = fileManager(client)(DEFAULT_FILE_MANAGER_OPTIONS);
  return {
    withCourse: (courseId: string) => {
      return {
        getAllDocuments: async () => {
          const { data, error } = await client.from("documents").select("*, files(*)").eq(
            "course_id",
            courseId,
          );
          if (error) throw error;

          return data.map((document) => {
            const { files, ...rest } = document;
            return {
              ...rest,
              file: files,
            } as GetDocument;
          });
        },
        getDocumentById: async (id: string) => {
          const { data, error } = await client.from("documents").select("*, files(*)").eq(
            "id",
            id,
          ).single();
          if (error) throw error;
          const { files, ...rest } = data;
          console.log("files", files);
          const path = files.path.split("/");
          const bucket = path[0];
          console.log("bucket", bucket);
          console.log("path", path);
          const file = await fileManagerInstance.buckets.usingBucket(bucket).getFileSignedUrl(path.slice(1).join("/"));
          return {
            signed_url: file.signed_url,
            file_type: files.type,
            name: files.name,
            description: data.description,
            created_by: data.created_by,
            created_at: data.created_at,
            updated_at: data.updated_at,
            course_id: data.course_id,
            id: data.id,
          }
        },
        createDocument: async (request: NewDocumentUpload) => {
          const { description, file, createdBy } = request;
          const bucketName = `documents-${courseId}`;
          const fileMetadata = await fileManagerInstance.buckets.usingBucket(bucketName).uploadFile(file);
          const { data, error } = await client.schema("public").from("documents").insert({
            description: description || "",
            file_id: fileMetadata.id,
            course_id: courseId,
            created_by: createdBy,
          });
          console.log("data", data);
          console.log("error", error);
          if (error) throw error;
          return data;
        },
        deleteDocument: async (id: string) => {
          const { data, error } = await client.schema("public").from("documents").delete().eq("id", id);
          console.log("data", data);
          if (error) throw error;
          return data;
        },
      };
    },
  };
};
