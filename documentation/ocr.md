# OCR (Text Recognition)

## File: `utils/ocr.py`

### Purpose
Extract text from image inputs such as PNG or JPEG files by relying on Tesseract OCR so the textual output can be injected into the broader document analysis flow.

### Implementation
- Uses the Python libraries `pytesseract` (a Tesseract wrapper) and `Pillow` for image decoding.
- Core function:
  ```python
  def ocr_image(image_bytes):
      image = Image.open(io.BytesIO(image_bytes))
      text = pytesseract.image_to_string(image, lang='eng')
      return text.strip() or "No text detected in the image."
  ```
- Accepts raw image bytes (for example, an uploaded file or a page extracted from a PDF).
- Returns the detected text or a fallback message when nothing can be extracted.

### Technical Notes
- OCR language defaults to English (`lang='eng'`) but can be adjusted.
- Pillow handles decoding errors gracefully.
- The function can be invoked directly by the Flask API for uploaded images.

### Current Limitations
- Extraction quality depends on the input image and the installed Tesseract model.
- No image enhancement pipeline (binarization, rotation, denoising) is enabled yet.

### Potential Improvements
- Automatic language detection.
- Image pre/post-processing with OpenCV.
- Multi-page support (for example multi-page TIFF).
- Advanced OCR backends such as Donut, TrOCR, or PaddleOCR for complex financial layouts.