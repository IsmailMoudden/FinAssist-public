# Vision (Description d'image)

## Fichier : `utils/vision.py`

### Fonctionnalité
Permet d'obtenir une description synthétique d'une image (ex : graphique, diagramme, photo) pour enrichir l'analyse documentaire.

### Implémentation
- Fonction de simulation :
  ```python
  def describe_image(image_bytes):
      # Simulation d'un modèle vision (à remplacer par BLIP/Donut si besoin)
      return "Bar chart showing revenue Q1–Q4 and a rising trend line."
  ```
- Prend en entrée un flux binaire d'image.
- Retourne une description textuelle (actuellement simulée).

### Points techniques
- La version actuelle ne fait qu'une simulation (hardcodée).
- Prévue pour être remplacée par un vrai modèle de vision (BLIP, Donut, TrOCR, etc.).
- Peut être appelée depuis l'API Flask pour traiter des images uploadées ou extraites de PDF.

### Limites
- Pas d'analyse réelle d'image dans la version démo.
- Ne gère pas les images complexes, ni la reconnaissance de texte ou d'entités.

### Améliorations possibles
- Intégrer un vrai modèle de vision (BLIP, Donut, TrOCR, etc.).
- Ajouter la reconnaissance de graphiques, tableaux, logos, etc.
- Coupler avec l'OCR pour extraire du texte des images. 