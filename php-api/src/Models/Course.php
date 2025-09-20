<?php

namespace App\Models;

/**
 * Modèle Course - Équivalent de l'entité Course NestJS
 */
class Course extends BaseModel {
    protected static $table = 'courses';
    
    protected static $fillable = [
        'title',
        'description',
        'imageUrl',
        'videoUrl',
        'pdfUrl',
        'duration',
        'difficulty',
        'isActive',
        'status',
        'categoryId',
        'subcategoryId',
        'classeId',
        'instructorId',
        'price',
        'discountPrice',
        'tags',
        'order'
    ];
    
    /**
     * Récupère la catégorie du cours
     */
    public function category() {
        if ($this->categoryId) {
            return Category::find($this->categoryId);
        }
        return null;
    }
    
    /**
     * Récupère la sous-catégorie du cours
     */
    public function subcategory() {
        if ($this->subcategoryId) {
            return Subcategory::find($this->subcategoryId);
        }
        return null;
    }
    
    /**
     * Récupère la classe du cours (ancienne méthode - rétrocompatibilité)
     */
    public function classe() {
        if ($this->classeId) {
            return Classe::find($this->classeId);
        }
        return null;
    }
    
    /**
     * Récupère toutes les classes associées au cours (relation many-to-many)
     */
    public function classes() {
        $db = \DatabaseConfig::getInstance()->getConnection();
        $stmt = $db->prepare("
            SELECT cl.* 
            FROM classes cl
            INNER JOIN course_classes cc ON cl.id = cc.classeId
            WHERE cc.courseId = ?
            ORDER BY cl.name
        ");
        $stmt->execute([$this->id]);
        $classesData = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        
        // Convertir en objets Classe si nécessaire
        return array_map(function($data) {
            $classe = new Classe();
            foreach ($data as $key => $value) {
                $classe->$key = $value;
            }
            return $classe;
        }, $classesData);
    }
    
    /**
     * Ajoute une classe au cours
     */
    public function addClasse($classeId) {
        $db = \DatabaseConfig::getInstance()->getConnection();
        $stmt = $db->prepare("
            INSERT IGNORE INTO course_classes (courseId, classeId) 
            VALUES (?, ?)
        ");
        return $stmt->execute([$this->id, $classeId]);
    }
    
    /**
     * Supprime une classe du cours
     */
    public function removeClasse($classeId) {
        $db = \DatabaseConfig::getInstance()->getConnection();
        $stmt = $db->prepare("
            DELETE FROM course_classes 
            WHERE courseId = ? AND classeId = ?
        ");
        return $stmt->execute([$this->id, $classeId]);
    }
    
    /**
     * Met à jour toutes les classes associées au cours
     */
    public function syncClasses($classeIds) {
        $db = \DatabaseConfig::getInstance()->getConnection();
        
        // Supprimer toutes les associations existantes
        $stmt = $db->prepare("DELETE FROM course_classes WHERE courseId = ?");
        $stmt->execute([$this->id]);
        
        // Ajouter les nouvelles associations
        if (!empty($classeIds)) {
            $placeholders = str_repeat('(?,?),', count($classeIds) - 1) . '(?,?)';
            $stmt = $db->prepare("INSERT INTO course_classes (courseId, classeId) VALUES $placeholders");
            
            $values = [];
            foreach ($classeIds as $classeId) {
                $values[] = $this->id;
                $values[] = $classeId;
            }
            
            return $stmt->execute($values);
        }
        
        return true;
    }
    
    /**
     * Récupère l'instructeur du cours
     */
    public function instructor() {
        if ($this->instructorId) {
            return User::find($this->instructorId);
        }
        return null;
    }
    
    /**
     * Récupère les leçons du cours
     */
    public function lessons() {
        return Lesson::where(['courseId' => $this->id]);
    }
    
    /**
     * Récupère les quiz du cours
     */
    public function quizzes() {
        return Quiz::where(['courseId' => $this->id]);
    }
    
    /**
     * Récupère les inscriptions au cours
     */
    public function enrollments() {
        return Enrollment::where(['courseId' => $this->id]);
    }
    
    /**
     * Convertit en tableau pour l'API avec les relations
     */
    public function toArray() {
        $array = parent::toArray();
        
        // Relations simples (sans récursion pour éviter les boucles infinies)
        if ($this->categoryId) {
            $array['category'] = $this->category()?->toArrayWithoutRelations();
        }
        
        if ($this->subcategoryId) {
            $array['subcategory'] = $this->subcategory()?->toArrayWithoutRelations();
        }
        
        // Rétrocompatibilité - classe unique (ancienne relation)
        if ($this->classeId) {
            $array['classe'] = $this->classe()?->toArrayWithoutRelations();
        }
        
        // Nouvelle relation many-to-many - toutes les classes
        $array['classes'] = array_map(function($classe) {
            return $classe->toArrayWithoutRelations();
        }, $this->classes());
        
        if ($this->instructorId) {
            $array['instructor'] = $this->instructor()?->toArrayWithoutRelations();
        }
        
        // Relations avec les leçons et quiz (sans références circulaires)
        $array['lessons'] = array_map(function($lesson) {
            $lessonArray = $lesson->toArrayWithoutRelations();
            // Ajouter la sous-catégorie de la leçon
            if ($lesson->subcategoryId) {
                error_log("DEBUG Course->toArray() - Leçon {$lesson->id} a subcategoryId: {$lesson->subcategoryId}");
                $subcategory = $lesson->subcategory();
                if ($subcategory) {
                    error_log("DEBUG Course->toArray() - Sous-catégorie trouvée: {$subcategory->name}");
                    $lessonArray['subcategory'] = [
                        'id' => $subcategory->id,
                        'name' => $subcategory->name,
                        'description' => $subcategory->description,
                        'categoryId' => $subcategory->categoryId
                    ];
                } else {
                    error_log("DEBUG Course->toArray() - Sous-catégorie non trouvée pour ID: {$lesson->subcategoryId}");
                }
            } else {
                error_log("DEBUG Course->toArray() - Leçon {$lesson->id} n'a pas de subcategoryId");
            }
            return $lessonArray;
        }, $this->lessons());
        
        $array['quizzes'] = array_map(function($quiz) {
            return $quiz->toArrayWithoutRelations();
        }, $this->quizzes());
        
        return $array;
    }
    
    /**
     * Récupère les cours populaires (avec le plus d'exercices)
     */
    public static function getPopularCourses($limit = 5) {
        $db = \DatabaseConfig::getInstance()->getConnection();
        $stmt = $db->prepare("
            SELECT 
                c.*,
                COUNT(e.id) as exercise_count
            FROM " . self::$table . " c
            LEFT JOIN lessons l ON c.id = l.courseId
            LEFT JOIN exercises e ON l.id = e.lessonId
            GROUP BY c.id
            ORDER BY exercise_count DESC
            LIMIT ?
        ");
        $stmt->execute([$limit]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
    
    /**
     * Récupère les cours sans leçons
     */
    public static function getCoursesWithoutLessons() {
        $db = \DatabaseConfig::getInstance()->getConnection();
        $stmt = $db->query("
            SELECT c.* 
            FROM " . self::$table . " c
            LEFT JOIN lessons l ON c.id = l.courseId
            WHERE l.id IS NULL
        ");
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
    
    /**
     * Récupère la moyenne de leçons par cours
     */
    public static function getAverageLessonsPerCourse() {
        $db = \DatabaseConfig::getInstance()->getConnection();
        $stmt = $db->query("
            SELECT AVG(lesson_count) as average 
            FROM (
                SELECT courseId, COUNT(*) as lesson_count 
                FROM lessons 
                GROUP BY courseId
            ) as course_lessons
        ");
        $result = $stmt->fetch(\PDO::FETCH_ASSOC);
        return round((float)$result['average'], 2);
    }
    
    /**
     * Compte les cours actifs
     */
    public static function countActive() {
        $db = \DatabaseConfig::getInstance()->getConnection();
        $stmt = $db->query("SELECT COUNT(*) as count FROM " . self::$table . " WHERE isActive = 1");
        $result = $stmt->fetch(\PDO::FETCH_ASSOC);
        return (int)$result['count'];
    }
    
    /**
     * Récupère les cours par classe (statistiques avec nouvelle relation many-to-many)
     */
    public static function getCoursesByClasse() {
        $db = \DatabaseConfig::getInstance()->getConnection();
        $stmt = $db->query("
            SELECT 
                cl.name as classe_name,
                COUNT(DISTINCT c.id) as count
            FROM " . self::$table . " c
            INNER JOIN course_classes cc ON c.id = cc.courseId
            LEFT JOIN classes cl ON cc.classeId = cl.id
            GROUP BY cl.id, cl.name
            ORDER BY count DESC
        ");
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
    
    /**
     * Récupère les cours par catégorie
     */
    public static function getCoursesByCategory() {
        $db = \DatabaseConfig::getInstance()->getConnection();
        $stmt = $db->query("
            SELECT 
                cat.name as category_name,
                COUNT(c.id) as count
            FROM " . self::$table . " c
            LEFT JOIN categories cat ON c.categoryId = cat.id
            GROUP BY c.categoryId, cat.name
            ORDER BY count DESC
        ");
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
    
    /**
     * Récupère les cours récents
     */
    public static function getRecentCourses($days = 7) {
        $db = \DatabaseConfig::getInstance()->getConnection();
        $stmt = $db->prepare("SELECT * FROM " . self::$table . " WHERE createdAt >= DATE_SUB(NOW(), INTERVAL ? DAY) ORDER BY createdAt DESC");
        $stmt->execute([$days]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
    
    /**
     * Récupère les cours sans exercices
     */
    public static function getCoursesWithoutExercises() {
        $db = \DatabaseConfig::getInstance()->getConnection();
        $stmt = $db->query("
            SELECT c.* 
            FROM " . self::$table . " c
            LEFT JOIN exercises e ON c.id = e.courseId
            WHERE e.id IS NULL
        ");
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
    
    /**
     * Récupère les cours par classe (nouvelle relation many-to-many)
     */
    public static function findByClasse($classeId) {
        $db = \DatabaseConfig::getInstance()->getConnection();
        $stmt = $db->prepare("
            SELECT c.* 
            FROM " . self::$table . " c
            INNER JOIN course_classes cc ON c.id = cc.courseId
            WHERE cc.classeId = ?
            ORDER BY c.order, c.title
        ");
        $stmt->execute([$classeId]);
        $coursesData = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        
        // Convertir en objets Course
        return array_map(function($data) {
            $course = new Course();
            foreach ($data as $key => $value) {
                $course->$key = $value;
            }
            return $course;
        }, $coursesData);
    }
    
    /**
     * Récupère les cours par classe et catégorie (nouvelle relation many-to-many)
     */
    public static function findByClasseAndCategory($classeId, $categoryId) {
        $db = \DatabaseConfig::getInstance()->getConnection();
        $stmt = $db->prepare("
            SELECT c.* 
            FROM " . self::$table . " c
            INNER JOIN course_classes cc ON c.id = cc.courseId
            WHERE cc.classeId = ? AND c.categoryId = ?
            ORDER BY c.order, c.title
        ");
        $stmt->execute([$classeId, $categoryId]);
        $coursesData = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        
        // Convertir en objets Course
        return array_map(function($data) {
            $course = new Course();
            foreach ($data as $key => $value) {
                $course->$key = $value;
            }
            return $course;
        }, $coursesData);
    }
    
    /**
     * Récupère les catégories disponibles pour une classe (nouvelle relation many-to-many)
     */
    public static function getCategoriesForClasse($classeId) {
        $db = \DatabaseConfig::getInstance()->getConnection();
        $stmt = $db->prepare("
            SELECT DISTINCT cat.*
            FROM " . self::$table . " c
            INNER JOIN course_classes cc ON c.id = cc.courseId
            JOIN categories cat ON c.categoryId = cat.id
            WHERE cc.classeId = ? AND c.isActive = 1 AND cat.isActive = 1
            ORDER BY cat.order
        ");
        $stmt->execute([$classeId]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
}
