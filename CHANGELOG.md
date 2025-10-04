# Changelog

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Versioning Sémantique](https://semver.org/lang/fr/).

## [Unreleased]

### Added
- Support complet des cartes mentales dans les leçons
- Interface d'administration pour upload de cartes mentales
- Validation d'images pour les cartes mentales (JPEG, PNG, GIF, WebP, max 10MB)
- Affichage des cartes mentales dans les leçons avec styles et animations
- Endpoints API pour upload de cartes mentales
- Migration de base de données pour ajouter le champ mindMapUrl

### Changed
- Interface de création/modification de cours mise à jour
- Modèles de données étendus pour supporter les cartes mentales
- Services d'upload étendus pour les images

### Fixed
- Correction de la sauvegarde du champ mindMapUrl lors de la mise à jour des cours
- Mapping correct des données API vers les composants frontend

## [2025-01-22] - Feature: Cartes Mentales

### 🧠 Nouvelle fonctionnalité : Cartes Mentales

#### Frontend (Angular)
- **Composant app-lesson-detail** : Affichage des cartes mentales sous la vidéo
- **Composant course-builder** : Interface d'upload de cartes mentales
- **Composant ajout** : Support des cartes mentales en création/modification
- **Validation d'images** : Formats acceptés (JPEG, PNG, GIF, WebP), taille max 10MB
- **Styles cohérents** : Icône cerveau 🧠, couleurs purple/violet, animations hover

#### Backend (PHP-API)
- **Migration SQL** : Ajout de la colonne `mindMapUrl` dans la table `lessons`
- **Modèle Lesson** : Extension avec le champ `mindMapUrl` dans `$fillable`
- **Endpoints d'upload** : 
  - `POST /api/upload/mindmap` - Upload général de cartes mentales
  - `POST /api/lessons/{id}/upload-mindmap` - Upload spécifique à une leçon
- **Validation stricte** : Vérification du type MIME et de la taille des fichiers
- **Correction de sauvegarde** : Le champ `mindMapUrl` est maintenant correctement sauvegardé

#### Interface Utilisateur
- **Zone d'upload** : Drag & drop avec aperçu de l'image
- **URL manuelle** : Possibilité de saisir l'URL directement
- **Gestion des erreurs** : Messages d'erreur spécifiques pour les cartes mentales
- **Responsive** : Interface adaptée aux différentes tailles d'écran

#### Fonctionnalités Administrateur
- **Création de cours** : Ajouter des cartes mentales aux leçons
- **Modification de cours** : Éditer les cartes mentales existantes
- **Chargement existant** : Les cartes mentales sont chargées en mode édition
- **Validation en temps réel** : Feedback immédiat lors de l'upload

### 📁 Fichiers modifiés
- `frontend/src/app/cours/lesson-detail/lesson-detail.component.*`
- `frontend/src/app/admin/course-builder/course-builder.component.*`
- `frontend/src/app/admin/courses/ajout/ajout.component.*`
- `frontend/src/app/models/lesson.*`
- `frontend/src/app/services/course.service.ts`
- `php-api/src/Controllers/AdminCourseController.php`
- `php-api/src/Controllers/LessonController.php`
- `php-api/src/Controllers/UploadController.php`
- `php-api/src/Models/Lesson.php`
- `php-api/database/schema.sql`

### 🧪 Tests
- Scripts de test créés pour vérifier le fonctionnement
- Test d'upload de cartes mentales
- Test de sauvegarde en base de données
- Test d'affichage dans l'interface

### 📚 Documentation
- Guide complet d'utilisation dans `MINDMAP_FEATURE.md`
- Instructions d'installation et de déploiement
- Exemples d'utilisation des endpoints API

---

## Format du Changelog

### Types de changements
- **Added** : Nouvelles fonctionnalités
- **Changed** : Changements dans les fonctionnalités existantes
- **Deprecated** : Fonctionnalités qui seront supprimées
- **Removed** : Fonctionnalités supprimées
- **Fixed** : Corrections de bugs
- **Security** : Améliorations de sécurité
