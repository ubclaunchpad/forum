"""Example script demonstrating RAG system workflow with biology content."""
import time
from datetime import datetime
from pathlib import Path
from typing import Dict

from core.processors.document_processor import DocumentProcessor
from core.pipelines.doc_query_engine import DocumentQueryEngine

# Sample documents - University level biology content
SAMPLE_DOCS = [
    {
        "title": "Cell Signaling Pathways",
        "content": """Signal transduction pathways are essential cellular communication mechanisms. 
        G protein-coupled receptors (GPCRs) represent the largest family of membrane receptors. When activated, 
        GPCRs undergo conformational changes that trigger the exchange of GDP for GTP on the associated G protein's 
        alpha subunit. This leads to its dissociation from the beta-gamma complex and subsequent activation of 
        downstream effector proteins. The process is terminated when GTP is hydrolyzed back to GDP through the 
        alpha subunit's intrinsic GTPase activity. Second messenger systems, particularly cyclic AMP and calcium 
        signaling, play crucial roles in amplifying these initial signals.""",
        "type": "text"
    },
    {
        "title": "Oxidative Phosphorylation",
        "content": """Oxidative phosphorylation occurs in the mitochondrial inner membrane through the electron 
        transport chain (ETC). The ETC consists of four major protein complexes: NADH dehydrogenase (Complex I), 
        succinate dehydrogenase (Complex II), cytochrome bc1 complex (Complex III), and cytochrome c oxidase 
        (Complex IV). These complexes transfer electrons from NADH and FADH2 to oxygen while pumping protons into 
        the intermembrane space. This creates a proton gradient that drives ATP synthesis through ATP synthase 
        (Complex V). The P/O ratio indicates the efficiency of this process, with approximately 2.5 ATP molecules 
        produced per oxygen atom reduced.""",
        "type": "text"
    },
    {
        "title": "Epigenetic Regulation",
        "content": """Epigenetic modifications alter gene expression without changing DNA sequence. DNA methylation, 
        occurring primarily at CpG islands, typically represses gene transcription when present in promoter regions. 
        Histone modifications include acetylation, methylation, phosphorylation, and ubiquitination. Histone 
        acetylation generally promotes gene expression by loosening chromatin structure, while methylation can 
        either activate or repress genes depending on the specific residue modified and the degree of methylation. 
        These modifications create a complex 'histone code' that regulates chromatin accessibility and transcription.""",
        "type": "text"
    },
    {
        "title": "Immune System Signaling",
        "content": """T cell activation requires multiple signaling events. The first signal comes from T cell 
        receptor (TCR) recognition of peptide-MHC complexes. The second signal involves costimulatory molecules, 
        primarily CD28 binding to B7 proteins on antigen-presenting cells. These signals trigger a cascade involving 
        protein tyrosine kinases, particularly ZAP-70, leading to activation of transcription factors like NFAT 
        and NF-κB. This results in production of interleukin-2 and other cytokines. The immunological synapse 
        forms at the T cell-APC interface, organizing receptors and signaling molecules into distinct supramolecular 
        activation clusters.""",
        "type": "text"
    },
    {
        "title": "Neurotransmitter Release",
        "content": """Synaptic vesicle exocytosis is a highly regulated process requiring multiple protein 
        interactions. SNARE proteins, including synaptobrevin, SNAP-25, and syntaxin, form a complex that brings 
        vesicles close to the presynaptic membrane. Calcium influx through voltage-gated channels triggers 
        synaptotagmin to bind phospholipids and promote membrane fusion. The process is modulated by numerous 
        proteins including Munc18, complexin, and Rab3. After release, vesicles are recycled through multiple 
        pathways including clathrin-mediated endocytosis and kiss-and-run fusion.""",
        "type": "text"
    },
    {
        "title": "Plant Hormone Signaling",
        "content": """Auxin signaling involves the TIR1/AFB family of F-box proteins acting as receptors. 
        In the presence of auxin, these proteins target Aux/IAA transcriptional repressors for ubiquitin-mediated 
        degradation, releasing ARF transcription factors to regulate gene expression. Gibberellin signaling operates 
        through the GID1 receptor, which upon binding gibberellin, promotes degradation of DELLA proteins that 
        normally repress growth. These pathways demonstrate how plant hormones often act by relieving 
        transcriptional repression.""",
        "type": "text"
    }
]

