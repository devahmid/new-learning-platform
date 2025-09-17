# 🔥 API NestJS - Plateforme d'apprentissage de l'arabe

API backend moderne développée avec NestJS, TypeORM et PostgreSQL pour la plateforme d'apprentissage de l'arabe.

## 🚀 Fonctionnalités

- ✅ **Architecture modulaire** avec NestJS
- ✅ **Base de données PostgreSQL** avec TypeORM
- ✅ **Authentification JWT** complète
- ✅ **Guards et décorateurs** pour la sécurité
- ✅ **Validation automatique** des données
- ✅ **WebSockets** pour le temps réel
- ✅ **Swagger** documentation automatique
- ✅ **Tests unitaires** et e2e
- ✅ **Docker** pour le développement

## 🛠️ Installation

### **Prérequis**

- Node.js >= 18
- Docker et Docker Compose
- PostgreSQL (ou via Docker)

### **Installation rapide**

```bash
# 1. Installer les dépendances
npm install

# 2. Démarrer la base de données
docker-compose up -d

# 3. Configurer les variables d'environnement
cp .env.example .env

# 4. Démarrer l'API
npm run start:dev
```

### **Configuration .env**

```env
# Base de données
DB_HOST=localhost
DB_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=edu_api

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Mail (optionnel)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-app-password
```

## 🔌 Endpoints principaux

### **Authentification**

```
POST /api/auth/login          # Connexion
POST /api/auth/register       # Inscription
POST /api/auth/reset-password # Réinitialisation
```

### **Utilisateurs**

```
GET    /api/users             # Liste (admin)
GET    /api/users/me/children # Enfants du parent connecté
POST   /api/users             # Créer un utilisateur
PUT    /api/users/{id}        # Modifier
DELETE /api/users/{id}        # Supprimer
```

### **Cours et Leçons**

```
GET    /api/courses           # Liste des cours
GET    /api/courses/{id}      # Détails d'un cours
GET    /api/lessons/{id}      # Détails d'une leçon
POST   /api/courses           # Créer un cours (admin)
```

### **Exercices**

```
GET    /api/admin/exercises                    # Liste avec pagination (admin)
POST   /api/admin/exercises                    # Créer (admin)
PUT    /api/admin/exercises/{id}               # Modifier (admin)
DELETE /api/admin/exercises/{id}               # Supprimer (admin)
POST   /api/admin/exercises/{id}/duplicate     # Dupliquer (admin)
PUT    /api/admin/exercises/{id}/toggle-status # Activer/Désactiver (admin)
GET    /api/exercises                          # Liste publique
GET    /api/lessons/{lessonId}/exercises       # Exercices d'une leçon
```

## 🏃‍♂️ Scripts disponibles

```bash
# Développement
npm run start:dev        # Mode développement avec hot reload
npm run start:debug      # Mode debug
npm run start:prod       # Mode production

# Tests
npm run test             # Tests unitaires
npm run test:e2e         # Tests end-to-end
npm run test:cov         # Tests avec couverture

# Build
npm run build            # Build de production
npm run lint             # Vérification du code
npm run format           # Formatage du code
```

## 🐳 Docker

### **Développement avec Docker**

```bash
# Démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter les services
docker-compose down
```

### **Services inclus**

- **PostgreSQL** : Base de données principale
- **pgAdmin** : Interface web pour PostgreSQL
- **Redis** : Cache et sessions (optionnel)

## 📊 Structure du projet

```
nestjs-api/
├── src/
│   ├── auth/              # Authentification JWT
│   ├── user/              # Gestion des utilisateurs
│   ├── course/            # Gestion des cours
│   ├── lesson/            # Gestion des leçons
│   ├── exercise/          # Système d'exercices
│   ├── category/          # Catégories de cours
│   ├── level/             # Niveaux d'apprentissage
│   ├── payment/           # Système de paiement
│   ├── admin/             # Fonctionnalités admin
│   └── shared/            # Utilitaires partagés
├── test/                  # Tests e2e
├── docker-compose.yml     # Configuration Docker
└── package.json           # Dépendances Node.js
```

## 🔒 Sécurité

- **JWT** avec expiration automatique
- **Guards** pour protéger les routes
- **Validation** de toutes les entrées
- **Hashing** sécurisé des mots de passe
- **CORS** configuré
- **Rate limiting** (optionnel)

## 📈 Monitoring

- **Swagger UI** : `http://localhost:3000/api/docs`
- **Health Check** : `http://localhost:3000/api/health`
- **Logs** structurés avec Winston
- **Métriques** de performance

## 🧪 Tests

```bash
# Lancer tous les tests
npm run test

# Tests avec couverture
npm run test:cov

# Tests e2e
npm run test:e2e

# Tests en mode watch
npm run test:watch
```

## 🔧 Développement

### **Ajouter un nouveau module**

```bash
# Générer un module complet
nest g resource nom-module

# Générer juste un contrôleur
nest g controller nom-controller

# Générer un service
nest g service nom-service
```

### **Base de données**

```bash
# Synchronisation auto activée en développement
# Les entités TypeORM créent automatiquement les tables

# Pour la production, utilisez les migrations :
npm run migration:generate
npm run migration:run
```

## 🌐 Déploiement

### **Développement**

```bash
npm run start:dev
```

### **Production**

```bash
npm run build
npm run start:prod
```

### **Docker Production**

```bash
docker build -t nestjs-api .
docker run -p 3000:3000 nestjs-api
```

## 📞 Support

- **Documentation** : Swagger UI intégrée
- **Logs** : Consultez les logs de l'application
- **Debug** : Mode debug disponible avec `npm run start:debug`

## 🔗 Liens utiles

- [Documentation NestJS](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [JWT.io](https://jwt.io/) pour déboguer les tokens

---

**🎯 API recommandée pour le développement et les environnements Node.js !**
