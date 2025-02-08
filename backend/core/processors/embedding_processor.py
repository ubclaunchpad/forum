"""Module that contains the EmbeddingProcessor class."""

import os
from typing import Callable

import numpy as np
import psycopg2
from openai import OpenAI

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY") or ""
DATABASE_URL = os.getenv("DATABASE_URL") or ""

def get_openai_client() -> OpenAI:
    return OpenAI(api_key=OPENAI_API_KEY)

def get_connection():
    return psycopg2.connect(DATABASE_URL)

class EmbeddingProcessor:
    """
    A class that represents an embedding processor.

    Attributes:
        client (OpenAI): An instance of the OpenAI client.
        conn (psycopg2.extensions.connection): A connection to the PostgreSQL database.

    Methods:
        generate_embedding: Generate an embedding for the given text using the specified model.
    """

    def __init__(self, client: Callable[[], OpenAI] = get_openai_client, conn: Callable[[], psycopg2.extensions.connection] = get_connection):
        self.client = client()
        self.conn = conn()

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
            model="text-embedding-3-small", input=text, encoding_format="float"
        )
        try:
            print(resp.data[0].embedding)
            return resp.data[0].embedding
        except Exception as e:  # pylint: disable=broad-except
            # only print the error message and raise the exception
            print(f"Error: {e}")
            raise e

    def calculate_similarity_score(
        self, embedding1: list[float], embedding2: list[float]
    ) -> float:
        """
        Calculate the similarity score between two embeddings.

        Args:
            embedding1 (list[float]): The first embedding.
            embedding2 (list[float]): The second embedding.

        Returns:
            float: The similarity score between the two embeddings.
        """
        return np.dot(embedding1, embedding2) / (
            np.linalg.norm(embedding1) * np.linalg.norm(embedding2)
        )