# Test queries for biology content
TEST_QUERIES = [
    "How does oxidative phosphorylation generate ATP?",
    "Explain the role of SNARE proteins in neurotransmitter release.",
    "What are the main mechanisms of epigenetic regulation?",
    "How do T cells become activated through signaling pathways?",
]

class Timer:
    """Simple context manager for timing operations."""
    def __init__(self, description):
        self.description = description
        
    def __enter__(self):
        self.start = time.time()
        return self
        
    def __exit__(self, *args):
        self.end = time.time()
        self.duration = self.end - self.start
        print(f"{self.description}: {self.duration:.2f} seconds")

def save_output(content: str, filename: str, output_dir: str = "examples/outputs") -> None:
    """Save content to a file in the outputs directory."""
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    
    with open(output_path / filename, 'w', encoding='utf-8') as f:
        f.write(content)

def format_answer(query: str, result: Dict, duration: float) -> str:
    """Format query result for output file."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    return f"""Query Time: {timestamp}
Query Duration: {duration:.2f} seconds

Question:
{query}

Answer:
{result['answer']}

Sources Used:
{'-' * 50}
{chr(10).join(f'Document: {source["document_title"]}\nRelevance: {source["similarity"]:.3f}\nContent: {source["content"]}\n'
              for source in result['sources'])}
"""

def main():
    """Run the RAG example workflow."""
    print("Starting RAG example workflow...")
    print("-" * 50)
    
    # Initialize processors
    doc_processor = DocumentProcessor()
    query_engine = DocumentQueryEngine()
    
    # Track document IDs
    doc_ids = []
    
    try:
        # Process and store documents
        with Timer("Document processing and storage"):
            for doc in SAMPLE_DOCS:
                doc_id = doc_processor.ingest_document(
                    default_props={
                        "source": "example",
                        "date_added": datetime.now().isoformat(),
                        "subject": "biology",
                        "level": "university"
                    },
                    document=doc["content"],
                    title=doc["title"],
                    strategy_type=doc["type"]
                )
                doc_ids.append(doc_id)
                print(f"Stored document: {doc['title']} (ID: {doc_id})")
        
        # Verify database state
        print("\nDatabase State:")
        print("-" * 50)
        stats = query_engine.verify_database()
        print(f"Total Documents: {stats['document_count']}")
        print(f"Total Chunks: {stats['chunk_count']}")
        
        # Run test queries
        print("\nRunning Test Queries:")
        print("-" * 50)
        
        query_times = []
        for i, query in enumerate(TEST_QUERIES, 1):
            print(f"\nProcessing query {i}: {query}")
            
            with Timer(f"Query {i} processing") as t:
                result = query_engine.query(query)
            
            query_times.append(t.duration)
            
            # Save output
            output = format_answer(query, result, t.duration)
            save_output(output, f"query_{i}_result.txt")
            print(f"Saved result to examples/outputs/query_{i}_result.txt")
        
        # Print timing summary
        print("\nTiming Summary:")
        print("-" * 50)
        print(f"Average query time: {sum(query_times) / len(query_times):.2f} seconds")
        print(f"Fastest query: {min(query_times):.2f} seconds")
        print(f"Slowest query: {max(query_times):.2f} seconds")
        
    finally:
        # Cleanup - delete test documents
        print("\nCleaning up...")
        with Timer("Cleanup"):
            conn = doc_processor.conn
            cur = doc_processor.cur
            
            try:
                for doc_id in doc_ids:
                    # Delete related records first
                    cur.execute("DELETE FROM chunk_relations WHERE source_chunk_id IN (SELECT id FROM chunks WHERE document_id = %s)", (doc_id,))
                    cur.execute("DELETE FROM chunks WHERE document_id = %s", (doc_id,))
                    cur.execute("DELETE FROM document_versions WHERE document_id = %s", (doc_id,))
                    cur.execute("DELETE FROM documents WHERE id = %s", (doc_id,))
                conn.commit()
                print(f"Deleted {len(doc_ids)} test documents and related records")
                
            except Exception as e:
                conn.rollback()
                print(f"Error during cleanup: {e}")
                raise
            
            finally:
                cur.close()
                conn.close()

if __name__ == "__main__":
    main()