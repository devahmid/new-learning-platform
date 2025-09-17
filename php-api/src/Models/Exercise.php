<?php

namespace App\Models;

/**
 * Modèle Exercise - Équivalent de l'entité Exercise NestJS
 */
class Exercise extends BaseModel {
    protected static $table = 'exercises';
    
    protected static $fillable = [
        'title',
        'description',
        'type',
        'order',
        'isActive',
        'lessonId'
    ];
    
    /**
     * Récupère la leçon de cet exercice
     */
    public function lesson() {
        if ($this->lessonId) {
            return Lesson::find($this->lessonId);
        }
        return null;
    }
    
    /**
     * Récupère les questions de cet exercice
     */
    public function questions() {
        return ExerciseQuestion::where(['exerciseId' => $this->id]);
    }
    
    /**
     * Convertit en tableau pour l'API avec les relations
     */
    public function toArray() {
        $array = parent::toArray();
        
        // Relations avec les questions (avec réponses mais sans références circulaires)
        $array['questions'] = array_map(function($question) {
            return $question->toArray();
        }, $this->questions());
        
        return $array;
    }
    
    /**
     * Récupère les exercices inactifs
     */
    public static function getInactiveExercises() {
        $db = \DatabaseConfig::getInstance()->getConnection();
        $stmt = $db->query("SELECT * FROM " . self::$table . " WHERE isActive = 0");
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
    
    /**
     * Récupère la moyenne d'exercices par leçon
     */
    public static function getAverageExercisesPerLesson() {
        $db = \DatabaseConfig::getInstance()->getConnection();
        $stmt = $db->query("
            SELECT AVG(exercise_count) as average 
            FROM (
                SELECT lessonId, COUNT(*) as exercise_count 
                FROM " . self::$table . " 
                GROUP BY lessonId
            ) as lesson_exercises
        ");
        $result = $stmt->fetch(\PDO::FETCH_ASSOC);
        return round((float)$result['average'], 2);
    }
    
    /**
     * Récupère le taux de completion des exercices
     */
    public static function getCompletionRate() {
        $db = \DatabaseConfig::getInstance()->getConnection();
        $stmt = $db->query("
            SELECT 
                COUNT(DISTINCT e.id) as total_exercises,
                COUNT(DISTINCT ue.exerciseId) as completed_exercises
            FROM " . self::$table . " e
            LEFT JOIN user_exercises ue ON e.id = ue.exerciseId AND ue.isCompleted = 1
        ");
        $result = $stmt->fetch(\PDO::FETCH_ASSOC);
        
        if ($result['total_exercises'] > 0) {
            return round(($result['completed_exercises'] / $result['total_exercises']) * 100, 2);
        }
        return 0;
    }
    
    /**
     * Récupère les exercices récents
     */
    public static function getRecentExercises($days = 7) {
        $db = \DatabaseConfig::getInstance()->getConnection();
        $stmt = $db->prepare("SELECT * FROM " . self::$table . " WHERE createdAt >= DATE_SUB(NOW(), INTERVAL ? DAY) ORDER BY createdAt DESC");
        $stmt->execute([$days]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
}