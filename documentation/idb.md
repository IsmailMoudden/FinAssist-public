# Stockage IndexedDB (PDF locaux)

## Fichier : `static/src/js/idb.js`

### Fonctionnalité
Permet de stocker, retrouver et supprimer des fichiers PDF localement dans le navigateur de l'utilisateur, pour une expérience offline et une gestion persistante des documents uploadés.

### Implémentation
- Utilise l'API IndexedDB via JavaScript natif.
- Fonctions principales :
  - `savePDF(id, file)` : sauvegarde un PDF avec un identifiant unique.
  - `getPDF(id)` : récupère un PDF par son identifiant.
  - `getAllPDFs()` : liste tous les PDF stockés.
  - `deletePDF(id)` : supprime un PDF par son identifiant.
- Structure de la base :
  - Nom : `finassist-pdf-db`
  - Store : `pdfs` (clé primaire : `id`)

### Points techniques
- Permet la persistance des documents même après refresh ou fermeture du navigateur.
- Utilisé par le front pour recharger les PDF locaux à l'initialisation.
- Compatible avec la gestion de l'UI (drag & drop, suppression, etc.).

### Limites
- Stockage limité par le navigateur (généralement quelques centaines de Mo).
- Pas de synchronisation entre appareils.
- Pas de chiffrement natif.

### Améliorations possibles
- Ajouter le chiffrement des fichiers stockés.
- Gérer la synchronisation cloud (IndexedDB + backend).
- Ajouter la gestion des versions de documents. 