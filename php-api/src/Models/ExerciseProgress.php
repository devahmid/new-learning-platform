<?php

namespace App\Models;

use DatabaseConfig;

/**
 * Modèle pour la progression des exercices
 */
class ExerciseProgress {
    
    protected $fillable = [
        'exerciseId', 'userId', 'lessonId', 'exerciseType', 'score', 
        'answers', 'totalQuestions', 'completedAt'
    ];
    
    protected $table = 'exercise_progress';
    
    /**
     * Sauvegarder une progression d'exercice
     */
    public static function create($data) {
        $db = DatabaseConfig::getInstance()->getConnection();
        
        $sql = "INSERT INTO exercise_progress (exerciseId, userId, lessonId, exerciseType, score, answers, totalQuestions, completedAt) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $db->prepare($sql);
        $result = $stmt->execute([
            $data['exerciseId'],
            $data['userId'],
            $data['lessonId'],
            $data['exerciseType'],
            $data['score'],
            json_encode($data['answers']),
            $data['totalQuestions'],
            $data['completedAt']
        ]);
        
        if ($result) {
            return $db->lastInsertId();
        }
        
        return false;
    }
    
    /**
     * Récupérer les progressions d'un utilisateur
     */
    public static function findByUser($userId) {
        $db = DatabaseConfig::getInstance()->getConnection();
        
        $sql = "SELECT * FROM exercise_progress WHERE userId = ? ORDER BY completedAt DESC";
        $stmt = $db->prepare($sql);
        $stmt->execute([$userId]);
        
        return $stmt->fetchAll();
    }
    
    /**
     * Récupérer une progression par ID
     */
    public static function findById($id) {
        $db = DatabaseConfig::getInstance()->getConnection();
        
        $sql = "SELECT * FROM exercise_progress WHERE id = ?";
        $stmt = $db->prepare($sql);
        $stmt->execute([$id]);
        
        return $stmt->fetch();
    }
    
    /**
     * Mettre à jour une progression
     */
    public static function update($id, $data) {
        $db = DatabaseConfig::getInstance()->getConnection();
        
        $sql = "UPDATE exercise_progress SET score = ?, answers = ?, completedAt = ? WHERE id = ?";
        $stmt = $db->prepare($sql);
        
        return $stmt->execute([
            $data['score'],
            json_encode($data['answers']),
            $data['completedAt'],
            $id
        ]);
    }
    
    /**
     * Récupérer les statistiques d'un utilisateur
     */
    public static function getStats($userId) {
        $db = DatabaseConfig::getInstance()->getConnection();
        
        $sql = "SELECT 
                    COUNT(*) as totalExercises,
                    AVG(score) as averageScore,
                    MAX(score) as bestScore,
                    MIN(score) as worstScore,
                    SUM(CASE WHEN score >= 90 THEN 1 ELSE 0 END) as excellentCount,
                    SUM(CASE WHEN score >= 70 AND score < 90 THEN 1 ELSE 0 END) as goodCount,
                    SUM(CASE WHEN score < 70 THEN 1 ELSE 0 END) as needsImprovementCount
                FROM exercise_progress 
                WHERE userId = ?";
        
        $stmt = $db->prepare($sql);
        $stmt->execute([$userId]);
        
        return $stmt->fetch();
    }
    
    /**
     * Récupérer les progressions par type d'exercice
     */
    public static function findByType($userId, $exerciseType) {
        $db = DatabaseConfig::getInstance()->getConnection();
        
        $sql = "SELECT * FROM exercise_progress WHERE userId = ? AND exerciseType = ? ORDER BY completedAt DESC";
        $stmt = $db->prepare($sql);
        $stmt->execute([$userId, $exerciseType]);
        
        return $stmt->fetchAll();
    }
}
