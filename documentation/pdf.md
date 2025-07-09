# Extraction PDF

## Fichier : `utils/pdf.py`

### Fonctionnalité
Permet d'extraire le texte de chaque page d'un document PDF, pour l'analyse et le question answering sur documents financiers.

### Implémentation
- Utilise la librairie Python `PyPDF2` pour parser les fichiers PDF.
- Fonction principale :
  ```python
  def extract_pdf_text_and_pages(pdf_bytes):
      reader = PdfReader(io.BytesIO(pdf_bytes))
      pages = []
      for i, page in enumerate(reader.pages):
          text = page.extract_text() or ""
          pages.append({
              'page': i+1,
              'text': text.strip()
          })
      return pages
  ```
- Prend en entrée un flux binaire PDF (upload utilisateur ou fichier statique).
- Retourne une liste de dictionnaires `{page: numéro, text: texte}` pour chaque page.

### Points techniques
- Gère les PDF multi-pages, même volumineux.
- Utilise `extract_text()` de PyPDF2, qui fonctionne sur la plupart des PDF textuels (pas les scans purs).
- Peut être appelé depuis l'API Flask pour extraire le contenu avant envoi au LLM.

### Limites
- Ne gère pas les PDF scannés (images) : il faut passer par l'OCR pour ceux-ci.
- La qualité de l'extraction dépend de la structure du PDF (texte accessible ou non).
- Pas d'extraction des images, tableaux, ou métadonnées avancées dans la version actuelle.

### Améliorations possibles
- Détection automatique des pages scannées et fallback OCR.
- Extraction des tableaux (ex : camelot, tabula).
- Extraction des métadonnées, signets, annotations.
- Support des PDF protégés par mot de passe. 