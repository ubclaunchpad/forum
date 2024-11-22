import fitz  # PyMuPDF library for PDF parsing
import os

def parse_pdf_to_text(file_path):
    """Extracts text from a PDF file and returns it as a string."""
    text = ""
    try:
        with fitz.open(file_path) as pdf:
            for page_num in range(pdf.page_count):
                page = pdf[page_num]
                text += page.get_text("text")  # Extracts text from each page
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
    return text

def read_and_parse_pdfs(folder_path="Files"):
    """Reads all PDFs in a specified folder and parses each to text."""
    all_texts = {}
    for filename in os.listdir(folder_path):
        if filename.lower().endswith(".pdf"):
            file_path = os.path.join(folder_path, filename)
            print(f"Parsing {filename}...")
            pdf_text = parse_pdf_to_text(file_path)
            all_texts[filename] = pdf_text
    return all_texts

if __name__ == "__main__":
    # Parse all PDFs in the Files folder and store their texts in a dictionary
    pdf_texts = read_and_parse_pdfs()

    # Display the extracted text for each file
    for filename, text in pdf_texts.items():
        print(f"\n--- Content of {filename} ---\n")
        sentences = text.split("\n")
        print(sentences) 