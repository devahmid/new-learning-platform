# 🌟 Plateforme d'apprentissage de l'arabe - Architecture complète

Une plateforme moderne d'apprentissage de l'arabe pour enfants avec deux APIs backend et un frontend Angular partagé.

## 🏗️ Architecture du projet

```
arabic-learning-platform/
├── 📁 nestjs-api/          # API NestJS (développement local)
├── 📁 php-api/             # API PHP (production hébergement mutualisé)
├── 📁 frontend/            # Frontend Angular (compatible avec les 2 APIs)
└── 📄 backup.sql           # Sauvegarde base de données
```

## 🚀 Projets inclus

### 🔥 **API NestJS** (`nestjs-api/`)

- **Usage** : Développement local, serveurs VPS, environnements Node.js
- **Technologies** : NestJS, TypeORM, PostgreSQL, JWT
- **Avantages** :
  - Architecture moderne et scalable
  - TypeScript natif
  - Validation automatique
  - Swagger documentation
  - WebSockets intégrés
  - Tests automatisés

### 🧠 **Nouvelle fonctionnalité : Cartes Mentales**

- **Support complet** : Upload, affichage et gestion des cartes mentales
- **Interface admin** : Création et modification de cartes mentales pour les leçons
- **Validation d'images** : Formats JPEG, PNG, GIF, WebP (max 10MB)
- **Affichage élégant** : Styles avec animations et effets hover
- **API endpoints** : Upload et gestion des cartes mentales

**Démarrage rapide** :

```bash
cd nestjs-api
npm install
npm run start:dev
# API disponible sur http://localhost:3000
```

### 🌐 **API PHP** (`php-api/`)

- **Usage** : Production sur hébergement mutualisé (cPanel, Hostinger, etc.)
- **Technologies** : PHP pur, MySQL, JWT custom
- **Avantages** :
  - Compatible tous hébergements
  - Aucune dépendance externe
  - Configuration simple
  - Performances optimisées
  - CORS pré-configuré

**Déploiement** :

```bash
# Uploader les fichiers via FTP
# Configurer la base de données
# Voir php-api/DEPLOYMENT.md
```

### 🎨 **Frontend Angular** (`frontend/`)

- **Usage** : Interface utilisateur unique pour les deux APIs
- **Technologies** : Angular 17, PrimeNG, TailwindCSS
- **Fonctionnalités** :
  - Interface admin complète
  - Gestion des cours et exercices
  - Authentification JWT
  - Responsive design
  - Multi-environnements

**Configuration** :

```typescript
// Pour API NestJS (développement)
export const environment = {
  apiUrl: "http://localhost:3000/api",
};

// Pour API PHP (production)
export const environment = {
  apiUrl: "https://centre-culturel-olivier.fr/api",
};
```

## 🔄 Compatibilité des APIs

Les deux APIs sont **100% compatibles** et offrent les mêmes endpoints :

| Endpoint                     | NestJS | PHP | Description         |
| ---------------------------- | ------ | --- | ------------------- |
| `POST /api/auth/login`       | ✅     | ✅  | Authentification    |
| `GET /api/users/me/children` | ✅     | ✅  | Enfants du parent   |
| `GET /api/admin/exercises`   | ✅     | ✅  | Liste des exercices |
| `POST /api/admin/exercises`  | ✅     | ✅  | Créer un exercice   |
| `GET /api/courses`           | ✅     | ✅  | Liste des cours     |
| `GET /api/lessons/{id}`      | ✅     | ✅  | Détails d'une leçon |

## 🛠️ Installation et utilisation

### **Développement local** (NestJS)

```bash
cd nestjs-api
npm install
docker-compose up -d  # Base de données PostgreSQL
npm run start:dev

cd ../frontend
npm install
npm start
```

### **Production** (PHP)

```bash
# 1. Uploader php-api/ sur votre serveur
# 2. Configurer la base de données MySQL
# 3. Importer le schéma SQL
# 4. Configurer le frontend pour pointer vers l'API PHP
```

## 🌟 Fonctionnalités

### **🎓 Gestion des cours**

- Création et modification de cours
- Organisation par catégories et niveaux
- Leçons avec vidéos et documents
- Exercices interactifs (flashcards, traduction, écoute)

### **👨‍👩‍👧‍👦 Gestion des utilisateurs**

- Parents et enfants
- Profils personnalisés
- Suivi des progrès
- Authentification sécurisée

### **⚡ Interface admin**

- Dashboard complet
- Statistiques en temps réel
- Gestion des exercices
- CRUD complet

### **📱 Experience utilisateur**

- Design responsive
- Mode sombre/clair
- Animations fluides
- Notifications en temps réel

## 🔧 Configuration

### **Variables d'environnement**

**NestJS** (`.env`) :

```env
DB_HOST=localhost
DB_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=edu_api
JWT_SECRET=your-secret-key
```

**PHP** (`config/database.php`) :

```php
const HOST = 'localhost';
const DB_NAME = 'edu_api_php';
const USERNAME = 'root';
const PASSWORD = '';
```

## 🚀 Déploiement

### **Développement**

- Utilisez l'API NestJS avec Docker
- Base de données PostgreSQL
- Hot reload activé

### **Production**

- Utilisez l'API PHP sur hébergement mutualisé
- Base de données MySQL
- Configuration optimisée

## 📊 Performance

| Critère                    | NestJS | PHP    |
| -------------------------- | ------ | ------ |
| **Vitesse**                | ⚡⚡⚡ | ⚡⚡   |
| **Scalabilité**            | ⚡⚡⚡ | ⚡⚡   |
| **Simplicité déploiement** | ⚡     | ⚡⚡⚡ |
| **Coût hébergement**       | ⚡     | ⚡⚡⚡ |
| **Maintenance**            | ⚡⚡   | ⚡⚡⚡ |

## 📖 Documentation

- **API NestJS** : `nestjs-api/README.md`
- **API PHP** : `php-api/README.md` + `php-api/DEPLOYMENT.md`
- **Frontend** : `frontend/README.md`

## 🤝 Contribution

1. **Fork** le projet
2. **Créer** une branche feature
3. **Commiter** vos changements
4. **Push** vers la branche
5. **Ouvrir** une Pull Request

## 📄 Licence

Développé pour le Centre Culturel l'Olivier - Cours d'arabe pour enfants.

---

**🎯 Choisissez l'API qui convient le mieux à votre environnement !**
