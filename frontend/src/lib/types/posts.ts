export type Post = {
  title: string;
  content: string;
  created_by: string | null;
  id: string;
  applied_at: string;
};

export type PostWithRequiredId = { id: string } & Partial<Omit<Post, 'id'>>;

type OptimisticOperation = {
  operation: "optimistic";
  id: null;
  post: Omit<Post, "id" | "created_by">;
};

type RealOperation = {
  operation: "real";
  id: string;
  post: Pick<Post, "id">;
};

export type AppendOperation = OptimisticOperation | RealOperation;

export type PostType = "draft" | "published";
