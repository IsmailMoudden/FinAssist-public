from PIL import Image
import pytesseract
import io

def ocr_image(image_bytes):
    image = Image.open(io.BytesIO(image_bytes))
    text = pytesseract.image_to_string(image, lang='eng')
    return text.strip() or "No text detected in the image." 