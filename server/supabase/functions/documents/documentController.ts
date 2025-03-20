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
        createDocument: async (request: NewDocumentUpload) => {
          const { description, file, createdBy } = request;
          const bucketName = `documents-${courseId}`;

          const bucket = await fileManagerInstance.buckets.createBucket(bucketName, {
            public: true,
            allowedMimeTypes: ["application/pdf"],
            maxFileSizeInMB: 10,
          });

          const fileMetadata = await fileManagerInstance.buckets.usingBucket(bucketName).uploadFile(file);
          console.log("bucket", bucket);
          console.log("courseId", courseId);
          console.log("createdBy", createdBy);
          console.log("description", description);

          const { data, error } = await client.schema("public").from("documents").insert({
            description,
            file_id: fileMetadata.id,
            course_id: courseId,
            created_by: createdBy,
          });
          console.log("data", data);
          console.log("error", error);
          if (error) throw error;
          return data;
        },
      };
    },
  };
};
