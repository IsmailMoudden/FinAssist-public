# Interface Utilisateur (CSS)

## Fichier : `static/src/css/app.css`

### Fonctionnalité
Définit le style et l'expérience utilisateur de la plateforme FinAssist, en s'appuyant sur Tailwind CSS (via CDN) et des règles CSS custom pour l'UI/UX moderne.

### Structure
- **Layout principal** : gestion du split en 3 colonnes (sidebar gauche, viewer central, chat à droite).
- **Cards et effets 3D** : `.card-3d` pour donner de la profondeur aux éléments (hover, shadow).
- **Chat** : styles pour les messages utilisateur/IA, avatars SVG, bulles, animation d'apparition (`.message-appear`).
- **Badges et drag & drop** : styles pour les documents en contexte, zones de drop, feedback visuel.
- **Visionneuse PDF** : `.textLayer` pour la sélection de texte, responsive, zoom, etc.
- **Dark mode** : support natif via classes Tailwind et règles custom.

### Points techniques
- Utilisation de Tailwind via CDN pour prototypage rapide (non optimisé pour la prod).
- Règles custom pour affiner l'expérience (ex : suppression des scrollbars, animation, responsive avancé).
- Séparation claire des composants (sidebar, chat, viewer) pour faciliter la maintenance.
- Gestion des états (selected, hover, drag, etc.) pour une UX moderne.

### Limites
- Le CSS n'est pas minifié ni tree-shaké (car usage CDN Tailwind).
- Pas de theming avancé (ex : custom properties dynamiques).
- Certaines animations pourraient être optimisées.

### Améliorations possibles
- Passer à une build Tailwind custom (PostCSS/CLI) pour la prod (taille du CSS réduite, purge des classes inutiles).
- Ajouter des transitions plus fines (ex : loading, feedback IA).
- Améliorer l'accessibilité (focus, contrastes, ARIA).
- Modulariser le CSS pour faciliter l'évolution de l'UI. 