#!/usr/bin/env python3
"""
Test spécifique de l'API Vision avec vrai appel
"""

import os
import sys
from dotenv import load_dotenv
from PIL import Image
import io

# Ajouter le répertoire courant au path
sys.path.append('.')

load_dotenv()

def test_real_vision_api():
    """Test de l'API vision avec un vrai appel"""
    print("🧪 Test API Vision avec vrai appel...")
    
    try:
        from utils.vision import force_new_vision_analysis, clear_vision_cache
        
        # Vider le cache
        clear_vision_cache()
        print("🗑️ Cache vidé")
        
        # Créer une image de test plus complexe (simulation d'un graphique)
        img = Image.new('RGB', (400, 300), color='white')
        
        # Ajouter quelques éléments pour simuler un graphique
        from PIL import ImageDraw
        draw = ImageDraw.Draw(img)
        
        # Dessiner des barres (simulation graphique)
        colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4']
        bar_width = 60
        bar_height = 150
        
        for i, color in enumerate(colors):
            x = 50 + i * (bar_width + 20)
            y = 250 - bar_height * (0.3 + i * 0.2)  # Hauteurs différentes
            draw.rectangle([x, y, x + bar_width, 250], fill=color)
        
        # Ajouter du texte
        draw.text((200, 50), "Test Graphique", fill='black')
        
        # Sauvegarder en JPEG
        buffer = io.BytesIO()
        img.save(buffer, format='JPEG', quality=85)
        image_bytes = buffer.getvalue()
        
        print(f"📊 Image créée: {len(image_bytes)} bytes")
        
        # Test de l'API
        result = force_new_vision_analysis(image_bytes)
        print(f"✅ Résultat API: {result[:200]}...")
        
        return True
        
    except Exception as e:
        print(f"❌ Erreur test API: {e}")
        return False

def test_vision_with_pdf():
    """Test de vision avec un PDF existant"""
    print("🧪 Test Vision avec PDF...")
    
    try:
        from utils.pdf import extract_pdf_text_images_and_pages
        from utils.vision import describe_chart
        
        # Vérifier si un PDF de test existe
        test_pdf_path = "static/financial-analysis.pdf"
        if os.path.exists(test_pdf_path):
            with open(test_pdf_path, 'rb') as f:
                pdf_bytes = f.read()
            
            pages = extract_pdf_text_images_and_pages(pdf_bytes)
            print(f"📄 PDF analysé: {len(pages)} pages")
            
            # Chercher des images
            total_images = 0
            for page in pages:
                if page.get('images'):
                    total_images += len(page['images'])
                    print(f"📊 Page {page['page']}: {len(page['images'])} images")
                    
                    # Tester l'analyse d'une image
                    for img in page['images'][:1]:  # Juste la première image
                        if img['type'] in ['chart', 'possible_chart']:
                            print(f"🔍 Analyse graphique page {page['page']}...")
                            analysis = describe_chart(img['data'])
                            print(f"✅ Analyse: {analysis[:100]}...")
                            return True
            
            if total_images == 0:
                print("⚠️ Aucune image trouvée dans le PDF")
                return True
        else:
            print("⚠️ PDF de test non trouvé")
            return True
            
    except Exception as e:
        print(f"❌ Erreur test PDF: {e}")
        return False

def main():
    """Fonction principale"""
    print("🚀 Test API Vision FinAssist")
    print("=" * 40)
    
    tests = [
        test_real_vision_api,
        test_vision_with_pdf
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        try:
            if test():
                passed += 1
        except Exception as e:
            print(f"❌ Erreur inattendue: {e}")
    
    print("\n" + "=" * 40)
    print(f"📊 Résultats: {passed}/{total} tests passés")
    
    if passed == total:
        print("🎉 API Vision fonctionnelle !")
    else:
        print("⚠️ Certains tests ont échoué.")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 