# 🔧 Corrections pour l'endpoint des cours - API PHP

## 🎯 **Problème identifié**

L'endpoint `/api/courses/level/1` retourne 404 (Not Found) car il n'existe pas dans l'API PHP.

## 🔍 **Analyse du problème**

### **Frontend**

```typescript
// niveau-user.component.ts:56
GET https://centre-culturel-olivier.fr/api/courses/level/1 404 (Not Found)

// CourseService.ts
getCoursesByLevel(levelId: number): Observable<Course[]> {
  return this.http.get<Course[]>(
    `${environment.apiUrl}/courses/level/${levelId}`
  );
}
```

### **API PHP**

L'endpoint `/api/courses/level/{levelId}` n'existait pas.

## ✅ **Solutions appliquées**

### **1. Ajout de la route manquante**

```php
// Application.php
$this->routes['GET']['/api/courses/level/{levelId}'] = ['App\Controllers\CourseController', 'findByLevel'];
```

### **2. Création du CourseController**

```php
// CourseController.php
public function findByLevel($levelId) {
    $courses = Course::where(['levelId' => $levelId]);
    $coursesArray = array_map(function($course) {
        return $course->toArray();
    }, $courses);

    // Format compatible NestJS
    Response::json($coursesArray, 200);
}
```

### **3. Création du modèle Course**

```php
// Course.php
class Course extends BaseModel {
    protected static $table = 'courses';

    protected static $fillable = [
        'title', 'description', 'levelId', 'categoryId',
        'subcategoryId', 'instructorId', 'price', 'order', 'isActive'
    ];

    public function findByLevel($levelId) {
        return self::where(['levelId' => $levelId]);
    }
}
```

### **4. Création des modèles associés**

- ✅ **LevelController.php** - Gestion des niveaux
- ✅ **Level.php** - Modèle des niveaux
- ✅ **Category.php** - Modèle des catégories

## 📋 **Fichiers créés/modifiés**

1. **`php-api/src/Core/Application.php`**

   - ✅ Ajout de la route `/api/courses/level/{levelId}`

2. **`php-api/src/Controllers/CourseController.php`** (Nouveau)

   - ✅ Méthode `findByLevel($levelId)`
   - ✅ CRUD complet des cours

3. **`php-api/src/Models/Course.php`** (Nouveau)

   - ✅ Modèle avec relations (catégorie, niveau, leçons)

4. **`php-api/src/Controllers/LevelController.php`** (Nouveau)

   - ✅ CRUD des niveaux

5. **`php-api/src/Models/Level.php`** (Nouveau)

   - ✅ Modèle des niveaux

6. **`php-api/src/Models/Category.php`** (Nouveau)
   - ✅ Modèle des catégories

## 🧪 **Tests de validation**

### **Test 1 : Création d'un niveau**

```bash
curl -X POST https://centre-culturel-olivier.fr/api/levels \
  -H "Content-Type: application/json" \
  -d '{"name":"Débutant","description":"Niveau adapté aux débutants","sortOrder":1}'
```

**Résultat** : ✅ Niveau créé avec succès

### **Test 2 : Création d'une catégorie**

```bash
curl -X POST https://centre-culturel-olivier.fr/api/courses \
  -H "Content-Type: application/json" \
  -d '{"name":"Langue Arabe","description":"Cours de langue arabe","sortOrder":1}'
```

### **Test 3 : Création d'un cours**

```bash
curl -X POST https://centre-culturel-olivier.fr/api/courses \
  -H "Content-Type: application/json" \
  -d '{"title":"Les salutations","description":"Apprenez les salutations de base","levelId":1,"categoryId":1}'
```

### **Test 4 : Récupération des cours par niveau**

```bash
curl https://centre-culturel-olivier.fr/api/courses/level/1
```

**Résultat attendu** : Liste des cours du niveau 1 au lieu de 404

## 🔧 **Problèmes rencontrés et solutions**

### **1. Erreur SQL avec le mot 'order'**

**Problème** : `order` est un mot réservé en SQL
**Solution** : Renommé en `sortOrder` dans les modèles

### **2. Contrôleurs manquants**

**Problème** : `CourseController`, `LevelController` n'existaient pas
**Solution** : Création complète des contrôleurs

### **3. Modèles manquants**

**Problème** : `Course`, `Level`, `Category` n'existaient pas
**Solution** : Création des modèles avec relations

## 🎯 **Impact sur le frontend**

### **Avant** ❌

```typescript
// Erreur 404 lors de l'appel
GET https://centre-culturel-olivier.fr/api/courses/level/1 404 (Not Found)
// Erreur lors du chargement des cours
```

### **Après** ✅ (après déploiement)

```typescript
// Appel réussi
GET https://centre-culturel-olivier.fr/api/courses/level/1 200 OK
// Réponse: [{"id": 1, "title": "Les salutations", ...}]
```

## 🚀 **Déploiement requis**

**Fichiers à uploader** :

1. `php-api/src/Core/Application.php`
2. `php-api/src/Controllers/CourseController.php` (Nouveau)
3. `php-api/src/Models/Course.php` (Nouveau)
4. `php-api/src/Controllers/LevelController.php` (Nouveau)
5. `php-api/src/Models/Level.php` (Nouveau)
6. `php-api/src/Models/Category.php` (Nouveau)

## ✅ **Résultat final**

Après déploiement, l'endpoint `/api/courses/level/{levelId}` devrait :

1. ✅ Exister et être accessible
2. ✅ Retourner les cours du niveau demandé
3. ✅ Retourner un tableau vide si pas de cours
4. ✅ Être compatible avec le frontend

**Le composant niveau-user devrait maintenant fonctionner parfaitement !** 🎉

## 📊 **Statut des corrections**

| Endpoint                       | Problème            | Solution           | Status        |
| ------------------------------ | ------------------- | ------------------ | ------------- |
| `/api/courses/level/{levelId}` | Route manquante     | Création complète  | ⏳ À déployer |
| `/api/courses`                 | Contrôleur manquant | CourseController   | ⏳ À déployer |
| `/api/levels`                  | Contrôleur manquant | LevelController    | ⏳ À déployer |
| `/api/categories`              | Contrôleur manquant | CategoryController | ⏳ À déployer |
