# Dossier Static - Documents PDF

Ce dossier contient les fichiers PDF des cours qui seront affichés dans l'EdTech Copilot.

## Structure recommandée

```
static/
├── cours1.pdf          # Introduction à l'IA
├── cours2.pdf          # Machine Learning Basics  
├── cours3.pdf          # Deep Learning Fundamentals
├── cours4.pdf          # Neural Networks
└── README.md           # Ce fichier
```

## Comment ajouter vos propres documents

1. **Placez vos fichiers PDF** dans ce dossier
2. **Modifiez le fichier** `src/js/app.js` pour ajouter vos documents :

```javascript
this.documents = [
    { id: 'moncours', name: 'Mon Cours', filename: 'static/moncours.pdf' },
    // ... vos autres documents
];
```

## Format recommandé

- **Nommage** : Utilisez des noms simples sans espaces (ex: `cours-ia.pdf`)
- **Taille** : Optimisez vos PDF pour le web (< 10MB par fichier)
- **Qualité** : Résolution suffisante pour la lecture à l'écran

## Intégration avec PDF.js

L'application utilise PDF.js pour afficher les documents. Pour une intégration complète :

1. Remplacez la fonction `simulatePDFLoading()` dans `app.js`
2. Utilisez l'API PDF.js pour charger et afficher les vraies pages
3. Ajoutez la gestion des erreurs pour les fichiers manquants

## Exemple d'intégration PDF.js

```javascript
async loadRealPDF(doc) {
    try {
        const loadingTask = pdfjsLib.getDocument(doc.filename);
        const pdf = await loadingTask.promise;
        
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            // Rendu de la page...
        }
    } catch (error) {
        console.error('Erreur PDF:', error);
    }
}
``` 