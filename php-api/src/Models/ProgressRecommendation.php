<?php

namespace App\Models;

use App\Core\Database;
use PDO;

class ProgressRecommendation
{
    private $db;
    private $table = 'progress_recommendations';

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    /**
     * Créer une nouvelle recommandation
     */
    public function create($data)
    {
        $sql = "INSERT INTO {$this->table} 
                (userId, courseId, lessonId, recommendationType, priority, title, 
                 description, actionRequired, subject, difficultyLevel, estimatedTime, expiresAt)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            $data['userId'],
            $data['courseId'] ?? null,
            $data['lessonId'] ?? null,
            $data['recommendationType'],
            $data['priority'] ?? 'medium',
            $data['title'],
            $data['description'],
            $data['actionRequired'] ?? '',
            $data['subject'] ?? null,
            $data['difficultyLevel'] ?? 'medium',
            $data['estimatedTime'] ?? null,
            $data['expiresAt'] ?? null
        ]);
    }

    /**
     * Récupérer les recommandations actives d'un utilisateur
     */
    public function getActiveByUserId($userId, $limit = null)
    {
        $sql = "SELECT * FROM {$this->table} 
                WHERE userId = ? AND isCompleted = FALSE 
                AND (expiresAt IS NULL OR expiresAt > NOW())
                ORDER BY priority DESC, createdAt DESC";
        
        if ($limit) {
            $sql .= " LIMIT ?";
        }

        $stmt = $this->db->prepare($sql);
        if ($limit) {
            $stmt->execute([$userId, $limit]);
        } else {
            $stmt->execute([$userId]);
        }
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Marquer une recommandation comme lue
     */
    public function markAsRead($recommendationId, $userId)
    {
        $sql = "UPDATE {$this->table} 
                SET isRead = TRUE 
                WHERE id = ? AND userId = ?";

        $stmt = $this->db->prepare($sql);
        return $stmt->execute([$recommendationId, $userId]);
    }

    /**
     * Marquer une recommandation comme terminée
     */
    public function markAsCompleted($recommendationId, $userId)
    {
        $sql = "UPDATE {$this->table} 
                SET isCompleted = TRUE, completedAt = NOW() 
                WHERE id = ? AND userId = ?";

        $stmt = $this->db->prepare($sql);
        return $stmt->execute([$recommendationId, $userId]);
    }

    /**
     * Récupérer les recommandations par type
     */
    public function getByType($userId, $recommendationType)
    {
        $sql = "SELECT * FROM {$this->table} 
                WHERE userId = ? AND recommendationType = ? 
                ORDER BY priority DESC, createdAt DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$userId, $recommendationType]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Générer des recommandations automatiques basées sur la progression
     */
    public function generateAutomaticRecommendations($userId, $progressData)
    {
        $recommendations = [];

        // Recommandation si progression lente
        if ($progressData['averageScore'] < 60) {
            $recommendations[] = [
                'userId' => $userId,
                'recommendationType' => 'review',
                'priority' => 'high',
                'title' => 'Révision recommandée',
                'description' => 'Votre score moyen est en dessous de 60%. Il est recommandé de réviser les leçons précédentes.',
                'actionRequired' => 'Réviser les leçons avec un score faible',
                'subject' => $progressData['subject'] ?? null,
                'difficultyLevel' => 'easy',
                'estimatedTime' => 30
            ];
        }

        // Recommandation si prêt pour le niveau suivant
        if ($progressData['averageScore'] >= 85 && $progressData['lessonsCompleted'] >= 5) {
            $recommendations[] = [
                'userId' => $userId,
                'recommendationType' => 'new_lesson',
                'priority' => 'medium',
                'title' => 'Prêt pour la suite !',
                'description' => 'Excellent travail ! Vous êtes prêt à passer au niveau suivant.',
                'actionRequired' => 'Commencer une nouvelle leçon de niveau supérieur',
                'subject' => $progressData['subject'] ?? null,
                'difficultyLevel' => 'medium',
                'estimatedTime' => 45
            ];
        }

        // Recommandation si besoin de pratique
        if ($progressData['needsPractice']) {
            $recommendations[] = [
                'userId' => $userId,
                'recommendationType' => 'practice',
                'priority' => 'medium',
                'title' => 'Pratique supplémentaire',
                'description' => 'Un peu plus de pratique vous aiderait à consolider vos acquis.',
                'actionRequired' => 'Faire des exercices supplémentaires',
                'subject' => $progressData['subject'] ?? null,
                'difficultyLevel' => 'medium',
                'estimatedTime' => 20
            ];
        }

        // Créer les recommandations
        foreach ($recommendations as $recommendation) {
            $this->create($recommendation);
        }

        return $recommendations;
    }
}
