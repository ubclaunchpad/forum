import { GetDocument } from "@forum/shared";

export type SourceVariant = GetDocument | string;

export type Source<T extends SourceVariant> = {
  id: string;
  similarity: number;
  data: T;
};

export type SearchResponse = {
  query: string;
  response: string;
  sources: Source<SourceVariant>[];
};

export type SearchState = {
  search: string;
  searchType: "text" | "ai";
  isLoading: boolean;
  isOpen: boolean;
  textSearchResponse: any;
  response: any;
};
