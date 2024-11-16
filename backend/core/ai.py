import re
from openai import OpenAI
import uuid
import json
from datetime import datetime
import psycopg2
from psycopg2.extras import Json, register_uuid
import numpy as np
from dotenv import load_dotenv
import os

load_dotenv()

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
DATABASE_URL = os.environ.get("DATABASE_URL")

try:
    # For each document
    for doc in documents:
        # Insert document
        doc_id = str(uuid.uuid4())  # Convert UUID to string
        cur.execute("""
            INSERT INTO documents (id, title, original_content, document_type, metadata)
            VALUES (%s, %s, %s, %s, %s)
        """, (doc_id, doc.get('title'), doc.get('content'), doc.get('type'), Json(doc.get('metadata'))))

        # Insert version
        version_id = str(uuid.uuid4())  # Convert UUID to string
        cur.execute("""
            INSERT INTO document_versions (id, document_id, version_number, content_hash, changes_summary)
            VALUES (%s, %s, %s, %s, %s)
        """, (version_id, doc_id, 1, str(hash(doc.get('content'))), 'Initial version'))

        # Create chunks (simple sentence splitting for demo)
        sentences = doc.get('content').split('. ')
        prev_chunk_id = None
        
        for idx, chunk_text in enumerate(sentences):
            if not chunk_text.strip():
                continue
                
            # Get real embedding from OpenAI
            embedding = get_embedding(chunk_text)
            
            chunk_id = str(uuid.uuid4())  # Convert UUID to string
            chunk_metadata = {
                "section": "main",
                "position": {
                    "index": idx,
                    "is_last": idx == len(sentences) - 1
                }
            }
            
            # Insert chunk with real embedding
            cur.execute("""
                INSERT INTO chunks (id, document_id, version_id, content, embedding, chunk_index, metadata)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (
                chunk_id,
                doc_id,
                version_id,
                chunk_text,
                embedding,
                idx,
                Json(chunk_metadata)
            ))

            # If not first chunk, create relation with previous chunk
            if prev_chunk_id is not None:
                cur.execute("""
                    INSERT INTO chunk_relations (id, source_chunk_id, target_chunk_id, relation_type, metadata)
                    VALUES (%s, %s, %s, %s, %s)
                """, (
                    str(uuid.uuid4()),  # Convert UUID to string
                    prev_chunk_id,
                    chunk_id,
                    'sequential',
                    Json({"order": idx})
                ))
            
            prev_chunk_id = chunk_id

    conn.commit()
    print("Seed data inserted successfully!")

except Exception as e:
    conn.rollback()
    print(f"Error: {e}")
    raise e

finally:
    cur.close()
    conn.close()



class EmbeddingProcessor():
    """
    A class that represents an embedding processor.

    Attributes:
        client (OpenAI): An instance of the OpenAI client.
        conn (psycopg2.extensions.connection): A connection to the PostgreSQL database.

    Methods:
        generate_embedding: Generate an embedding for the given text using the specified model.
    """
    def __init__(self):
        self.client = OpenAI(api_key=OPENAI_API_KEY)
        self.conn = psycopg2.connect(DATABASE_URL)
        
    def generate_embedding(self, text: str) -> list[float]:
        """
        Generate an embedding for the given text using the specified model.

        Args:
            text (str): The input text to generate the embedding for.

        Returns:
            list[float]: A list of floats representing the embedding of the input text.
                        Returns None if an error occurs during the embedding generation.
        """
        resp = self.client.embeddings.create(
            model="text-embedding-3-small",
            input=text,
            encoding_format="float"
        )
        try:
            return resp.data[0].embedding
        except Exception as e: 
            print(f"Error: {e}")
            return None
        
    def calculate_similarity_score(self, embedding1: list[float], embedding2: list[float]) -> float:
        """
        Calculate the similarity score between two embeddings.

        Args:
            embedding1 (list[float]): The first embedding.
            embedding2 (list[float]): The second embedding.

        Returns:
            float: The similarity score between the two embeddings.
        """
        return np.dot(embedding1, embedding2) / (np.linalg.norm(embedding1) * np.linalg.norm(embedding2))
