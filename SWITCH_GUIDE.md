# 🔄 Guide de basculement entre APIs

## 🎯 Deux APIs, un seul frontend

Votre plateforme dispose maintenant de **deux APIs identiques** :

### 🔥 **NestJS** (Développement local)

- **Usage** : Développement, debugging, tests
- **Avantages** : Hot reload, TypeScript, debugging avancé
- **Prérequis** : Node.js, Docker, PostgreSQL

### 🌐 **PHP** (Production hébergement mutualisé)

- **Usage** : Production, hébergements partagés
- **Avantages** : Compatible partout, pas de dépendances, MySQL
- **Prérequis** : PHP, MySQL, serveur web

## ⚡ **Commandes rapides**

### **Développement avec NestJS**

```bash
# Terminal 1 : API NestJS
cd nestjs-api
npm install
docker-compose up -d
npm run start:dev

# Terminal 2 : Frontend
cd frontend
npm install
npm run start:nestjs
```

**URLs** :

- Frontend : http://localhost:4200
- API : http://localhost:3000
- Swagger : http://localhost:3000/api/docs

### **Test avec API PHP**

```bash
# Terminal 1 : Frontend seulement
cd frontend
npm install
npm run start:php
```

**URLs** :

- Frontend : http://localhost:4200
- API : https://centre-culturel-olivier.fr/api

## 🔧 **Configurations d'environnement**

### **Frontend pour NestJS** (environment.ts)

```typescript
export const environment = {
  production: false,
  apiUrl: "http://localhost:3000/api",
  apiType: "nestjs",
};
```

### **Frontend pour PHP** (environment.development.ts)

```typescript
export const environment = {
  production: false,
  apiUrl: "https://centre-culturel-olivier.fr/api",
  apiType: "php",
};
```

## 📊 **Comparaison des APIs**

| Critère         | NestJS    | PHP     |
| --------------- | --------- | ------- |
| **Setup**       | Complexe  | Simple  |
| **Performance** | ⚡⚡⚡    | ⚡⚡    |
| **Debugging**   | ⚡⚡⚡    | ⚡      |
| **Hébergement** | VPS/Cloud | Partout |
| **Coût**        | Élevé     | Faible  |
| **Maintenance** | Moyenne   | Simple  |

## 🚀 **Déploiement**

### **Développement → Production**

1. **Développer avec NestJS** :

   ```bash
   cd nestjs-api
   npm run start:dev
   ```

2. **Tester en local** avec les deux APIs

3. **Déployer l'API PHP** :

   ```bash
   # Upload php-api/ vers votre serveur
   # Configurer la base MySQL
   # Importer database/schema.sql
   ```

4. **Build frontend pour production** :
   ```bash
   cd frontend
   npm run build:php
   # Deploy dist/ sur votre serveur web
   ```

## 🔄 **Workflow recommandé**

### **Phase développement**

```bash
# Utiliser NestJS pour le développement rapide
npm run start:nestjs
```

### **Phase test**

```bash
# Tester avec l'API PHP
npm run start:php
```

### **Phase production**

```bash
# Build pour l'API PHP
npm run build:php
```

## 🧪 **Tests de compatibilité**

### **Vérifier que les deux APIs fonctionnent**

**Test NestJS** :

```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/admin/exercises?page=1&limit=5
```

**Test PHP** :

```bash
curl https://centre-culturel-olivier.fr/api/health
curl https://centre-culturel-olivier.fr/api/admin/exercises?page=1&limit=5
```

### **Vérifier la compatibilité frontend**

**Avec NestJS** :

```javascript
// Console navigateur
fetch("http://localhost:3000/api/health")
  .then((r) => r.json())
  .then((d) => console.log("NestJS:", d));
```

**Avec PHP** :

```javascript
// Console navigateur
fetch("https://centre-culturel-olivier.fr/api/health")
  .then((r) => r.json())
  .then((d) => console.log("PHP:", d));
```

## 💡 **Conseils d'utilisation**

### **Quand utiliser NestJS**

- ✅ Développement de nouvelles fonctionnalités
- ✅ Debugging complexe
- ✅ Tests automatisés
- ✅ Développement en équipe

### **Quand utiliser PHP**

- ✅ Déploiement en production
- ✅ Hébergement mutualisé
- ✅ Budget limité
- ✅ Simplicité de maintenance

### **Synchronisation des APIs**

Quand vous ajoutez une fonctionnalité :

1. **Développer d'abord en NestJS** (plus rapide)
2. **Tester et valider** la fonctionnalité
3. **Porter vers PHP** si nécessaire
4. **Tester la compatibilité** frontend

## 🎉 **Avantages de cette architecture**

- ✅ **Flexibilité maximale** : Choisissez l'API selon vos besoins
- ✅ **Développement rapide** : NestJS pour le dev
- ✅ **Production économique** : PHP pour l'hébergement
- ✅ **Frontend unique** : Une seule interface à maintenir
- ✅ **Migration facile** : Basculement transparent
- ✅ **Backup** : Deux APIs fonctionnelles

**Vous avez maintenant le meilleur des deux mondes !** 🌟
