import io
from PyPDF2 import PdfReader

def extract_pdf_text_and_pages(pdf_bytes):
    """Extrait le texte des pages PDF"""
    reader = PdfReader(io.BytesIO(pdf_bytes))
    pages = []
    for i, page in enumerate(reader.pages):
        text = page.extract_text() or ""
        pages.append({
            'page': i+1,
            'text': text.strip()
        })
    return pages 