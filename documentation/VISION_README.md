# 🎯 Vision FinAssist - Analyse d'Images Intelligente

## Vue d'ensemble

La fonctionnalité **Vision** de FinAssist permet d'analyser automatiquement les images, graphiques et tableaux dans vos documents financiers. Elle utilise l'IA pour extraire des insights visuels et les intégrer à l'analyse textuelle.

## ✨ Fonctionnalités

### 📊 Analyse de Graphiques
- **Détection automatique** des graphiques dans les PDFs
- **Analyse spécialisée** pour barres, lignes, circulaires
- **Extraction des tendances** et valeurs numériques
- **Insights financiers** pertinents

### 📋 Analyse de Tableaux
- **Reconnaissance de structure** tabulaire
- **Extraction de données** financières
- **Métriques clés** (ROI, NAV, etc.)
- **Présentation structurée**

### 🖼️ Analyse d'Images Générales
- **Description contextuelle** des éléments visuels
- **Reconnaissance d'objets** et logos
- **Contexte financier** adapté

## 🚀 Installation

### 1. Dépendances
```bash
pip install -r requirements.txt
```

### 2. Configuration
```bash
# .env
OPENROUTER_API_KEY=your_api_key_here
```

### 3. Test
```bash
python test_vision.py
```

## 📖 Utilisation

### Upload de Documents
1. **Glissez-déposez** vos PDFs dans l'interface
2. **Les images sont automatiquement détectées** et analysées
3. **Posez vos questions** sur le contenu visuel

### Exemples de Questions
```
"Que montrent les graphiques de la page 3 ?"
"Quelle est la performance selon les tableaux ?"
"Analysez les tendances visibles dans ce document"
"Que représentent les diagrammes circulaires ?"
```

### Réponses Typiques
```
📊 **Analyse des graphiques - Page 3 :**

**Graphique 1 (en haut à gauche) :**
- Type : Graphique en barres
- Données : Revenus trimestriels Q1-Q4 2023
- Tendance : Croissance de 15% Q1 à Q4
- Point clé : Q4 montre une accélération de +8% vs Q3

**Graphique 2 (en bas à droite) :**
- Type : Graphique circulaire
- Données : Répartition des investissements par secteur
- Insights : Tech (45%), Finance (30%), Healthcare (25%)
```

## 🔧 Architecture Technique

### Pipeline de Traitement
```
PDF Upload → Extraction Images → Détection Type → Optimisation → API Vision → Cache → Réponse
```

### Composants Principaux

#### **1. Extraction PDF (`utils/pdf.py`)**
```python
def extract_pdf_text_images_and_pages(pdf_bytes):
    # Extrait texte ET images
    # Analyse automatique du type d'image
    # Optimisation pour l'API
```

#### **2. Analyse Vision (`utils/vision.py`)**
```python
class VisionAnalyzer:
    def describe_chart(image_bytes)    # Graphiques
    def describe_table(image_bytes)    # Tableaux
    def describe_image(image_bytes)    # Images générales
```

#### **3. Intégration API (`app.py`)**
```python
# Analyse automatique des images PDF
if p.get('images'):
    for img in p['images']:
        analysis = analyze_image_from_pdf(img, p['page'])
```

## 📊 Métriques et Performance

### Cache Intelligent
- **Sauvegarde automatique** des résultats
- **Évite les appels API** répétés
- **Optimisation mémoire** intégrée

### Optimisation d'Images
- **Compression progressive** (90% → 70%)
- **Redimensionnement automatique** (max 1200px)
- **Taille maximale** : 800KB pour l'API

### Gestion d'Erreurs
- **Retry automatique** (3 tentatives)
- **Backoff exponentiel**
- **Fallback OCR** si échec
- **Timeout configurable** (30s)

## 🎯 Types de Documents Supportés

### 📈 Rapports Financiers
- Graphiques de performance
- Tableaux de métriques
- Diagrammes de répartition

### 📊 Présentations d'Investissement
- Slides avec graphiques
- Tableaux de données
- Infographies

### 📋 Documents Réglementaires
- Tableaux de conformité
- Graphiques de risque
- Diagrammes de flux

## 🔍 Détection Intelligente

### Algorithme de Classification
```python
def analyze_image_type(image_bytes):
    # Métriques OpenCV
    # Densité de pixels
    # Variance des couleurs
    # Détection de lignes/rectangles
    # Score de probabilité
```

### Scores de Confiance
- **> 0.6** : Chart confirmé
- **> 0.3** : Possible chart
- **< 0.3** : Image générale

## 📈 Monitoring

### Endpoint de Statistiques
```bash
GET /vision/stats
```

### Réponse
```json
{
    "api_calls": 15,
    "cache_size": 8,
    "cache_hits": 3,
    "processing_time": 2.3
}
```

### Logs Détaillés
```
📄 Traitement fichier: financial-report.pdf
🔍 Extraction PDF avec images...
📊 Analyse de 3 images page 2...
✅ Image optimisée: 245760 -> 156432 bytes
🔄 Appel API vision (tentative 1/3)...
✅ API vision réussie (appel #15)
```

## 🛠️ Configuration Avancée

### Variables d'Environnement
```bash
OPENROUTER_API_KEY=your_key
VISION_CACHE_FILE=vision_cache.json
MAX_RETRIES=3
REQUEST_TIMEOUT=30
```

### Paramètres de Performance
```python
# Taille maximale d'image
MAX_IMAGE_SIZE_KB = 800

# Qualité de compression
COMPRESSION_QUALITIES = [90, 85, 80, 75]

# Timeout API
API_TIMEOUT = 30
```

## 🔮 Améliorations Futures

### 1. Modèles Locaux
- **BLIP-2** pour analyse offline
- **Réduction des coûts** API
- **Confidentialité** renforcée

### 2. Analyse Avancée
- **Reconnaissance de logos** d'entreprises
- **Détection de signatures**
- **Extraction de données** tabulaires

### 3. Optimisations
- **Cache Redis** pour performance
- **Compression intelligente**
- **Parallélisation** des analyses

## 🧪 Tests

### Script de Test Complet
```bash
python test_vision.py
```

### Tests Inclus
- ✅ Imports des modules
- ✅ API vision fonctionnelle
- ✅ Extraction PDF avec images
- ✅ Statistiques de vision
- ✅ Cache intelligent

## 📞 Support

### Logs de Debug
```python
# Activer les logs détaillés
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Diagnostic
```bash
# Vérifier les dépendances
pip list | grep -E "(opencv|numpy|pillow)"

# Tester l'API
curl -X GET http://localhost:5002/vision/stats
```

---

**🎉 Vision FinAssist est maintenant prête à analyser vos documents financiers avec intelligence !** 