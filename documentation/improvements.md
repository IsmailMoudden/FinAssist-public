# Améliorations & Architecture Production

## Objectif
Passer de la démo actuelle (API OpenRouter, vision simulée, stockage local) à une plateforme robuste, scalable et souveraine, avec modèles IA locaux (vision et LLM fine-tuné) sur un serveur VPS.

---

## 1. Architecture cible

- **Backend** :
  - Serveur VPS (Ubuntu/Debian recommandé)
  - API Python (Flask ou FastAPI)
  - Modèle LLM local (ex : Llama.cpp, Ollama, vLLM, ou HuggingFace Transformers)
  - Modèle vision local (ex : BLIP, Donut, TrOCR, PaddleOCR)
  - Extraction PDF/OCR/vision en local
  - Stockage fichiers sur disque ou base de données
- **Frontend** :
  - React/Vue ou HTML+JS (comme la démo)
  - Authentification, gestion des utilisateurs
  - Stockage cloud ou synchronisation possible

---

## 2. Implémentation technique (étapes)

### a) Déploiement serveur
- Prendre un VPS (OVH, Scaleway, Hetzner, etc.)
- Installer Python, Node, Docker (optionnel)
- Déployer l’API Flask/FastAPI (gunicorn + nginx recommandé)

### b) Modèle LLM local
- Installer un modèle open-source (Llama 2, Mistral, Phi, etc.) via Ollama, vLLM, ou Transformers
- Adapter l’API pour interroger le modèle local (remplacer l’appel OpenRouter par un appel local)
- Fine-tuner le modèle sur des corpus financiers si besoin (HuggingFace, LoRA, QLoRA)
- Gérer la mémoire GPU/CPU selon la taille du modèle

### c) Modèle vision local
- Installer BLIP, Donut, TrOCR, ou PaddleOCR (selon besoin)
- Adapter la fonction `describe_image` pour appeler le modèle local (ex : via Transformers ou API REST locale)
- Gérer le pré/post-traitement des images (OpenCV, PIL)

### d) Extraction PDF/OCR
- Garder la logique actuelle (PyPDF2, pytesseract), mais prévoir fallback OCR automatique sur pages scannées
- Ajouter extraction de tableaux (camelot, tabula)

### e) Stockage & sécurité
- Stocker les fichiers sur disque ou dans une base (PostgreSQL, S3, etc.)
- Ajouter authentification JWT, gestion des droits
- Chiffrer les données sensibles

---

## 3. Rapprochement avec l’implémentation actuelle

- **API Flask** : déjà en place, à étendre pour supporter les modèles locaux
- **Extraction PDF/OCR** : réutilisable, à améliorer pour fallback automatique
- **Vision** : remplacer la simulation par un vrai modèle (voir `utils/vision.py`)
- **LLM** : remplacer l’appel OpenRouter par un appel local (voir `/ask` dans `app.py`)
- **Frontend** : peut être conservé, mais à migrer vers build Tailwind pour la prod
- **Stockage** : IndexedDB pour le local, à compléter par un backend pour la synchro multi-utilisateur

---

## 4. Points d’attention
- **Ressources serveur** : prévoir RAM/CPU/GPU selon la taille des modèles
- **Sécurité** : authentification, chiffrement, monitoring
- **Scalabilité** : possibilité de clusteriser les modèles (Kubernetes, Ray, etc.)
- **Maintenance** : logs, monitoring, CI/CD

---

## 5. Pour aller plus loin
- Intégrer un orchestrateur de workflow (ex : Airflow, Prefect)
- Ajouter un moteur de recherche sémantique (ex : Qdrant, Weaviate)
- Proposer une API REST publique/documentée
- Mettre en place un portail d’admin pour la gestion des utilisateurs et des logs 