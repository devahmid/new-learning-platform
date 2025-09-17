# 🚀 API PHP - Plateforme d'apprentissage de l'arabe

API PHP équivalente à l'API NestJS existante, optimisée pour les hébergements mutualisés.

## 📋 Fonctionnalités

- ✅ **Authentification JWT** complète
- ✅ **Gestion des utilisateurs** (parents/enfants)
- ✅ **Système de cours et leçons**
- ✅ **Exercices interactifs** (flashcards, traduction, écoute)
- ✅ **Interface d'administration** pour les exercices
- ✅ **API RESTful** avec pagination
- ✅ **Validation des données**
- ✅ **Gestion des erreurs**
- ✅ **Architecture MVC propre**

## 🛠️ Installation

### 1. Configuration de la base de données

1. **Créer la base de données** :

```sql
CREATE DATABASE edu_api_php CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. **Configurer la connexion** dans `config/database.php` :

```php
// Configuration pour hébergement mutualisé
const HOST = 'votre-serveur-mysql.com';
const DB_NAME = 'votre_base_de_donnees';
const USERNAME = 'votre_utilisateur';
const PASSWORD = 'votre_mot_de_passe';
```

3. **Importer le schéma** :

```bash
mysql -u username -p edu_api_php < database/schema.sql
```

### 2. Configuration du serveur web

#### Apache (.htaccess)

Créez un fichier `.htaccess` à la racine :

```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php [QSA,L]
```

#### Nginx

```nginx
location / {
    try_files $uri $uri/ /index.php?$query_string;
}
```

### 3. Configuration sécurisée

1. **Changer la clé JWT** dans `config/jwt.php` :

```php
const SECRET_KEY = 'votre-cle-secrete-super-longue-et-aleatoire';
```

2. **Configurer les permissions** :

```bash
chmod 755 php-api/
chmod 644 php-api/config/*
```

## 🔌 Endpoints API

### Authentification

```
POST /api/auth/login          - Connexion
POST /api/auth/register       - Inscription
POST /api/auth/reset-password - Réinitialisation mot de passe
```

### Utilisateurs

```
GET    /api/users                - Liste des utilisateurs (admin)
GET    /api/users/{id}           - Détails utilisateur
GET    /api/users/me/children    - Enfants de l'utilisateur connecté
POST   /api/users               - Créer un utilisateur
PUT    /api/users/{id}          - Modifier un utilisateur (remplacement complet)
PATCH  /api/users/{id}          - Modifier un utilisateur (mise à jour partielle)
DELETE /api/users/{id}          - Supprimer un utilisateur
```

### Cours

```
GET    /api/courses             - Liste des cours
GET    /api/courses/{id}        - Détails d'un cours
POST   /api/courses             - Créer un cours
PUT    /api/courses/{id}        - Modifier un cours
DELETE /api/courses/{id}        - Supprimer un cours
```

### Leçons

```
GET    /api/lessons                    - Liste des leçons
GET    /api/lessons/{id}               - Détails d'une leçon
GET    /api/courses/{courseId}/lessons - Leçons d'un cours
POST   /api/lessons                    - Créer une leçon
PUT    /api/lessons/{id}               - Modifier une leçon
DELETE /api/lessons/{id}               - Supprimer une leçon
```

### Utilisateurs (Admin)

```
GET    /api/admin/users                          - Liste des utilisateurs avec pagination
GET    /api/admin/users/{id}                     - Détails d'un utilisateur
POST   /api/admin/users                          - Créer un utilisateur
PUT    /api/admin/users/{id}                     - Modifier un utilisateur (remplacement complet)
PATCH  /api/admin/users/{id}                     - Modifier un utilisateur (mise à jour partielle)
DELETE /api/admin/users/{id}                     - Supprimer un utilisateur

POST   /api/admin/users/parents                  - Créer un parent
POST   /api/admin/users/children                 - Créer un enfant
PATCH  /api/admin/users/parents/{id}             - Modifier un parent (mise à jour partielle)
PATCH  /api/admin/users/children/{id}            - Modifier un enfant (mise à jour partielle)
DELETE /api/admin/users/children/{id}            - Supprimer un enfant

GET    /api/admin/users/stats/overview           - Statistiques des utilisateurs
GET    /api/admin/users/search/advanced          - Recherche avancée avec filtres
```

### Exercices (Admin)

```
GET    /api/admin/exercises                      - Liste avec pagination
GET    /api/admin/exercises/{id}                 - Détails d'un exercice
POST   /api/admin/exercises                      - Créer un exercice
PUT    /api/admin/exercises/{id}                 - Modifier un exercice
DELETE /api/admin/exercises/{id}                 - Supprimer un exercice
POST   /api/admin/exercises/{id}/duplicate       - Dupliquer un exercice
PUT    /api/admin/exercises/{id}/toggle-status   - Activer/Désactiver
GET    /api/admin/exercises/stats/overview       - Statistiques
```

### Exercices (Public)

```
GET    /api/exercises                    - Liste des exercices actifs
GET    /api/exercises/{id}               - Détails d'un exercice
GET    /api/lessons/{lessonId}/exercises - Exercices d'une leçon
```

### Santé de l'API

```
GET    /api/health                      - État de l'API
```

## 📝 Exemples d'utilisation

### Connexion

```javascript
fetch("/api/auth/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    email: "user@example.com",
    password: "password123",
  }),
})
  .then((response) => response.json())
  .then((data) => {
    console.log("Token:", data.data.access_token);
  });
```

### Récupérer les exercices (avec authentification)

```javascript
fetch("/api/admin/exercises?page=1&limit=10", {
  headers: {
    Authorization: "Bearer " + token,
    "Content-Type": "application/json",
  },
})
  .then((response) => response.json())
  .then((data) => {
    console.log("Exercices:", data.data.exercises);
  });
```

### Créer un exercice

```javascript
fetch("/api/admin/exercises", {
  method: "POST",
  headers: {
    Authorization: "Bearer " + token,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    title: "Nouveau exercice",
    description: "Description de l'exercice",
    type: "flashcard",
    lessonId: 1,
    questions: [
      {
        text: "Bonjour",
        order: 1,
        metadata: {
          pronunciation: "marhaban",
          difficulty: "easy",
        },
        answers: [
          {
            text: "مرحبا",
            isCorrect: true,
            order: 1,
          },
        ],
      },
    ],
  }),
})
  .then((response) => response.json())
  .then((data) => {
    console.log("Exercice créé:", data.data);
  });
```

## 🔧 Structure du projet

```
php-api/
├── config/
│   ├── autoloader.php      # Chargement automatique des classes
│   ├── database.php        # Configuration base de données
│   └── jwt.php            # Configuration JWT
├── src/
│   ├── Core/
│   │   └── Application.php # Routeur principal
│   ├── Controllers/        # Contrôleurs API
│   │   ├── AuthController.php
│   │   ├── UserController.php
│   │   ├── ExerciseAdminController.php
│   │   └── HealthController.php
│   ├── Models/            # Modèles/Entités
│   │   ├── BaseModel.php
│   │   ├── User.php
│   │   ├── Course.php
│   │   ├── Exercise.php
│   │   └── ...
│   └── Utils/             # Utilitaires
│       ├── Response.php   # Gestion des réponses HTTP
│       ├── JWT.php        # Gestion des tokens JWT
│       └── Validator.php  # Validation des données
├── database/
│   └── schema.sql         # Schéma de base de données
├── index.php              # Point d'entrée
├── .htaccess             # Configuration Apache
└── README.md             # Documentation
```

## 🔒 Sécurité

- **Authentification JWT** avec expiration automatique
- **Validation** de toutes les données entrantes
- **Échappement SQL** avec requêtes préparées
- **Headers CORS** configurés
- **Gestion des erreurs** sans exposition d'informations sensibles

## 🚀 Déploiement

### Hébergement mutualisé

1. Uploadez tous les fichiers via FTP
2. Configurez la base de données
3. Modifiez `config/database.php`
4. Changez la clé JWT dans `config/jwt.php`
5. Testez avec `/api/health`

### Tests

```bash
# Test de santé de l'API
curl https://votre-domaine.com/api/health

# Test de connexion
curl -X POST https://votre-domaine.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'

# Test des exercices
curl https://votre-domaine.com/api/admin/exercises?page=1&limit=10
```

## 📊 Performance

- **ORM léger** personnalisé
- **Pagination** native
- **Cache** des requêtes fréquentes
- **Index** optimisés sur les tables
- **Requêtes** optimisées avec relations

## 🤝 Support

Cette API est compatible avec le frontend Angular existant. Remplacez simplement l'URL de base dans `environment.ts` :

```typescript
export const environment = {
  apiUrl: "https://votre-domaine.com/api",
};
```

## 📄 Licence

Développé pour la plateforme d'apprentissage de l'arabe.
