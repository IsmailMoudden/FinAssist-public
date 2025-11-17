#!/usr/bin/env python3
"""
Script de test pour la fonctionnalité Vision de FinAssist
"""

import os
import sys
import time
from pathlib import Path
from dotenv import load_dotenv

CURRENT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = CURRENT_DIR.parent
ROOT_DIR = CURRENT_DIR.parent.parent
STATIC_DIR = ROOT_DIR / "static"

# Assurer que backend et la racine sont dans le PYTHONPATH
sys.path.insert(0, str(BACKEND_DIR))
sys.path.insert(0, str(ROOT_DIR))

load_dotenv()

def test_vision_imports():
    """Test des imports de vision"""
    print("🧪 Test des imports...")
    
    try:
        from utils.vision import describe_image, describe_chart, describe_table, get_vision_stats
        print("✅ Imports vision OK")
        return True
    except Exception as e:
        print(f"❌ Erreur imports vision: {e}")
        return False

def test_pdf_imports():
    """Test des imports PDF"""
    print("🧪 Test des imports PDF...")
    
    try:
        from utils.pdf import extract_pdf_text_images_and_pages, analyze_image_type
        print("✅ Imports PDF OK")
        return True
    except Exception as e:
        print(f"❌ Erreur imports PDF: {e}")
        return False

def test_vision_api():
    """Test de l'API vision avec une image simple"""
    print("🧪 Test API vision...")
    
    try:
        from utils.vision import describe_image
        from PIL import Image
        import io
        
        # Créer une image de test simple
        img = Image.new('RGB', (100, 100), color='red')
        buffer = io.BytesIO()
        img.save(buffer, format='JPEG')
        image_bytes = buffer.getvalue()
        
        # Test de l'API
        result = describe_image(image_bytes)
        print(f"✅ API vision OK - Résultat: {result[:100]}...")
        return True
        
    except Exception as e:
        print(f"❌ Erreur API vision: {e}")
        return False

def test_pdf_extraction():
    """Test de l'extraction PDF avec images"""
    print("🧪 Test extraction PDF...")
    
    try:
        from utils.pdf import extract_pdf_text_images_and_pages
        
        # Vérifier si un PDF de test existe
        test_pdf_path = STATIC_DIR / "financial-analysis.pdf"
        if os.path.exists(test_pdf_path):
            with open(test_pdf_path, 'rb') as f:
                pdf_bytes = f.read()
            
            pages = extract_pdf_text_images_and_pages(pdf_bytes)
            print(f"✅ Extraction PDF OK - {len(pages)} pages")
            
            # Compter les images
            total_images = sum(len(p.get('images', [])) for p in pages)
            print(f"📊 Images trouvées: {total_images}")
            
            return True
        else:
            print("⚠️ Pas de PDF de test trouvé, skip test")
            return True
            
    except Exception as e:
        print(f"❌ Erreur extraction PDF: {e}")
        return False

def test_vision_stats():
    """Test des statistiques vision"""
    print("🧪 Test stats vision...")
    
    try:
        from utils.vision import get_vision_stats
        
        stats = get_vision_stats()
        print(f"✅ Stats vision OK: {stats}")
        return True
        
    except Exception as e:
        print(f"❌ Erreur stats vision: {e}")
        return False

def main():
    """Fonction principale de test"""
    print("🚀 Test de la fonctionnalité Vision FinAssist")
    print("=" * 50)
    
    tests = [
        test_vision_imports,
        test_pdf_imports,
        test_vision_api,
        test_pdf_extraction,
        test_vision_stats
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        try:
            if test():
                passed += 1
        except Exception as e:
            print(f"❌ Erreur inattendue dans {test.__name__}: {e}")
    
    print("\n" + "=" * 50)
    print(f"📊 Résultats: {passed}/{total} tests passés")
    
    if passed == total:
        print("🎉 Tous les tests sont passés ! Vision prête à l'emploi.")
    else:
        print("⚠️ Certains tests ont échoué. Vérifiez les dépendances.")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 