<?php

namespace App\Models;

use App\Core\Database;
use PDO;

class ProgressInsight
{
    private $db;
    private $table = 'progress_insights';

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    /**
     * Créer un nouvel insight
     */
    public function create($data)
    {
        $sql = "INSERT INTO {$this->table} 
                (userId, insightType, title, description, insightData, confidence, impact)
                VALUES (?, ?, ?, ?, ?, ?, ?)";

        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            $data['userId'],
            $data['insightType'],
            $data['title'],
            $data['description'],
            json_encode($data['insightData']),
            $data['confidence'] ?? 0.00,
            $data['impact'] ?? 'medium'
        ]);
    }

    /**
     * Récupérer les insights d'un utilisateur
     */
    public function getByUserId($userId, $insightType = null, $activeOnly = true)
    {
        $sql = "SELECT * FROM {$this->table} WHERE userId = ?";
        $params = [$userId];

        if ($insightType) {
            $sql .= " AND insightType = ?";
            $params[] = $insightType;
        }

        if ($activeOnly) {
            $sql .= " AND isActive = TRUE";
        }

        $sql .= " ORDER BY confidence DESC, createdAt DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Marquer un insight comme lu
     */
    public function markAsRead($insightId, $userId)
    {
        $sql = "UPDATE {$this->table} 
                SET isRead = TRUE, readAt = NOW() 
                WHERE id = ? AND userId = ?";

        $stmt = $this->db->prepare($sql);
        return $stmt->execute([$insightId, $userId]);
    }

    /**
     * Désactiver un insight
     */
    public function deactivate($insightId, $userId)
    {
        $sql = "UPDATE {$this->table} 
                SET isActive = FALSE 
                WHERE id = ? AND userId = ?";

        $stmt = $this->db->prepare($sql);
        return $stmt->execute([$insightId, $userId]);
    }

    /**
     * Générer des insights automatiques basés sur la progression
     */
    public function generateInsights($userId, $progressData)
    {
        $insights = [];

        // Insight sur les patterns d'apprentissage
        if ($this->hasConsistentStudyPattern($progressData)) {
            $insights[] = [
                'userId' => $userId,
                'insightType' => 'learning_pattern',
                'title' => 'Pattern d\'apprentissage détecté',
                'description' => 'Vous avez un pattern d\'étude régulier. Continuez comme ça !',
                'insightData' => [
                    'pattern' => 'consistent',
                    'frequency' => $progressData['studyFrequency'] ?? 'daily',
                    'time' => $progressData['preferredTime'] ?? 'afternoon'
                ],
                'confidence' => 0.85,
                'impact' => 'medium'
            ];
        }

        // Insight sur les performances
        if ($this->hasImprovingPerformance($progressData)) {
            $insights[] = [
                'userId' => $userId,
                'insightType' => 'performance_trend',
                'title' => 'Amélioration des performances',
                'description' => 'Vos scores s\'améliorent régulièrement. Excellent travail !',
                'insightData' => [
                    'trend' => 'improving',
                    'improvement' => $progressData['scoreImprovement'] ?? 15,
                    'period' => 'last_week'
                ],
                'confidence' => 0.90,
                'impact' => 'high'
            ];
        }

        // Insight sur les zones de difficulté
        if ($this->hasDifficultyAreas($progressData)) {
            $insights[] = [
                'userId' => $userId,
                'insightType' => 'difficulty_analysis',
                'title' => 'Zones à améliorer identifiées',
                'description' => 'Certaines matières nécessitent plus d\'attention.',
                'insightData' => [
                    'difficultSubjects' => $progressData['difficultyAreas'] ?? [],
                    'recommendations' => $this->getDifficultyRecommendations($progressData)
                ],
                'confidence' => 0.75,
                'impact' => 'high'
            ];
        }

        // Créer les insights
        foreach ($insights as $insight) {
            $this->create($insight);
        }

        return $insights;
    }

    /**
     * Vérifier si l'utilisateur a un pattern d'étude cohérent
     */
    private function hasConsistentStudyPattern($progressData)
    {
        // Logique pour détecter un pattern cohérent
        return isset($progressData['studyStreak']) && $progressData['studyStreak'] >= 5;
    }

    /**
     * Vérifier si les performances s'améliorent
     */
    private function hasImprovingPerformance($progressData)
    {
        // Logique pour détecter une amélioration des performances
        return isset($progressData['scoreTrend']) && $progressData['scoreTrend'] > 0;
    }

    /**
     * Vérifier s'il y a des zones de difficulté
     */
    private function hasDifficultyAreas($progressData)
    {
        return isset($progressData['difficultyAreas']) && !empty($progressData['difficultyAreas']);
    }

    /**
     * Obtenir des recommandations pour les zones difficiles
     */
    private function getDifficultyRecommendations($progressData)
    {
        $recommendations = [];
        
        if (isset($progressData['difficultyAreas'])) {
            foreach ($progressData['difficultyAreas'] as $subject) {
                $recommendations[] = [
                    'subject' => $subject,
                    'action' => 'Réviser les leçons de base',
                    'time' => '30 minutes par jour'
                ];
            }
        }

        return $recommendations;
    }
}
