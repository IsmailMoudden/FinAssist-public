# 💼 FinAssist Copilot - Surseoir

Un assistant IA pour l'analyse de documents business et financiers avec interface sombre élégante pour naviguer dans vos PDF tout en discutant avec une IA qui connaît le contenu.

## ✨ Fonctionnalités

- **📊 Navigation de documents** : Liste cliquable de documents business PDF dans la sidebar gauche
- **📖 Visionneuse PDF réelle** : Affichage des vraies pages PDF en scroll fluide avec PDF.js
- **🤖 Chat IA intégré** : Assistant conversationnel pour poser des questions sur le contenu financier
- **🌙 Interface Surseoir** : Thème sombre pur avec effets 3D et ombres portées
- **📱 Responsive** : Layout adaptatif pour desktop et mobile
- **🔍 Rendu PDF natif** : Intégration complète de PDF.js pour un affichage optimal

## 🚀 Installation & Utilisation

### 1. Cloner et ouvrir
```bash
# Ouvrir le fichier HTML directement dans votre navigateur
open public/index.html
```

### 2. Ou servir avec un serveur local
```bash
# Avec Python
python -m http.server 8000

# Avec Node.js (si vous avez http-server)
npx http-server public

# Puis ouvrir http://localhost:8000
```

### 3. Documents PDF inclus
L'application inclut déjà 4 documents business PDF d'exemple :
- **financial-analysis.pdf** : Guide d'Analyse Financière
- **business-plan.pdf** : Template de Plan d'Affaires  
- **market-research.pdf** : Rapport d'Étude de Marché
- **investment-strategy.pdf** : Vue d'Ensemble de la Stratégie d'Investissement

### 4. Ajouter vos propres documents PDF
1. Placez vos fichiers PDF dans `public/static/`
2. Modifiez la liste des documents dans `src/js/app.js`
3. Rechargez la page

## 🎨 Design System "Surseoir"

### Couleurs
- **Fond principal** : `#010101` (noir profond)
- **Panels** : `#141414` (noir mat)
- **Bordures** : `#1f1f1f` (gris très sombre)
- **Texte** : `#FFFFFF` (blanc pur)

### Effets 3D
- **Ombres portées** : `shadow-2xl shadow-black/60`
- **Hover effects** : `hover:scale-105`, `hover:translateY(-2px)`
- **Cartes flottantes** : `card-3d` avec transitions fluides

### Typographie
- **Titres** : `text-2xl font-bold`
- **Corps** : `text-sm text-gray-300`
- **Accents** : `text-gray-400`

## 📁 Structure du Projet

```
finassist-copilot/
├── public/
│   ├── index.html              # Interface principale
│   └── static/
│       ├── README.md           # Guide des documents
│       ├── financial-analysis.pdf    # Guide d'Analyse Financière
│       ├── business-plan.pdf         # Template de Plan d'Affaires
│       ├── market-research.pdf       # Rapport d'Étude de Marché
│       └── investment-strategy.pdf   # Stratégie d'Investissement
├── src/
│   └── js/
│       └── app.js              # Logique principale avec PDF.js
├── package.json                # Configuration du projet
├── .gitignore                  # Fichiers à ignorer
└── README.md                   # Ce fichier
```

## 🔧 Technologies Utilisées

- **Frontend** : HTML5 + Tailwind CSS + JavaScript vanilla
- **PDF** : PDF.js (CDN) pour l'affichage natif des documents
- **UI/UX** : Design system personnalisé "Surseoir"
- **Animations** : CSS transitions + JavaScript
- **Génération PDF** : ReportLab (Python) pour les exemples

## 🎯 Fonctionnalités Détaillées

### Navigation des Documents
- Liste cliquable dans la sidebar gauche (20% de largeur)
- Effets hover avec scale et ombres
- Chargement avec spinner de progression

### Visionneuse PDF Réelle
- Affichage en scroll continu (60% de largeur)
- Rendu natif des pages PDF avec PDF.js
- Chaque page = carte 3D avec contenu PDF réel
- Cliquez sur une page pour interagir avec l'IA

### Chat IA
- Interface conversationnelle (20% de largeur)
- Messages utilisateur vs IA avec animations
- Réponses mock intelligentes basées sur le contexte business/finance

