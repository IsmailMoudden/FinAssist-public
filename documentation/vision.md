# Vision (Description d'image)

## Fichier : `utils/vision.py`

### Fonctionnalité
Analyse robuste d'images avec cache intelligent et gestion d'erreurs avancée. Permet d'obtenir des descriptions détaillées de graphiques, tableaux et images dans les documents financiers.

### Implémentation robuste

#### **Classe VisionAnalyzer**
```python
class VisionAnalyzer:
    def __init__(self):
        self.cache = self._load_cache()
        self.api_calls_count = 0
```

#### **Fonctions principales**
- `describe_image(image_bytes)` : Analyse générale d'image
- `describe_chart(image_bytes)` : Analyse spécialisée pour graphiques
- `describe_table(image_bytes)` : Analyse spécialisée pour tableaux
- `get_vision_stats()` : Statistiques d'utilisation

### Fonctionnalités avancées

#### **1. Cache intelligent**
- Sauvegarde automatique des résultats dans `vision_cache.json`
- Évite les appels API répétés pour les mêmes images
- Gestion de la mémoire optimisée

#### **2. Optimisation d'images**
- Compression progressive (90% → 70% qualité)
- Redimensionnement automatique (max 1200px)
- Taille maximale : 800KB pour l'API

#### **3. Gestion d'erreurs robuste**
- Retry automatique (3 tentatives)
- Backoff exponentiel
- Fallback vers OCR si échec
- Timeout configurable (30s)

#### **4. Détection de type d'image**
```python
def analyze_image_type(image_bytes):
    # Détecte si chart, possible_chart, ou image
    # Utilise OpenCV pour analyse de métriques
```

### Intégration dans le pipeline

#### **Extraction PDF avec images**
```python
# utils/pdf.py
def extract_pdf_text_images_and_pages(pdf_bytes):
    # Extrait texte ET images des PDFs
    # Analyse automatique du type d'image
    # Optimisation pour l'API vision
```

#### **Analyse dans app.py**
```python
# Pour chaque image trouvée dans le PDF
if img_data['type'] == 'chart':
    analysis = describe_chart(img_data['data'])
    return f"📊 [Graphique page {page_num}] {analysis}"
```

### Types d'analyse spécialisés

#### **📊 Graphiques (Charts)**
- Détection automatique via métriques OpenCV
- Analyse des barres, lignes, circulaires
- Extraction des tendances et valeurs
- Focus sur insights financiers

#### **📋 Tableaux**
- Détection de lignes horizontales/verticales
- Extraction de données structurées
- Métriques financières (ROI, NAV, etc.)

#### **🖼️ Images générales**
- Description contextuelle
- Éléments visuels importants
- Contexte financier

### Métriques de performance

#### **Détection de graphiques**
```python
def calculate_chart_metrics(img_array):
    # Densité de pixels non-blancs
    # Variance des couleurs
    # Nombre de lignes droites (axes)
    # Nombre de rectangles (barres)
```

#### **Score de probabilité**
- `> 0.6` : Chart confirmé
- `> 0.3` : Possible chart
- `< 0.3` : Image générale

### Configuration

#### **Variables d'environnement**
```bash
OPENROUTER_API_KEY=your_api_key
```

#### **Paramètres configurables**
```python
MAX_RETRIES = 3
REQUEST_TIMEOUT = 30
VISION_CACHE_FILE = 'vision_cache.json'
```

### Endpoints API

#### **GET /vision/stats**
Retourne les statistiques d'utilisation :
```json
{
    "api_calls": 15,
    "cache_size": 8,
    "cache_hits": 3
}
```

### Exemples d'utilisation

#### **Question : "Que montrent les graphiques ?"**
```
📊 **Analyse des graphiques :**

**Graphique 1 (page 3) :**
- Type : Graphique en barres
- Données : Revenus trimestriels Q1-Q4 2023
- Tendance : Croissance de 15% Q1 à Q4
- Point clé : Q4 montre une accélération de +8% vs Q3

**Graphique 2 (page 5) :**
- Type : Graphique circulaire
- Données : Répartition des investissements
- Insights : Tech (45%), Finance (30%), Healthcare (25%)
```

### Améliorations futures

#### **1. Modèles locaux**
- Intégration BLIP-2 pour analyse offline
- Réduction des coûts API
- Confidentialité renforcée

#### **2. Analyse avancée**
- Reconnaissance de logos d'entreprises
- Détection de signatures
- Extraction de données tabulaires

#### **3. Optimisations**
- Cache Redis pour performance
- Compression d'images plus intelligente
- Parallélisation des analyses

### Tests

#### **Script de test**
```bash
python test_vision.py
```

#### **Tests inclus**
- ✅ Imports des modules
- ✅ API vision fonctionnelle
- ✅ Extraction PDF avec images
- ✅ Statistiques de vision
- ✅ Cache intelligent

### Monitoring

#### **Logs détaillés**
```
📄 Traitement fichier: financial-report.pdf
🔍 Extraction PDF avec images...
📊 Analyse de 3 images page 2...
✅ Image optimisée: 245760 -> 156432 bytes
🔄 Appel API vision (tentative 1/3)...
✅ API vision réussie (appel #15)
```

#### **Métriques de performance**
- Temps de traitement par fichier
- Nombre d'images analysées
- Taux de cache hit
- Coût API estimé 