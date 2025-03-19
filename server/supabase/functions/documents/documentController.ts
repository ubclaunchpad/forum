import { SupabaseClient } from "@supabase/supabase-js";
import { GetDocument, NewDocumentUpload } from "@shared/mod.ts";
import { DEFAULT_FILE_MANAGER_OPTIONS, fileManager } from "../_shared/utils/fileManager.ts";
export const documentHandler = (db: SupabaseClient) => {
  return {
    withCourse: (courseId: string) => {
      return {
        getAllDocuments: async () => {
          const { data, error } = await db.from("documents").select("*, files(*)").eq(
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
          const fileMetadata = await fileManager(db)(DEFAULT_FILE_MANAGER_OPTIONS).buckets.usingBucket(bucketName).uploadFile(file);
          console.log("file metadata", fileMetadata);
          console.log("courseId", courseId);
          console.log("createdBy", createdBy);
          console.log("description", description);

          const { data, error } = await db.from("documents").insert({
            description,
            file_id: fileMetadata.id,
            course_id: courseId,
            created_by: createdBy,
          });
          if (error) throw error;
          return data;
        },
      };
    },
  };
};
