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
        'categoryId',
        'subcategoryId',
        'levelId',
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
     * Récupère le niveau du cours
     */
    public function level() {
        if ($this->levelId) {
            return Level::find($this->levelId);
        }
        return null;
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
        
        if ($this->levelId) {
            $array['level'] = $this->level()?->toArrayWithoutRelations();
        }
        
        if ($this->instructorId) {
            $array['instructor'] = $this->instructor()?->toArrayWithoutRelations();
        }
        
        // Relations avec les leçons et quiz (sans références circulaires)
        $array['lessons'] = array_map(function($lesson) {
            return $lesson->toArrayWithoutRelations();
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
     * Récupère les cours par niveau
     */
    public static function getCoursesByLevel() {
        $db = \DatabaseConfig::getInstance()->getConnection();
        $stmt = $db->query("
            SELECT 
                l.name as level_name,
                COUNT(c.id) as count
            FROM " . self::$table . " c
            LEFT JOIN levels l ON c.levelId = l.id
            GROUP BY c.levelId, l.name
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
    public function getCoursesWithoutExercises() {
        $db = \DatabaseConfig::getInstance()->getConnection();
        $stmt = $db->query("
            SELECT c.* 
            FROM " . self::$table . " c
            LEFT JOIN exercises e ON c.id = e.courseId
            WHERE e.id IS NULL
        ");
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
}
