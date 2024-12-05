# """Module for document querying using RAG (Retrieval Augmented Generation)."""

# import os
# from typing import List, Dict, Optional
# from pathlib import Path
# from openai import OpenAI
# import psycopg2
# from dotenv import load_dotenv

# from core.processors.document_processor import DocumentProcessor

# load_dotenv()

# OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
# DATABASE_URL = os.environ.get("DATABASE_URL")
# TEMPLATE_DIR = Path(__file__).parent.parent / "templates"


# class DocumentQueryEngine:
#     """
#     A class that implements RAG (Retrieval Augmented Generation) for document querying.

#     This engine retrieves relevant document chunks based on semantic similarity,
#     and generates answers using GPT-4 with context from the retrieved chunks.

#     Attributes:
#         model (str): The GPT model to use for answer generation
#         embedding_model (str): The model to use for generating embeddings
#         max_chunks (int): Maximum number of chunks to retrieve
#         client (OpenAI): OpenAI client instance
#         document_processor (DocumentProcessor): Processor for document operations
#         template_dir (Path): Directory containing prompt templates
#         templates (Dict[str, str]): Cache of loaded templates
#     """

#     def __init__(
#         self,
#         model: str = "gpt-4o-mini",  # experiment with different models
#         embedding_model: str = "text-embedding-3-small",
#         max_chunks: int = 5,
#         template_dir: Optional[Path] = None,
#     ):
#         """
#         Initialize the DocumentQueryEngine.

#         Args:
#             model (str): GPT model identifier
#             embedding_model (str): Embedding model identifier
#             max_chunks (int): Maximum chunks to retrieve per query
#             template_dir (Optional[Path]): Custom template directory path

#         Raises:
#             FileNotFoundError: If template directory doesn't exist
#         """
#         self.model = model
#         self.embedding_model = embedding_model
#         self.max_chunks = max_chunks
#         self.client = OpenAI(api_key=OPENAI_API_KEY)
#         self.document_processor = DocumentProcessor()
#         self.template_dir = template_dir or TEMPLATE_DIR

#         # Load all templates into memory
#         self.templates = self._load_all_templates()
#         if "default.txt" not in self.templates:
#             raise FileNotFoundError("Required default.txt template not found")

#     def _load_all_templates(self) -> Dict[str, str]:
#         """
#         Load all template files from the template directory into memory.

#         Returns:
#             Dict[str, str]: Dictionary mapping template names to their content

#         Raises:
#             FileNotFoundError: If template directory doesn't exist
#         """
#         if not self.template_dir.exists():
#             raise FileNotFoundError(
#                 f"Template directory not found: {self.template_dir}"
#             )

#         templates = {}
#         for template_file in self.template_dir.glob("*.txt"):
#             with open(template_file, "r") as f:
#                 templates[template_file.name] = f.read()
#         return templates

#     def _get_query_embedding(self, text: str) -> list[float]:
#         """
#         Generate embedding for the query text.

#         Args:
#             text (str): The query text

#         Returns:
#             list[float]: The generated embedding vector
#         """
#         return self.document_processor.embedding_processor.generate_embedding(text)

#     def _find_relevant_chunks(
#         self, question_embedding: List[float], threshold: float = 0.0
#     ) -> List[Dict]:
#         """
#         Find relevant document chunks using vector similarity.

#         Args:
#             question_embedding (List[float]): The query embedding vector
#             threshold (float): Minimum similarity threshold

#         Returns:
#             List[Dict]: List of relevant chunks with metadata
#         """
#         conn = psycopg2.connect(DATABASE_URL)
#         try:
#             with conn.cursor() as cur:
#                 embedding_string = f"[{','.join(map(str, question_embedding))}]"

#                 cur.execute(
#                     """
#                     SELECT
#                         c.id,
#                         c.content,
#                         c.metadata,
#                         d.title as document_title,
#                         1 - (c.embedding <=> %s::vector) as similarity
#                     FROM chunks c
#                     JOIN documents d ON c.document_id = d.id
#                     WHERE 1 - (c.embedding <=> %s::vector) > %s
#                     ORDER BY similarity DESC
#                     LIMIT %s;
#                 """,
#                     (embedding_string, embedding_string, threshold, self.max_chunks),
#                 )

