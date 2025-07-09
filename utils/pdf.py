import io
from PyPDF2 import PdfReader
import fitz  # PyMuPDF pour extraction d'images
from PIL import Image
import numpy as np
import cv2
import base64

def extract_pdf_text_and_pages(pdf_bytes):
    """Extrait le texte des pages PDF (fonction existante)"""
    reader = PdfReader(io.BytesIO(pdf_bytes))
    pages = []
    for i, page in enumerate(reader.pages):
        text = page.extract_text() or ""
        pages.append({
            'page': i+1,
            'text': text.strip()
        })
    return pages

def extract_pdf_text_images_and_pages(pdf_bytes):
    """Extrait texte ET images des PDFs avec analyse des graphiques"""
    reader = PdfReader(io.BytesIO(pdf_bytes))
    pages = []
    
    # Utiliser PyMuPDF pour extraction d'images
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    
    for i, page in enumerate(reader.pages):
        text = page.extract_text() or ""
        
        # Extraction d'images de cette page
        images = extract_images_from_page(doc, i)
        
        pages.append({
            'page': i+1,
            'text': text.strip(),
            'images': images
        })
    
    doc.close()
    return pages

def extract_images_from_page(doc, page_num):
    """Extrait et analyse les images d'une page PDF"""
    try:
        page = doc[page_num]
        images = []
        
        # Récupère toutes les images de la page
        image_list = page.get_images()
        
        for img_index, img in enumerate(image_list):
            try:
                xref = img[0]
                pix = fitz.Pixmap(doc, xref)
                
                # Vérifier que l'image n'a pas de canal alpha
                if pix.n - pix.alpha < 4:
                    # Convertir en bytes JPEG
                    img_data = pix.tobytes("jpeg")
                    
                    # Analyser le type d'image
                    image_type = analyze_image_type(img_data)
                    
                    # Optimiser la taille pour l'API vision
                    optimized_data = optimize_image_for_vision(img_data)
                    
                    images.append({
                        'data': optimized_data,
                        'original_data': img_data,
                        'bbox': img[1:5],  # Position dans la page
                        'type': image_type,
                        'size': len(optimized_data),
                        'index': img_index
                    })
                
                pix = None  # Libérer la mémoire
                
            except Exception as e:
                print(f"Erreur extraction image {img_index} page {page_num}: {e}")
                continue
        
        return images
        
    except Exception as e:
        print(f"Erreur extraction page {page_num}: {e}")
        return []

def analyze_image_type(image_bytes):
    """Détecte si une image est probablement un graphique/chart"""
    try:
        # Convertir bytes en image PIL
        img = Image.open(io.BytesIO(image_bytes))
        
        # Convertir en array numpy pour analyse
        img_array = np.array(img)
        
        # Métriques pour détection de graphiques
        metrics = calculate_chart_metrics(img_array)
        
        # Score de probabilité que ce soit un graphique
        chart_score = calculate_chart_probability(metrics)
        
        if chart_score > 0.6:
            return 'chart'
        elif chart_score > 0.3:
            return 'possible_chart'
        else:
            return 'image'
            
    except Exception as e:
        print(f"Erreur analyse type image: {e}")
        return 'image'

def calculate_chart_metrics(img_array):
    """Calcule des métriques pour détecter les graphiques"""
    try:
        # Convertir en niveaux de gris si nécessaire
        if len(img_array.shape) == 3:
            gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
        else:
            gray = img_array
        
        metrics = {}
        
        # 1. Densité de pixels non-blancs
        non_white_pixels = np.sum(gray < 240)
        total_pixels = gray.size
        metrics['density'] = non_white_pixels / total_pixels
        
        # 2. Variance des couleurs (graphiques = couleurs variées)
        if len(img_array.shape) == 3:
            color_variance = np.var(img_array, axis=(0, 1))
            metrics['color_variance'] = np.mean(color_variance)
        else:
            metrics['color_variance'] = np.var(gray)
        
        # 3. Détection de lignes droites (axes de graphiques)
        edges = cv2.Canny(gray, 50, 150)
        lines = cv2.HoughLines(edges, 1, np.pi/180, threshold=50)
        metrics['line_count'] = len(lines) if lines is not None else 0
        
        # 4. Détection de rectangles (barres de graphiques)
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        rect_count = 0
        for contour in contours:
            if len(contour) >= 4:
                rect = cv2.minAreaRect(contour)
                if rect[1][0] > 10 and rect[1][1] > 10:  # Taille minimale
                    rect_count += 1
        metrics['rectangle_count'] = rect_count
        
        return metrics
        
    except Exception as e:
        print(f"Erreur calcul métriques: {e}")
        return {'density': 0, 'color_variance': 0, 'line_count': 0, 'rectangle_count': 0}

def calculate_chart_probability(metrics):
    """Calcule la probabilité que l'image soit un graphique"""
    score = 0
    
    # Densité de pixels (graphiques = pas trop denses)
    if 0.1 < metrics['density'] < 0.8:
        score += 0.3
    
    # Variance des couleurs (graphiques = couleurs variées)
    if metrics['color_variance'] > 1000:
        score += 0.2
    
    # Présence de lignes (axes de graphiques)
    if metrics['line_count'] > 2:
        score += 0.3
    
    # Présence de rectangles (barres)
    if metrics['rectangle_count'] > 3:
        score += 0.2
    
    return min(score, 1.0)

def optimize_image_for_vision(image_bytes, max_size_kb=800):
    """Optimise une image pour l'API vision"""
    try:
        img = Image.open(io.BytesIO(image_bytes))
        
        # Redimensionner si trop grand
        max_dimension = 1200
        if max(img.size) > max_dimension:
            img.thumbnail((max_dimension, max_dimension), Image.Resampling.LANCZOS)
        
        # Compression progressive
        for quality in [90, 85, 80, 75]:
            buffer = io.BytesIO()
            img.save(buffer, format='JPEG', quality=quality, optimize=True)
            compressed_data = buffer.getvalue()
            
            if len(compressed_data) <= max_size_kb * 1024:
                return compressed_data
        
        # Si toujours trop gros, compression plus agressive
        img.thumbnail((800, 800), Image.Resampling.LANCZOS)
        buffer = io.BytesIO()
        img.save(buffer, format='JPEG', quality=70, optimize=True)
        return buffer.getvalue()
        
    except Exception as e:
        print(f"Erreur optimisation image: {e}")
        return image_bytes

def get_image_base64(image_bytes):
    """Convertit une image en base64 pour l'API"""
    try:
        return base64.b64encode(image_bytes).decode('utf-8')
    except Exception as e:
        print(f"Erreur conversion base64: {e}")
        return None 