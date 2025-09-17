# 🔧 Correction : Sauvegarde des URLs des leçons

## ❌ **Problème identifié**
Les `videoUrl` et `fileUrl` des leçons n'étaient pas sauvegardés lors de la création de cours via l'API PHP.

## ✅ **Corrections apportées**

### 1. **AdminCourseController.php** - Méthode `createLessons`
```php
// AVANT (champs manquants)
$lesson = new Lesson([
    'title' => $lessonData['title'],
    'content' => $lessonData['content'] ?? '',
    'order' => $lessonData['order'] ?? 0,
    'courseId' => $courseId,
    'isActive' => $lessonData['isActive'] ?? true
]);

// APRÈS (champs ajoutés)
$lesson = new Lesson([
    'title' => $lessonData['title'],
    'content' => $lessonData['content'] ?? '',
    'videoUrl' => $lessonData['videoUrl'] ?? null,      // ✅ AJOUTÉ
    'fileUrl' => $lessonData['fileUrl'] ?? null,        // ✅ AJOUTÉ
    'duration' => $lessonData['duration'] ?? null,      // ✅ AJOUTÉ
    'order' => $lessonData['order'] ?? 0,
    'courseId' => $courseId,
    'isActive' => $lessonData['isActive'] ?? true
]);
```

### 2. **AdminCourseController.php** - Méthode `updateCourse`
```php
// Ajout de la gestion des leçons lors de la mise à jour
if (isset($data['lessons']) && is_array($data['lessons'])) {
    // Supprimer les anciennes leçons
    $existingLessons = Lesson::where(['courseId' => $id]);
    foreach ($existingLessons as $lesson) {
        $lesson->delete();
    }
    
    // Créer les nouvelles leçons
    $this->createLessons($id, $data['lessons']);
}
```

### 3. **Migration de base de données** (si nécessaire)
```sql
-- Vérifier et ajouter les colonnes manquantes
ALTER TABLE lessons 
ADD COLUMN IF NOT EXISTS videoUrl VARCHAR(500) NULL 
COMMENT 'URL de la vidéo de la leçon';

ALTER TABLE lessons 
ADD COLUMN IF NOT EXISTS fileUrl VARCHAR(500) NULL 
COMMENT 'URL du fichier de la leçon';

ALTER TABLE lessons 
ADD COLUMN IF NOT EXISTS duration INT NULL 
COMMENT 'Durée de la leçon en minutes';
```

## 🚀 **Déploiement**

### **Étape 1 : Déployer les fichiers modifiés**
```bash
# Copier le fichier modifié sur le serveur
scp php-api/src/Controllers/AdminCourseController.php user@server:/path/to/api/src/Controllers/
```

### **Étape 2 : Vérifier la base de données**
```bash
# Se connecter à la base de données
mysql -u username -p database_name

# Exécuter la migration
source /path/to/migrations/add_video_file_url_to_lessons.sql
```

### **Étape 3 : Tester la correction**
```bash
# Exécuter le script de test
php test_course_creation.php
```

## 🧪 **Test de validation**

### **Données de test :**
```json
{
    "title": "Test Course avec URLs",
    "description": "Cours de test pour vérifier les URLs des leçons",
    "categoryId": 1,
    "subcategoryId": 1,
    "levelId": 1,
    "videoUrl": "https://example.com/course-video.mp4",
    "pdfUrl": "https://example.com/course-document.pdf",
    "lessons": [
        {
            "title": "Leçon 1 avec vidéo",
            "content": "Contenu de la première leçon",
            "videoUrl": "https://www.youtube.com/watch?v=shgp3CdTz7U",
            "fileUrl": "https://example.com/lesson1-document.pdf",
            "duration": 30,
            "order": 1
        }
    ]
}
```

### **Résultat attendu :**
```json
{
    "success": true,
    "data": {
        "lessons": [
            {
                "id": 32,
                "title": "Leçon 1 avec vidéo",
                "content": "Contenu de la première leçon",
                "videoUrl": "https://www.youtube.com/watch?v=shgp3CdTz7U",  // ✅ NON NULL
                "fileUrl": "https://example.com/lesson1-document.pdf",        // ✅ NON NULL
                "duration": 30,                                               // ✅ NON NULL
                "order": 1
            }
        ]
    }
}
```

## ✅ **Vérification**

Après déploiement, testez la création d'un cours avec des leçons contenant des URLs. Les champs `videoUrl`, `fileUrl` et `duration` doivent maintenant être correctement sauvegardés et retournés par l'API.

## 📝 **Notes importantes**

- Le modèle `Lesson.php` supporte déjà ces champs
- La migration est optionnelle si les colonnes existent déjà
- Les URLs peuvent être des liens YouTube, Vimeo, ou des fichiers uploadés
- La durée est en minutes (entier)
