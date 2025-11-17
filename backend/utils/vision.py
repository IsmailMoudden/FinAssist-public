import requests
import base64
import hashlib
import json
import time
import os
from pathlib import Path
from PIL import Image
import io
from functools import lru_cache
from typing import Dict, List, Optional

# Configuration
OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY')
BASE_DIR = Path(__file__).resolve().parent.parent
VISION_CACHE_FILE = BASE_DIR / 'vision_cache.json'
MAX_RETRIES = 3
REQUEST_TIMEOUT = 30

class VisionAnalyzer:
    def __init__(self):
        self.cache = self._load_cache()
        self.api_calls_count = 0
        self.api_calls_cost = 0  
    
    def _load_cache(self) -> Dict:
        """Charge le cache depuis le fichier"""
        try:
            if os.path.exists(VISION_CACHE_FILE):
                with open(VISION_CACHE_FILE, 'r') as f:
                    return json.load(f)
        except Exception as e:
            print(f"Erreur chargement cache: {e}")
        return {}
    
    def _save_cache(self):
        """Sauvegarde le cache dans le fichier"""
        try:
            with open(VISION_CACHE_FILE, 'w') as f:
                json.dump(self.cache, f, indent=2)
        except Exception as e:
            print(f"Erreur sauvegarde cache: {e}")
    
    def _get_cache_key(self, image_bytes: bytes) -> str:
        """Génère une clé de cache basée sur le hash de l'image"""
        return hashlib.md5(image_bytes).hexdigest()
    
    def describe_image(self, image_bytes: bytes, context: str = "") -> str:
        """Analyse une image avec cache et gestion d'erreurs robuste"""
        try:
            # Vérifier le cache
            cache_key = self._get_cache_key(image_bytes)
            if cache_key in self.cache:
                print(f"📋 Cache hit pour image {cache_key[:8]}...")
                return self.cache[cache_key]['result']
            
            # Optimiser l'image
            optimized_image = self._optimize_image_for_api(image_bytes)
            if not optimized_image:
                return "❌ Erreur: Impossible d'optimiser l'image"
            
            # Appel API avec retry
            result = self._call_vision_api_with_retry(optimized_image, context)
            
            # Mettre en cache
            self.cache[cache_key] = {
                'result': result,
                'timestamp': time.time(),
                'size': len(image_bytes)
            }
            self._save_cache()
            
            return result
            
        except Exception as e:
            print(f"Erreur analyse vision: {e}")
            return f"❌ Erreur analyse vision: {str(e)}"
    
    def describe_chart(self, image_bytes: bytes) -> str:
        """Analyse spécialisée pour les graphiques/charts"""
        chart_prompt = """
        Analyse ce graphique financier en détail. Focus sur :
        1. Type de graphique (barres, ligne, circulaire, etc.)
        2. Données principales visibles
        3. Tendances et patterns
        4. Valeurs numériques importantes
        5. Insights financiers pertinents
        
        Réponds en français de manière structurée avec des emojis pour la lisibilité.
        """
        
        return self.describe_image(image_bytes, chart_prompt)
    
    def describe_table(self, image_bytes: bytes) -> str:
        """Analyse spécialisée pour les tableaux"""
        table_prompt = """
        Analyse ce tableau de données financières. Extrais :
        1. Structure du tableau (colonnes, lignes)
        2. Données numériques importantes
        3. Métriques financières (ROI, NAV, etc.)
        4. Tendances temporelles si applicable
        5. Points clés à retenir
        
        Présente les données de manière claire et structurée.
        """
        
        return self.describe_image(image_bytes, table_prompt)
    
    def _optimize_image_for_api(self, image_bytes: bytes, max_size_kb: int = 800) -> Optional[bytes]:
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
                    print(f"✅ Image optimisée: {len(image_bytes)} -> {len(compressed_data)} bytes")
                    return compressed_data
            
            # Compression plus agressive si nécessaire
            img.thumbnail((800, 800), Image.Resampling.LANCZOS)
            buffer = io.BytesIO()
            img.save(buffer, format='JPEG', quality=70, optimize=True)
            return buffer.getvalue()
            
        except Exception as e:
            print(f"Erreur optimisation image: {e}")
            return None
    
    def _call_vision_api_with_retry(self, image_bytes: bytes, context: str = "") -> str:
        """Appel API vision avec retry et gestion d'erreurs"""
        base64_image = base64.b64encode(image_bytes).decode('utf-8')
        
        # Prompt par défaut si pas de contexte
        if not context:
            context = """
            Analyse cette image de document financier. Focus sur :
            1. Type de contenu (graphique, tableau, texte, etc.)
            2. Données et métriques importantes
            3. Tendances et insights
            4. Contexte financier
            
            Réponds en français de manière structurée et professionnelle.
            """
        
        headers = {
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": "anthropic/claude-3-5-sonnet",
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": context},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}"
                            }
                        }
                    ]
                }
            ],
            "max_tokens": 1000
        }
        
        for attempt in range(MAX_RETRIES):
            try:
                print(f"🔄 Appel API vision (tentative {attempt + 1}/{MAX_RETRIES})...")
                
                response = requests.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    headers=headers,
                    json=data,
                    timeout=REQUEST_TIMEOUT
                )
                
                if response.status_code == 200:
                    result = response.json()['choices'][0]['message']['content']
                    self.api_calls_count += 1
                    print(f"✅ API vision réussie (appel #{self.api_calls_count})")
                    return result
                else:
                    print(f"❌ Erreur API: {response.status_code} - {response.text}")
                    if attempt < MAX_RETRIES - 1:
                        time.sleep(2 ** attempt)  # Backoff exponentiel
                        continue
                    else:
                        return f"❌ Erreur API après {MAX_RETRIES} tentatives: {response.text}"
                        
            except requests.exceptions.Timeout:
                print(f"⏰ Timeout API (tentative {attempt + 1})")
                if attempt < MAX_RETRIES - 1:
                    time.sleep(2 ** attempt)
                    continue
                else:
                    return "❌ Timeout API après plusieurs tentatives"
                    
            except Exception as e:
                print(f"❌ Erreur inattendue: {e}")
                if attempt < MAX_RETRIES - 1:
                    time.sleep(2 ** attempt)
                    continue
                else:
                    return f"❌ Erreur inattendue: {str(e)}"
        
        return "❌ Échec de l'analyse vision"
    
    def get_stats(self) -> Dict:
        """Retourne les statistiques d'utilisation"""
        return {
            'api_calls': self.api_calls_count,
            'cache_size': len(self.cache),
            'cache_hits': sum(1 for v in self.cache.values() if 'result' in v)
        }
    
    def clear_cache(self):
        """Vide le cache"""
        self.cache = {}
        self._save_cache()
        print("🗑️ Cache vision vidé")
    
    def force_new_analysis(self, image_bytes: bytes, context: str = "") -> str:
        """Force une nouvelle analyse en ignorant le cache"""
        try:
            # Optimiser l'image
            optimized_image = self._optimize_image_for_api(image_bytes)
            if not optimized_image:
                return "❌ Erreur: Impossible d'optimiser l'image"
            
            # Appel API avec retry
            result = self._call_vision_api_with_retry(optimized_image, context)
            
            # Mettre en cache le nouveau résultat
            cache_key = self._get_cache_key(image_bytes)
            self.cache[cache_key] = {
                'result': result,
                'timestamp': time.time(),
                'size': len(image_bytes)
            }
            self._save_cache()
            
            return result
            
        except Exception as e:
            print(f"Erreur analyse vision forcée: {e}")
            return f"❌ Erreur analyse vision: {str(e)}"

# Instance globale
vision_analyzer = VisionAnalyzer()

# Fonctions d'interface pour compatibilité
def describe_image(image_bytes: bytes) -> str:
    """Interface simple pour analyse d'image"""
    return vision_analyzer.describe_image(image_bytes)

def describe_chart(image_bytes: bytes) -> str:
    """Interface pour analyse de graphiques"""
    return vision_analyzer.describe_chart(image_bytes)

def describe_table(image_bytes: bytes) -> str:
    """Interface pour analyse de tableaux"""
    return vision_analyzer.describe_table(image_bytes)

def get_vision_stats() -> Dict:
    """Retourne les stats de vision"""
    return vision_analyzer.get_stats()

def force_new_vision_analysis(image_bytes: bytes) -> str:
    """Force une nouvelle analyse vision en ignorant le cache"""
    return vision_analyzer.force_new_analysis(image_bytes)

def clear_vision_cache():
    """Vide le cache vision"""
    vision_analyzer.clear_cache() 