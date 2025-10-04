# 🧠 Fonctionnalité Cartes Mentales

## 📋 Vue d'ensemble

Cette fonctionnalité permet d'ajouter et d'afficher des cartes mentales pour chaque leçon, créant une expérience d'apprentissage plus visuelle et interactive.

## 🎯 Fonctionnalités

- ✅ **Upload de cartes mentales** : Images au format JPEG, PNG, GIF, WebP
- ✅ **Affichage cohérent** : Même taille que la vidéo (aspect-video)
- ✅ **Interface responsive** : S'adapte à toutes les tailles d'écran
- ✅ **Validation stricte** : Limite de 10MB, formats d'image uniquement
- ✅ **Réutilisation maximale** : Utilise l'infrastructure d'upload existante

## 🏗️ Architecture

### Backend (PHP-API)

#### **Base de données**
```sql
-- Nouvelle colonne dans la table lessons
ALTER TABLE lessons ADD COLUMN mindMapUrl VARCHAR(500) NULL AFTER fileUrl;
```

#### **Modèle Lesson**
```php
protected static $fillable = [
    'title', 'description', 'content',
    'videoUrl', 'fileUrl', 'mindMapUrl', // ← Nouveau
    'duration', 'order', 'isActive', 'courseId', 'subcategoryId'
];
```

#### **Endpoints API**
- `POST /api/upload/mindmap` - Upload général de cartes mentales
- `POST /api/lessons/{id}/upload-mindmap` - Upload spécifique à une leçon

### Frontend (Angular)

#### **Interface Lesson**
```typescript
export interface Lesson {
  id: number;
  title: string;
  videoUrl?: string;
  fileUrl?: string;
  mindMapUrl?: string; // ← Nouveau
  // ... autres propriétés
}
```

#### **Affichage dans lesson-detail.component.html**
```html
<!-- Container de la carte mentale -->
<div class="mindmap-container relative w-full aspect-video bg-white rounded-2xl overflow-hidden shadow-lg mb-12"
     *ngIf="lesson?.mindMapUrl">
  <img [src]="lesson.mindMapUrl" 
       [alt]="'Carte mentale - ' + lesson.title"
       class="w-full h-full object-contain p-4">
  
  <!-- Overlay avec titre -->
  <div class="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-lg text-sm font-medium">
    <i class="fa-solid fa-brain mr-2"></i>
    Carte mentale
  </div>
</div>
```

## 🚀 Installation

### 1. **Migration de la base de données**
```bash
# Exécuter la migration
mysql -u username -p database_name < php-api/migrations/add_mindmap_to_lessons.sql
```

### 2. **Vérification**
```bash
# Tester la fonctionnalité
php test_mindmap_feature.php
```

## 📖 Utilisation

### **Upload via API**

#### **Méthode 1: Upload général**
```bash
curl -X POST 'https://centre-culturel-olivier.fr/api/upload/mindmap' \
     -F 'mindmap=@/chemin/vers/carte-mentale.jpg'
```

#### **Méthode 2: Upload sur une leçon spécifique**
```bash
curl -X POST 'https://centre-culturel-olivier.fr/api/lessons/1/upload-mindmap' \
     -F 'mindmap=@/chemin/vers/carte-mentale.jpg'
```

### **Réponse API**
```json
{
  "message": "Carte mentale uploadée avec succès",
  "lesson": {
    "id": 1,
    "title": "Leçon de test",
    "mindMapUrl": "https://centre-culturel-olivier.fr/api/upload/mindmap-lesson-1-1234567890-abc123.jpg"
  },
  "mindMapUrl": "https://centre-culturel-olivier.fr/api/upload/mindmap-lesson-1-1234567890-abc123.jpg"
}
```

## 🎨 Styles CSS

### **Container de carte mentale**
```scss
.mindmap-container {
  position: relative;
  z-index: 1;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  }

  img {
    object-fit: contain;
    transition: transform 0.3s ease;
  }

  &:hover img {
    transform: scale(1.02);
  }
}
```

## 🔧 Configuration

### **Limites d'upload**
- **Taille maximale** : 10MB
- **Formats acceptés** : JPEG, PNG, GIF, WebP
- **Dossier de stockage** : `php-api/uploads/`

### **Validation**
- Vérification du type MIME
- Validation de la taille du fichier
- Génération de noms de fichiers uniques
- Nettoyage automatique des anciens fichiers

## 🧪 Tests

### **Script de test**
```bash
php test_mindmap_feature.php
```

### **Tests manuels**
1. **Upload** : Tester l'upload via Postman ou curl
2. **Affichage** : Vérifier l'affichage dans le frontend
3. **Responsive** : Tester sur différentes tailles d'écran
4. **Validation** : Tester avec des fichiers invalides

## 📁 Fichiers modifiés

### **Backend**
- `php-api/migrations/add_mindmap_to_lessons.sql` (nouveau)
- `php-api/database/schema.sql`
- `php-api/src/Models/Lesson.php`
- `php-api/src/Controllers/UploadController.php`
- `php-api/src/Controllers/LessonController.php`
- `php-api/src/Core/Application.php`

### **Frontend**
- `frontend/src/app/models/lesson.model.ts`
- `frontend/src/app/models/lesson.ts`
- `frontend/src/app/services/course.service.ts`
- `frontend/src/app/cours/lesson-detail/lesson-detail.component.html`
- `frontend/src/app/cours/lesson-detail/lesson-detail.component.scss`

### **Tests**
- `test_mindmap_feature.php` (nouveau)
- `MINDMAP_FEATURE.md` (nouveau)

## 🎯 Prochaines étapes

- [ ] Interface d'upload pour les administrateurs
- [ ] Compression automatique des images
- [ ] Support des cartes mentales interactives
- [ ] Intégration avec l'éditeur de cours
- [ ] Analytics sur l'utilisation des cartes mentales

## 🐛 Dépannage

### **Problèmes courants**

1. **Colonne manquante** : Exécuter la migration SQL
2. **Upload échoue** : Vérifier les permissions du dossier uploads
3. **Image ne s'affiche pas** : Vérifier l'URL générée et les CORS
4. **Taille de fichier** : Vérifier la limite de 10MB

### **Logs**
- Backend : `php-api/logs/`
- Frontend : Console du navigateur
- Serveur web : Logs d'erreur Apache/Nginx
