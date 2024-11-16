from openai import OpenAI
import psycopg2
from psycopg2.extras import Json
import os
from dotenv import load_dotenv
import numpy as np
from typing import List, Dict, Tuple

load_dotenv()

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
DATABASE_URL = os.environ.get("DATABASE_URL")

client = OpenAI(api_key=OPENAI_API_KEY)

class RAGQueryEngine:
    def __init__(self, model="gpt-4o", embedding_model="text-embedding-3-small", max_chunks=5):
        self.model = model
        self.embedding_model = embedding_model
        self.max_chunks = max_chunks
        self.client = OpenAI(api_key=OPENAI_API_KEY)

    def get_embedding(self, text: str) -> list[float]:
        """Generate embedding for the question"""
        response = self.client.embeddings.create(
            model=self.embedding_model,
            input=text,
            encoding_format="float"
        )
        return response.data[0].embedding

    def find_relevant_chunks(self, question_embedding: List[float], threshold: float = 0.0) -> List[Dict]:
        """Find relevant chunks using vector similarity"""
        conn = psycopg2.connect(DATABASE_URL)
        try:
            with conn.cursor() as cur:
                embedding_string = f"[{','.join(map(str, question_embedding))}]"
                
                # Modified query to show all results ordered by similarity
                cur.execute("""
                    SELECT 
                        c.id,
                        c.content,
                        c.metadata,
                        d.title as document_title,
                        1 - (c.embedding <=> %s::vector) as similarity
                    FROM chunks c
                    JOIN documents d ON c.document_id = d.id
                    ORDER BY similarity DESC
                    LIMIT %s;
                """, (embedding_string, self.max_chunks))
                
                results = cur.fetchall()
                return [
                    {
                        'id': row[0],
                        'content': row[1],
                        'metadata': row[2],
                        'document_title': row[3],
                        'similarity': row[4]
                    }
                    for row in results
                ]
        finally:
            conn.close()

    def build_prompt(self, question: str, contexts: List[Dict]) -> str:
        """Build prompt with context and question"""
        context_str = "\n\n".join([
            f"[Source: {ctx['document_title']}, Relevance: {ctx['similarity']:.2f}]\n{ctx['content']}"
            for ctx in contexts
        ])
        
        return f"""Use the following sources to answer the question. Include relevant source references in your answer.

Sources:
{context_str}

Question: {question}

Please provide a comprehensive answer based on the sources above. Include specific references to the sources used. End your response with a "Sources Used" section listing the documents you referenced."""

    def format_response(self, response: str, contexts: List[Dict]) -> Dict:
        """Format the final response with sources"""
        return {
            'answer': response,
            'sources': [
                {
                    'document_title': ctx['document_title'],
                    'content': ctx['content'],
                    'similarity': ctx['similarity'],
                    'metadata': ctx['metadata']
                }
                for ctx in contexts
            ]
        }

    def query(self, question: str) -> Dict:
        """Main query method"""
        try:
            # Get question embedding
            question_embedding = self.get_embedding(question)
            print(f"Generated embedding of length: {len(question_embedding)}")
            
            # Find relevant chunks
            relevant_chunks = self.find_relevant_chunks(question_embedding)
            print(f"Found {len(relevant_chunks)} relevant chunks")
            
            if not relevant_chunks:
                print("No chunks found - verify database has data")
                return {
                    'answer': "I couldn't find any relevant information to answer your question.",
                    'sources': []
                }
            
            # Print first chunk for debugging
            if relevant_chunks:
                print(f"Most relevant chunk: {relevant_chunks[0]['content'][:100]}...")
                print(f"Similarity score: {relevant_chunks[0]['similarity']}")
            
            # Build prompt with context
            prompt = self.build_prompt(question, relevant_chunks)
            
            # Get response from GPT-4
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a helpful expert who always provides accurate information with source citations."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7
            )
            
            # Format and return response
            return self.format_response(response.choices[0].message.content, relevant_chunks)
            
        except Exception as e:
            print(f"Error during query: {e}")
            return {
                'answer': f"An error occurred while processing your question: {str(e)}",
                'sources': []
            }

    def verify_data(self):
        """Verify database content"""
        conn = psycopg2.connect(DATABASE_URL)
        try:
            with conn.cursor() as cur:
                # Check documents
                cur.execute("SELECT COUNT(*) FROM documents")
                doc_count = cur.fetchone()[0]
                
                # Check chunks
                cur.execute("SELECT COUNT(*) FROM chunks")
                chunk_count = cur.fetchone()[0]
                
                # Check a sample chunk with embedding
                cur.execute("SELECT id, content, embedding FROM chunks LIMIT 1")
                sample_chunk = cur.fetchone()
                
                return {
                    'document_count': doc_count,
                    'chunk_count': chunk_count,
                    'sample_chunk': (sample_chunk[0], sample_chunk[1]) if sample_chunk else None
                }
        finally:
            conn.close()

def test_rag():
    """Test the RAG system"""
    rag = RAGQueryEngine()
    
    # First verify data
    print("\nVerifying database content:")
    stats = rag.verify_data()
    print(f"Documents: {stats['document_count']}")
    print(f"Chunks: {stats['chunk_count']}")
    print(f"Sample chunk: {stats['sample_chunk']}\n")
    
    # Try query
    question = "What are the main features of Python?"
    result = rag.query(question)
    
    print("\nFinal Result:")
    print(result)

def process_and_save_answer(question: str, save_to_file: bool = True) -> None:
    """
    Process a question through RAG and format the output nicely.
    Optionally save to answer.md file.
    """
    rag = RAGQueryEngine()
    result = rag.query(question)
    
    # Format the output
    output = f"""# Question & Answer

## Question
{question}

## Answer
{result['answer']}

## Sources Used
"""
    
    # Add sources with detailed information
    for idx, source in enumerate(result['sources'], 1):
        output += f"""
### Source {idx}
- **Document:** {source['document_title']}
- **Relevance Score:** {source['similarity']:.3f}
- **Content:** {source['content']}
- **Section:** {source['metadata']['section']}
- **Position:** {source['metadata']['position']['index']}
"""

    # Print to console
    print(output)
    
    # Save to file if requested
    if save_to_file:
        with open('answer.md', 'w') as f:
            f.write(output)
        print("\nAnswer has been saved to answer.md")

# Example usage:
if __name__ == "__main__":
    question = input("Enter your question: ")
    process_and_save_answer(question)
    
