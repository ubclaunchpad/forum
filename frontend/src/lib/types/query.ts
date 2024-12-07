export interface DocumentMetadata {
  type: string;
  index: number;
  is_last: boolean;
  has_images: boolean;
  page_number: number;
}

export interface DocumentSource {
  title: string;
  content: string;
  relevance: number;
  metadata: DocumentMetadata;
  signed_url: string;
  document_id: string;
}

export interface APIResponse {
  answer: string;
  sources: DocumentSource[];
}
