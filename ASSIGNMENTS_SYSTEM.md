# 📚 Système de Gestion des Devoirs

## 🎯 Vue d'ensemble

Le système de devoirs permet aux administrateurs de créer et gérer des devoirs pour les classes, et aux parents de consulter les devoirs de leurs enfants. Le système envoie automatiquement des notifications par email aux parents concernés.

## 🏗️ Architecture

### Backend (PHP)
- **Modèle**: `Assignment.php` - Gestion des devoirs
- **Contrôleur**: `AssignmentController.php` - API endpoints
- **Service**: `EmailService.php` - Notifications automatiques
- **Base de données**: Table `assignments`

### Frontend (Angular)
- **Admin**: `admin-assignments.component.*` - Interface de gestion
- **Parent**: `parent-assignments.component.*` - Interface de consultation
- **Service**: `assignment.service.ts` - Communication API

## 📊 Structure de la base de données

```sql
CREATE TABLE assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    classeId INT NOT NULL,
    dueDate DATETIME,
    createdBy INT NOT NULL,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (classeId) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE CASCADE
);
```

## 🔌 API Endpoints

### Admin
- `GET /api/admin/assignments` - Liste tous les devoirs
- `POST /api/admin/assignments` - Créer un nouveau devoir
- `PUT /api/admin/assignments/{id}` - Modifier un devoir
- `DELETE /api/admin/assignments/{id}` - Supprimer un devoir
- `GET /api/admin/assignments/stats` - Statistiques des devoirs

### Parent
- `GET /api/assignments/parent` - Devoirs des enfants du parent

## 🎨 Fonctionnalités

### Interface Admin
- ✅ Création de devoirs avec titre, description, classe et date limite
- ✅ Liste des devoirs avec filtres (classe, statut)
- ✅ Statistiques en temps réel (total, en retard, bientôt dû)
- ✅ Suppression de devoirs
- ✅ Notifications automatiques aux parents

### Interface Parent
- ✅ Consultation des devoirs par classe
- ✅ Affichage des devoirs urgents en priorité
- ✅ Statuts visuels (en retard, bientôt dû, à venir)
- ✅ Informations détaillées (date limite, description)

### Notifications Email
- ✅ Envoi automatique lors de la création d'un devoir
- ✅ Template HTML professionnel
- ✅ Informations complètes (titre, description, date limite, classe)
- ✅ Lien vers le tableau de bord

## 🚀 Installation

### 1. Migration de la base de données
```bash
# Sur le serveur de production
php php-api/run_assignments_migration.php
```

### 2. Déploiement des fichiers
- Backend: Tous les fichiers PHP sont prêts
- Frontend: Composants Angular créés

### 3. Configuration des routes
Les routes sont déjà ajoutées dans `Application.php`

## 📱 Utilisation

### Pour les Administrateurs
1. Accéder à `/admin/assignments`
2. Cliquer sur "Nouveau Devoir"
3. Remplir les informations (titre, description, classe, date limite)
4. Cliquer sur "Créer le devoir"
5. Les parents reçoivent automatiquement un email

### Pour les Parents
1. Accéder à la section "Devoirs" dans le dashboard
2. Voir les devoirs groupés par classe
3. Les devoirs urgents sont mis en évidence
4. Cliquer sur une classe pour voir les détails

## 🔧 Configuration

### Variables d'environnement
```env
PLATFORM_URL=https://centre-culturel-olivier.fr
FROM_EMAIL=noreply@centre-culturel-olivier.fr
FROM_NAME=Centre Culturel Olivier
```

### Permissions
- **Admin**: Accès complet à la gestion des devoirs
- **Parent**: Consultation uniquement des devoirs de leurs enfants

## 🎯 Statuts des devoirs

- **En retard** (`overdue`): Date limite dépassée
- **Bientôt dû** (`due_soon`): Date limite dans les 7 prochains jours
- **À venir** (`upcoming`): Date limite dans plus de 7 jours
- **Sans date** (`no_due_date`): Aucune date limite définie

## 📧 Template Email

Le template email inclut:
- En-tête avec logo et titre
- Informations du devoir (titre, description, date limite)
- Classe concernée
- Lien vers le tableau de bord
- Design responsive et professionnel

## 🔒 Sécurité

- Authentification JWT requise pour tous les endpoints
- Vérification des rôles (admin/parent)
- Validation des données côté serveur
- Protection contre les injections SQL

## 🚀 Prochaines étapes possibles

- Ajout de pièces jointes aux devoirs
- Système de remise de devoirs par les enfants
- Notifications push en plus des emails
- Calendrier des devoirs
- Rappels automatiques avant échéance
- Statistiques avancées pour les enseignants

## 📞 Support

Pour toute question ou problème:
- Vérifier les logs d'erreur PHP
- Tester les endpoints avec Postman
- Vérifier la configuration email
- Contacter l'équipe de développement

