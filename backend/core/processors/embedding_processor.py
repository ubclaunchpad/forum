# """Module that contains the EmbeddingProcessor class."""

# import os

# from openai import OpenAI
# import psycopg2
# import numpy as np
# from dotenv import load_dotenv


# load_dotenv()

# OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
# DATABASE_URL = os.environ.get("DATABASE_URL")


# class EmbeddingProcessor:
#     """
#     A class that represents an embedding processor.

#     Attributes:
#         client (OpenAI): An instance of the OpenAI client.
#         conn (psycopg2.extensions.connection): A connection to the PostgreSQL database.

#     Methods:
#         generate_embedding: Generate an embedding for the given text using the specified model.
#     """

#     def __init__(self):
#         self.client = OpenAI(api_key=OPENAI_API_KEY)
#         self.conn = psycopg2.connect(DATABASE_URL)

#     def generate_embedding(self, text: str) -> list[float]:
#         """
#         Generate an embedding for the given text using the specified model.

#         Args:
#             text (str): The input text to generate the embedding for.

#         Returns:
#             list[float]: A list of floats representing the embedding of the input text.
#                         Returns None if an error occurs during the embedding generation.
#         """
#         resp = self.client.embeddings.create(
#             model="text-embedding-3-small", input=text, encoding_format="float"
#         )
#         try:
#             return resp.data[0].embedding
#         except Exception as e:  # pylint: disable=broad-except
#             # only print the error message and raise the exception
#             print(f"Error: {e}")
#             raise e

#     def calculate_similarity_score(
#         self, embedding1: list[float], embedding2: list[float]
#     ) -> float:
#         """
#         Calculate the similarity score between two embeddings.

#         Args:
#             embedding1 (list[float]): The first embedding.
#             embedding2 (list[float]): The second embedding.

#         Returns:
#             float: The similarity score between the two embeddings.
#         """
#         return np.dot(embedding1, embedding2) / (
#             np.linalg.norm(embedding1) * np.linalg.norm(embedding2)
#         )
