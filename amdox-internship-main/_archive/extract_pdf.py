from pypdf import PdfReader
import sys

def extract():
    reader = PdfReader('Amdox Web2.pdf')
    text = ""
    for i, page in enumerate(reader.pages):
        text += f"\n--- PAGE {i+1} ---\n"
        text += page.extract_text()
    
    with open('pdf_content.txt', 'w', encoding='utf-8') as f:
        f.write(text)

if __name__ == "__main__":
    extract()
