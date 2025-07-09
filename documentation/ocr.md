# OCR (Reconnaissance de texte)

## Fichier : `utils/ocr.py`

### Fonctionnalité
Permet d'extraire le texte d'une image (formats courants : PNG, JPEG, etc.) via Tesseract OCR, pour l'intégrer dans le flux d'analyse documentaire.

### Implémentation
- Utilise la librairie Python `pytesseract` (wrapper de Tesseract) et `Pillow` pour la gestion d'image.
- Fonction principale :
  ```python
  def ocr_image(image_bytes):
      image = Image.open(io.BytesIO(image_bytes))
      text = pytesseract.image_to_string(image, lang='eng')
      return text.strip() or "No text detected in the image."
  ```
- Prend en entrée un flux binaire d'image (ex : upload utilisateur ou page extraite d'un PDF).
- Retourne le texte détecté, ou un message si rien n'est trouvé.

### Points techniques
- Le langage OCR est fixé à l'anglais (`lang='eng'`), mais peut être adapté.
- Gère les erreurs de décodage via Pillow.
- Peut être appelé depuis l'API Flask pour traiter des images uploadées.

### Limites
- Qualité dépendante de l'image et du modèle Tesseract installé.
- Pas d'amélioration d'image (binarisation, rotation, etc.) dans la version actuelle.

### Améliorations possibles
- Ajouter la détection automatique de langue.
- Intégrer des pré/post-traitements d'image (OpenCV).
- Supporter le multi-page (ex : TIFF multi-pages).
- Utiliser un modèle OCR plus avancé (ex : Donut, TrOCR, PaddleOCR) pour de meilleures performances sur des documents complexes. 