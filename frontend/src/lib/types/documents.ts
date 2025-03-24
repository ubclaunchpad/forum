import { GetDocument } from "@forum/shared";

export type DocumentAppendOperation =
  | DocumentOptimisticOperation
  | DocumentRealOperation;


type DocumentOptimisticOperation = {
  operation: "optimistic";
  id: null;
  document: Pick<GetDocument, "file" | "description" | "course_id">;
};

type DocumentRealOperation = {
  operation: "real";
  id: string;
  document: Pick<GetDocument, "id">;
};