## 🔮 Extensions Futures

### Backend RAG
- Connexion à une API RAG pour des réponses réelles
- Indexation automatique du contenu PDF
- Recherche sémantique dans les documents

### Fonctionnalités Avancées
- **Annotations** : Surligner, noter les pages
- **Recherche** : Barre de recherche dans le contenu
- **Partage** : URLs directes vers des pages spécifiques
- **Mode hors-ligne** : Cache des documents consultés
- **Zoom et navigation** : Contrôles avancés pour les PDF
- **Analyse financière** : Extraction automatique de métriques financières
- **Comparaison de documents** : Analyse comparative entre plusieurs rapports

## 🐛 Dépannage

### Problèmes Courants

**Les PDF ne se chargent pas**
- Vérifiez que les fichiers existent dans `public/static/`
- Assurez-vous que le serveur web peut accéder aux fichiers
- Vérifiez la console du navigateur pour les erreurs PDF.js

**Interface non responsive**
- Vérifiez que Tailwind CSS est bien chargé
- Testez sur différentes tailles d'écran

**Chat ne fonctionne pas**
- Ouvrez la console du navigateur pour voir les erreurs
- Vérifiez que `app.js` est bien chargé

**Erreurs PDF.js**
- Vérifiez la connexion internet (PDF.js est chargé depuis CDN)
- Assurez-vous que les PDF ne sont pas corrompus

## 📝 Licence

Ce projet est open source. Vous pouvez l'utiliser, le modifier et le distribuer librement.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
- Signaler des bugs
- Proposer des améliorations
- Ajouter de nouvelles fonctionnalités

## 🎉 État Actuel

✅ **Fonctionnel** : L'application est entièrement opérationnelle avec :
- Interface sombre "Surseoir" complète
- 4 documents business PDF d'exemple inclus
- Rendu PDF natif avec PDF.js
- Chat IA mock fonctionnel
- Design responsive et animations fluides

---

**FinAssist Copilot** - Votre assistant IA pour l'analyse business moderne 💼🌟 

# FinAssist API - Image to LLM

## Objectif
API Flask qui reçoit une image et une question, extrait le contenu (OCR ou vision), envoie le prompt à OpenRouter, et retourne la réponse.

---

## Structure

```
FinAssist-API/
├── app.py
├── utils/
│   ├── ocr.py
│   └── vision.py
├── .env
├── requirements.txt
└── README.md
```

## Usage

### 1. Installation
```bash
pip install -r requirements.txt
sudo apt install tesseract-ocr  # si besoin
```

### 2. Configuration
- Renseigner la clé OpenRouter dans `.env` :
  ```
  OPENROUTER_API_KEY=sk-xxxxxxx
  ```

### 3. Lancement
```bash
python app.py
# ou
flask run --host=0.0.0.0 --port=5000
```

### 4. Endpoint
- **POST /ask**
  - Payload : `multipart/form-data` avec `image` (fichier) et `question` (texte)
  - Réponse : `{ "answer": "..." }`

#### Exemple curl
```bash
curl -X POST http://localhost:5000/ask \
  -F "image=@/chemin/vers/image.png" \
  -F "question=Que montre ce graphique ?"
```

---

## Fonctionnement
- L'API reçoit une image et une question
- Utilise `utils/vision.py` (mock) ou `utils/ocr.py` (Tesseract) pour extraire une description
- Construit un prompt et l'envoie à OpenRouter (modèle GPT-3.5-turbo par défaut)
- Retourne la réponse JSON

---

## Extensibilité
- Remplacer la fonction mock de vision par BLIP/Donut si besoin
- Ajouter le choix du modèle dans le payload (clé `model`)
- Sécuriser l'API (auth, quota, etc.)
- Dockerisation possible

---

## Déploiement VPS
- Compatible CPU-only (CPX31, KVM4, etc.)
- Lancer avec Gunicorn ou systemd si besoin
- Ouvrir le port 5000

---

## Dépendances
- Flask, python-dotenv, pytesseract, Pillow, requests
- Tesseract-ocr (apt)

---

## Auteur
FinAssist Team 