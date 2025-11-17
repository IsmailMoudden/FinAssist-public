# PDF Extraction

## File: `utils/pdf.py`

### Purpose
Extract the text of every page contained in a PDF document so the content can be indexed, analyzed, and used for question answering across financial files.

### Implementation
- Relies on the `PyPDF2` library to parse PDF files.
- Core function:
  ```python
  def extract_pdf_text_and_pages(pdf_bytes):
      reader = PdfReader(io.BytesIO(pdf_bytes))
      pages = []
      for i, page in enumerate(reader.pages):
          text = page.extract_text() or ""
          pages.append({
              'page': i+1,
              'text': text.strip()
          })
      return pages
  ```
- Accepts raw PDF bytes originating from uploaded files or static assets.
- Returns a list of dictionaries `{page: number, text: content}` for each page.

### Technical Notes
- Handles large, multi-page PDFs.
- Uses `extract_text()` which works for most text-based PDFs (not scanned images).
- Integrates with the Flask API to produce structured content prior to LLM calls.

### Current Limitations
- Scanned PDFs are not supported; they must be routed through OCR first.
- Output quality depends on the document structure and the availability of text layers.
- Image, table, and metadata extraction are not covered in the current version.

### Potential Improvements
- Automatic detection of scanned pages with OCR fallback.
- Table extraction via libraries such as Camelot or Tabula.
- Metadata, bookmarks, and annotation extraction.
- Support for password-protected PDFs.