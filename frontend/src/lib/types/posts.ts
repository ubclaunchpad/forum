import { PostList } from "@forum/shared";


export type PostWithRequiredId = { id: string } & Partial<Omit<PostList, "id">>;

type OptimisticOperation = {
  operation: "optimistic";
  id: null;
  post: Omit<PostList, "id">;
};

type RealOperation = {
  operation: "real";
  id: string;
  post: Pick<PostList, "id">;
};

type PostStats = {
  views: number;
  likes: number;
};

type UserInteractions = {
  viewed: boolean;
  liked: boolean;
};

export type AppendOperation = OptimisticOperation | RealOperation;

export type PostType = "draft" | "published";