#                 results = cur.fetchall()
#                 return [
#                     {
#                         "id": row[0],
#                         "content": row[1],
#                         "metadata": row[2],
#                         "document_title": row[3],
#                         "similarity": row[4],
#                     }
#                     for row in results
#                 ]
#         finally:
#             conn.close()

#     def _build_prompt(
#         self, question: str, contexts: List[Dict], template_name: Optional[str] = None
#     ) -> str:
#         """
#         Build the prompt for GPT with context and question using a template.

#         Args:
#             question (str): The user's question
#             contexts (List[Dict]): Retrieved relevant chunks
#             template_name (Optional[str]): Name of template file to use

#         Returns:
#             str: Formatted prompt with context and question

#         Raises:
#             KeyError: If specified template doesn't exist
#         """
#         context_str = "\n\n".join(
#             [
#                 f"[Source: {ctx['document_title']}, Relevance: {ctx['similarity']:.2f}]\n{ctx['content']}"
#                 for ctx in contexts
#             ]
#         )

#         template_name = template_name or "default.txt"
#         if template_name not in self.templates:
#             raise KeyError(f"Template not found: {template_name}")

#         return self.templates[template_name].format(
#             context=context_str, question=question
#         )

#     def _format_response(self, response: str, contexts: List[Dict]) -> Dict:
#         """
#         Format the final response with sources.

#         Args:
#             response (str): The GPT-generated answer
#             contexts (List[Dict]): The chunks used for context

#         Returns:
#             Dict: Formatted response with answer and sources
#         """
#         return {
#             "answer": response,
#             "sources": [
#                 {
#                     "document_title": ctx["document_title"],
#                     "content": ctx["content"],
#                     "similarity": ctx["similarity"],
#                     "metadata": ctx["metadata"],
#                 }
#                 for ctx in contexts
#             ],
#         }

#     def query(self, question: str, template_name: Optional[str] = None) -> Dict:
#         """
#         Process a query through the RAG pipeline.

#         Args:
#             question (str): The user's question
#             template_name (Optional[str]): Custom template to use for response

#         Returns:
#             Dict: Response containing answer and sources

#         Raises:
#             Exception: If query processing fails
#         """
#         try:
#             question_embedding = self._get_query_embedding(question)
#             relevant_chunks = self._find_relevant_chunks(question_embedding)

#             if not relevant_chunks:
#                 return {
#                     "answer": "I couldn't find any relevant information to answer your question.",
#                     "sources": [],
#                 }

#             prompt = self._build_prompt(question, relevant_chunks, template_name)

#             response = self.client.chat.completions.create(
#                 model=self.model,
#                 messages=[
#                     {
#                         "role": "system",
#                         "content": "You are a helpful expert who always provides accurate but concise information with source citations and focused on helping users learn.",
#                     },
#                     {"role": "user", "content": prompt},
#                 ],
#                 temperature=0.7,
#             )

#             return self._format_response(
#                 response.choices[0].message.content, relevant_chunks
#             )

#         except Exception as e:
#             print(f"Error during query: {e}")
#             return {
#                 "answer": f"An error occurred while processing your question: {str(e)}",
#                 "sources": [],
#             }

#     def verify_database(self) -> Dict:
#         """
#         Verify database content and chunk availability.

#         Returns:
#             Dict: Statistics about documents and chunks in the database
#         """
#         conn = psycopg2.connect(DATABASE_URL)
#         try:
#             with conn.cursor() as cur:
#                 cur.execute("SELECT COUNT(*) FROM documents")
#                 doc_count = cur.fetchone()[0]

#                 cur.execute("SELECT COUNT(*) FROM chunks")
#                 chunk_count = cur.fetchone()[0]

#                 cur.execute(
#                     """
#                     SELECT id, content, embedding
#                     FROM chunks
#                     WHERE embedding IS NOT NULL
#                     LIMIT 1
#                 """
#                 )
#                 sample_chunk = cur.fetchone()

#                 return {
#                     "document_count": doc_count,
#                     "chunk_count": chunk_count,
#                     "has_embeddings": sample_chunk is not None,
#                     "sample_chunk_id": sample_chunk[0] if sample_chunk else None,
#                 }
#         finally:
#             conn.close()

#     def __enter__(self):
#         """Enable context manager entry."""
#         return self

#     def __exit__(self, exc_type, exc_val, exc_tb):
#         """Clean up resources when exiting context manager."""
#         if hasattr(self, "document_processor"):
#             self.document_processor.__exit__(exc_type, exc_val, exc_tb)
