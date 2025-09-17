# ⚡ Guide de démarrage rapide

## 🎯 Choisir votre configuration

### 🔥 **Option 1 : Développement local (NestJS + PostgreSQL)**

**Avantages** : Développement rapide, hot reload, debugging avancé

```bash
# 1. Démarrer l'API NestJS
cd nestjs-api
npm install
docker-compose up -d  # PostgreSQL
npm run start:dev     # API sur http://localhost:3000

# 2. Démarrer le frontend
cd ../frontend
npm install
npm run start:nestjs  # Frontend sur http://localhost:4200
```

### 🌐 **Option 2 : Test avec API PHP (Production)**

**Avantages** : Test de la version production, hébergement mutualisé

```bash
# 1. Uploader l'API PHP sur votre serveur
# (Voir php-api/DEPLOYMENT.md)

# 2. Démarrer le frontend
cd frontend
npm install
npm run start:php     # Frontend sur http://localhost:4200 + API PHP
```

## 🔄 **Basculer entre les APIs**

### **Pendant le développement**

```bash
# Utiliser NestJS (local)
cd frontend
npm run start:nestjs

# Utiliser PHP (production)
cd frontend
npm run start:php
```

### **Pour le build**

```bash
# Build pour NestJS
npm run build:nestjs

# Build pour PHP (production)
npm run build:php
```

## 📋 **Checklist de démarrage**

### **API NestJS** ✅

- [ ] Node.js >= 18 installé
- [ ] Docker installé et démarré
- [ ] `npm install` dans nestjs-api/
- [ ] `docker-compose up -d` pour PostgreSQL
- [ ] `npm run start:dev` pour démarrer l'API
- [ ] API accessible sur http://localhost:3000

### **API PHP** ✅

- [ ] Fichiers uploadés sur le serveur
- [ ] Base de données MySQL créée
- [ ] Configuration BDD dans `config/database.php`
- [ ] Schéma SQL importé
- [ ] API accessible sur https://centre-culturel-olivier.fr/api

### **Frontend** ✅

- [ ] Node.js >= 18 installé
- [ ] `npm install` dans frontend/
- [ ] Environnement configuré (NestJS ou PHP)
- [ ] `npm start` pour démarrer
- [ ] Frontend accessible sur http://localhost:4200

## 🧪 **Tests rapides**

### **Test API NestJS**

```bash
curl http://localhost:3000/api/health
# Résultat attendu : {"status": "OK"}
```

### **Test API PHP**

```bash
curl https://centre-culturel-olivier.fr/api/health
# Résultat attendu : {"success": true, "data": {...}}
```

### **Test Frontend**

```javascript
// Console du navigateur
fetch("http://localhost:4200")
  .then((response) => console.log("✅ Frontend OK:", response.status))
  .catch((error) => console.error("❌ Frontend Error:", error));
```

## 🆘 **Dépannage rapide**

### **API NestJS ne démarre pas**

```bash
# Vérifier PostgreSQL
docker ps | grep postgres

# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install
```

### **API PHP erreur 500**

- Vérifier les logs du serveur
- Vérifier la configuration BDD
- Vérifier les permissions des fichiers

### **Frontend erreur CORS**

- Vérifier que l'API fonctionne
- Utiliser le proxy : `npm run serve:proxy`
- Vérifier l'environnement utilisé

### **Base de données vide**

```bash
# NestJS : Les entités créent automatiquement les tables
# PHP : Importer le schéma SQL manuellement
```

## 🎉 **Vous êtes prêt !**

Une fois ces étapes terminées, vous aurez :

- ✅ **API NestJS** fonctionnelle pour le développement
- ✅ **API PHP** déployée pour la production
- ✅ **Frontend Angular** compatible avec les deux
- ✅ **Système complet** de gestion d'apprentissage

**Choisissez l'option qui convient le mieux à votre situation !** 🚀
