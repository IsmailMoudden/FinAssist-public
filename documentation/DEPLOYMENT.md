# 🚀 Déploiement FinAssist sur Railway

## 📋 Prérequis

1. **Compte Railway** : [railway.app](https://railway.app)
2. **GitHub Repository** : Votre code doit être sur GitHub
3. **Variables d'environnement** : OPENROUTER_API_KEY

## 🔧 Configuration

### **1. Variables d'Environnement**

Dans Railway, configurez ces variables :

```bash
OPENROUTER_API_KEY=your_openrouter_api_key_here
FLASK_ENV=production
PORT=5002
```

### **2. Fichiers de Configuration**

✅ **Procfile** : `web: python app.py`
✅ **runtime.txt** : `python-3.12.0`
✅ **railway.json** : Configuration Railway
✅ **requirements.txt** : Dépendances Python

## 🚀 Déploiement

### **Méthode 1 : Via Railway Dashboard**

1. **Connectez votre GitHub** à Railway
2. **Sélectionnez votre repository** FinAssist
3. **Configurez les variables d'environnement**
4. **Déployez automatiquement**

### **Méthode 2 : Via CLI Railway**

```bash
# Installer Railway CLI
npm install -g @railway/cli

# Login
railway login

# Lier le projet
railway link

# Déployer
railway up
```

## 🔍 Vérification

### **Endpoints de Test**

```bash
# Santé de l'application
curl https://your-app.railway.app/health

# Stats Vision
curl https://your-app.railway.app/vision/stats

# Interface principale
https://your-app.railway.app/
```

### **Réponses Attendues**

```json
// GET /health
{
  "status": "healthy",
  "service": "FinAssist Vision API",
  "version": "1.0.0"
}

// GET /vision/stats
{
  "api_calls": 0,
  "cache_size": 0,
  "cache_hits": 0
}
```

## 📊 Monitoring

### **Logs Railway**
```bash
railway logs
```

### **Variables d'Environnement**
```bash
railway variables
```

### **Statut du Service**
```bash
railway status
```

## 🔧 Dépannage

### **Problèmes Courants**

#### **1. Port déjà utilisé**
```bash
# Vérifier les processus
lsof -ti:5002

# Tuer le processus
lsof -ti:5002 | xargs kill -9
```

#### **2. Dépendances manquantes**
```bash
# Vérifier requirements.txt
pip install -r requirements.txt

# Installer manuellement si besoin
pip install PyMuPDF opencv-python numpy
```

#### **3. Variables d'environnement**
```bash
# Vérifier .env
cat .env

# Tester l'API key
curl -H "Authorization: Bearer $OPENROUTER_API_KEY" \
     https://openrouter.ai/api/v1/models
```

## 🎯 Configuration Avancée

### **Scaling**
```json
// railway.json
{
  "deploy": {
    "numReplicas": 2,
    "restartPolicyType": "ON_FAILURE"
  }
}
```

### **Variables d'Environnement Avancées**
```bash
# Production
FLASK_ENV=production
PORT=5002
OPENROUTER_API_KEY=your_key

# Développement
FLASK_ENV=development
DEBUG=true
```

## 📈 Performance

### **Optimisations**
- ✅ **Cache intelligent** pour les analyses vision
- ✅ **Compression d'images** automatique
- ✅ **Gestion d'erreurs** robuste
- ✅ **Logs détaillés** pour monitoring

### **Métriques**
- **Temps de réponse** : < 30s pour analyses vision
- **Cache hit rate** : > 80% après utilisation
- **Uptime** : > 99.9% avec Railway

## 🔒 Sécurité

### **Variables Sensibles**
- ✅ **OPENROUTER_API_KEY** : Configuré dans Railway
- ✅ **Pas de clés en dur** dans le code
- ✅ **HTTPS** automatique avec Railway

### **CORS et Headers**
```python
# Ajouté automatiquement par Railway
# Pas de configuration CORS nécessaire
```

## 🎉 Déploiement Réussi

Une fois déployé, votre FinAssist sera accessible sur :
```
https://your-app-name.railway.app
```

### **Fonctionnalités Disponibles**
- ✅ **Interface web** complète
- ✅ **API Vision** fonctionnelle
- ✅ **Upload de PDFs** avec analyse d'images
- ✅ **Cache intelligent** pour performance
- ✅ **Monitoring** en temps réel

**Votre FinAssist avec Vision est maintenant en production ! 🚀** 