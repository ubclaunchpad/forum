# """Example script demonstrating query system workflow with biology content."""

# import time
# import json

# from datetime import datetime
# from pathlib import Path
# from typing import Dict

# from core.processors.document_processor import DocumentProcessor
# from core.pipelines.doc_query_engine import DocumentQueryEngine


# data_path = Path(__file__).parent / "data.json"
# with open(data_path, "r") as f:
#     example_data = json.load(f)

# SAMPLE_DOCS = example_data["docs"]
# TEST_QUERIES = [q["question"] for q in example_data["queries"]]


# class Timer:
#     """Simple context manager for timing operations."""

#     def __init__(self, description):
#         self.description = description

#     def __enter__(self):
#         self.start = time.time()
#         return self

#     def __exit__(self, *args):
#         self.end = time.time()
#         self.duration = self.end - self.start
#         print(f"{self.description}: {self.duration:.2f} seconds")


# def save_output(content: str, filename: str) -> None:
#     """
#     Save content to a file in the outputs directory, creating directory if needed.

#     Args:
#         content: Content to save
#         filename: Name of the file
#     """
#     # Get the absolute path to the example directory
#     example_dir = Path(__file__).parent
#     output_dir = example_dir / "outputs"

#     # Create outputs directory if it doesn't exist
#     output_dir.mkdir(parents=True, exist_ok=True)

#     # Create full file path
#     file_path = output_dir / filename

#     # Save the file
#     with open(file_path, "w", encoding="utf-8") as f:
#         f.write(content)

#     print(f"Saved output to: {file_path}")


# def format_answer(query: str, result: Dict, duration: float) -> str:
#     """Format query result for output file."""
#     timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

#     sources_text = ""
#     for source in result["sources"]:
#         sources_text += f"""Document: {source['document_title']}
# Relevance: {source['similarity']:.3f}
# Content: {source['content']}

# """

#     return f"""Query Time: {timestamp}
# Query Duration: {duration:.2f} seconds

# Question:
# {query}

# Answer:
# {result['answer']}

# Sources Used:
# {'-' * 50}
# {sources_text}"""


# def main():
#     """Run the LLM query example workflow."""
#     print("Starting RAG example workflow...")
#     print("-" * 50)

#     # Initialize processors
#     doc_processor = DocumentProcessor()
#     query_engine = DocumentQueryEngine()

#     # Track document IDs
#     doc_ids = []

#     try:
#         # Process and store documents
#         with Timer("Document processing and storage"):
#             for doc in SAMPLE_DOCS:
#                 doc_id = doc_processor.ingest_document(
#                     default_props={
#                         "source": "example",
#                         "date_added": datetime.now().isoformat(),
#                         "subject": "biology",
#                         "level": "university",
#                     },
#                     document=doc["content"],
#                     title=doc["title"],
#                     strategy_type=doc["type"],
#                 )
#                 doc_ids.append(doc_id)
#                 print(f"Stored document: {doc['title']} (ID: {doc_id})")

#         # Verify database state
#         print("\nDatabase State:")
#         print("-" * 50)
#         stats = query_engine.verify_database()
#         print(f"Total Documents: {stats['document_count']}")
#         print(f"Total Chunks: {stats['chunk_count']}")

#         # Run test queries
#         print("\nRunning Test Queries:")
#         print("-" * 50)

#         query_times = []
#         for i, query in enumerate(TEST_QUERIES, 1):
#             print(f"\nProcessing query {i}: {query}")

#             try:
#                 with Timer(f"Query {i} processing") as t:
#                     result = query_engine.query(query)
#                 query_times.append(t.duration)

#                 # Format and save output
#                 output = format_answer(query, result, t.duration)
#                 save_output(output, f"query_{i}_result.md")

#             except Exception as e:
#                 print(f"Error processing query {i}: {e}")
#                 continue

#         # Only print summary if we have any successful queries
#         if query_times:
#             print("\nTiming Summary:")
#             print("-" * 50)
#             print(
#                 f"Average query time: {sum(query_times) / len(query_times):.2f} seconds"
#             )
#             print(f"Fastest query: {min(query_times):.2f} seconds")
#             print(f"Slowest query: {max(query_times):.2f} seconds")

#     finally:
#         # Cleanup - delete test documents
#         print("\nCleaning up...")
#         with Timer("Cleanup"):
#             conn = doc_processor.conn
#             cur = doc_processor.cur

#             try:
#                 for doc_id in doc_ids:
#                     # Delete related records first
#                     cur.execute(
#                         "DELETE FROM chunk_relations WHERE source_chunk_id IN (SELECT id FROM chunks WHERE document_id = %s)",
#                         (doc_id,),
#                     )
#                     cur.execute("DELETE FROM chunks WHERE document_id = %s", (doc_id,))
#                     cur.execute(
#                         "DELETE FROM document_versions WHERE document_id = %s",
#                         (doc_id,),
#                     )
#                     cur.execute("DELETE FROM documents WHERE id = %s", (doc_id,))
#                 conn.commit()
#                 print(f"Deleted {len(doc_ids)} test documents and related records")

#             except Exception as e:
#                 conn.rollback()
#                 print(f"Error during cleanup: {e}")
#                 raise

#             finally:
#                 cur.close()
#                 conn.close()


# if __name__ == "__main__":
#     main()
