<?php

namespace App\Models;

use DatabaseConfig;

/**
 * Modèle pour la progression des quiz
 */
class QuizProgress {
    
    protected $fillable = [
        'quizId', 'userId', 'lessonId', 'score', 'answers', 
        'totalQuestions', 'completedAt'
    ];
    
    protected $table = 'quiz_progress';
    
    /**
     * Sauvegarder une progression de quiz
     */
    public static function create($data) {
        $db = DatabaseConfig::getInstance()->getConnection();
        
        $sql = "INSERT INTO quiz_progress (quizId, userId, lessonId, score, answers, totalQuestions, completedAt) 
                VALUES (?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $db->prepare($sql);
        $result = $stmt->execute([
            $data['quizId'],
            $data['userId'],
            $data['lessonId'],
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
        
        $sql = "SELECT * FROM quiz_progress WHERE userId = ? ORDER BY completedAt DESC";
        $stmt = $db->prepare($sql);
        $stmt->execute([$userId]);
        
        return $stmt->fetchAll();
    }
    
    /**
     * Récupérer une progression par ID
     */
    public static function findById($id) {
        $db = DatabaseConfig::getInstance()->getConnection();
        
        $sql = "SELECT * FROM quiz_progress WHERE id = ?";
        $stmt = $db->prepare($sql);
        $stmt->execute([$id]);
        
        return $stmt->fetch();
    }
    
    /**
     * Mettre à jour une progression
     */
    public static function update($id, $data) {
        $db = DatabaseConfig::getInstance()->getConnection();
        
        $sql = "UPDATE quiz_progress SET score = ?, answers = ?, completedAt = ? WHERE id = ?";
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
                    COUNT(*) as totalQuizzes,
                    AVG(score) as averageScore,
                    MAX(score) as bestScore,
                    MIN(score) as worstScore,
                    SUM(CASE WHEN score >= 90 THEN 1 ELSE 0 END) as excellentCount,
                    SUM(CASE WHEN score >= 70 AND score < 90 THEN 1 ELSE 0 END) as goodCount,
                    SUM(CASE WHEN score < 70 THEN 1 ELSE 0 END) as needsImprovementCount
                FROM quiz_progress 
                WHERE userId = ?";
        
        $stmt = $db->prepare($sql);
        $stmt->execute([$userId]);
        
        return $stmt->fetch();
    }
}
