export type DocumentAppendOperation =
  | DocumentOptimisticOperation
  | DocumentRealOperation;

export type DocumentInterface = {
  id: string;
  title: string;
  course_id: string;
  document_type?: string;
  description?: string;
};

type DocumentOptimisticOperation = {
  operation: "optimistic";
  id: null;
  document: Pick<DocumentInterface, "title" | "description" | "course_id">;
};

type DocumentRealOperation = {
  operation: "real";
  id: string;
  document: Pick<DocumentInterface, "id">;
};
