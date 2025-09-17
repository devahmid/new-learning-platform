<?php

namespace App\Models;

use App\Core\Database;
use PDO;

class ProgressAchievement
{
    private $db;
    private $table = 'progress_achievements';

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    /**
     * Créer un nouvel achievement
     */
    public function create($data)
    {
        $sql = "INSERT INTO {$this->table} 
                (userId, achievementType, achievementName, description, icon, points, unlockedAt, metadata)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            $data['userId'],
            $data['achievementType'],
            $data['achievementName'],
            $data['description'] ?? '',
            $data['icon'] ?? 'trophy',
            $data['points'] ?? 0,
            $data['unlockedAt'] ?? date('Y-m-d H:i:s'),
            json_encode($data['metadata'] ?? [])
        ]);
    }

    /**
     * Récupérer les achievements d'un utilisateur
     */
    public function getByUserId($userId, $limit = null)
    {
        $sql = "SELECT * FROM {$this->table} WHERE userId = ? ORDER BY unlockedAt DESC";
        
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
     * Vérifier si un achievement existe déjà
     */
    public function exists($userId, $achievementType, $metadata = [])
    {
        $sql = "SELECT COUNT(*) FROM {$this->table} 
                WHERE userId = ? AND achievementType = ?";
        
        $params = [$userId, $achievementType];
        
        if (!empty($metadata)) {
            $sql .= " AND JSON_CONTAINS(metadata, ?)";
            $params[] = json_encode($metadata);
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchColumn() > 0;
    }

    /**
     * Récupérer les achievements récents (derniers 7 jours)
     */
    public function getRecentAchievements($userId, $days = 7)
    {
        $sql = "SELECT * FROM {$this->table} 
                WHERE userId = ? AND unlockedAt >= DATE_SUB(NOW(), INTERVAL ? DAY)
                ORDER BY unlockedAt DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$userId, $days]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Calculer le total des points d'un utilisateur
     */
    public function getTotalPoints($userId)
    {
        $sql = "SELECT SUM(points) as totalPoints FROM {$this->table} WHERE userId = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$userId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result['totalPoints'] ?? 0;
    }

    /**
     * Récupérer les achievements par type
     */
    public function getByType($userId, $achievementType)
    {
        $sql = "SELECT * FROM {$this->table} 
                WHERE userId = ? AND achievementType = ? 
                ORDER BY unlockedAt DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$userId, $achievementType]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Vérifier et débloquer les achievements automatiques
     */
    public function checkAutomaticAchievements($userId, $progressData)
    {
        $achievements = [];

        // Achievement: Premier cours terminé
        if ($progressData['lessonsCompleted'] >= 1 && !$this->exists($userId, 'completion', ['milestone' => 'first_lesson'])) {
            $achievements[] = [
                'userId' => $userId,
                'achievementType' => 'completion',
                'achievementName' => 'Premier Pas',
                'description' => 'Vous avez terminé votre première leçon !',
                'icon' => 'star',
                'points' => 10,
                'metadata' => ['milestone' => 'first_lesson']
            ];
        }

        // Achievement: Streak de 7 jours
        if ($progressData['studyStreak'] >= 7 && !$this->exists($userId, 'study_streak', ['days' => 7])) {
            $achievements[] = [
                'userId' => $userId,
                'achievementType' => 'study_streak',
                'achievementName' => 'Étudiant Assidu',
                'description' => '7 jours consécutifs d\'étude !',
                'icon' => 'fire',
                'points' => 25,
                'metadata' => ['days' => 7]
            ];
        }

        // Achievement: Score parfait
        if ($progressData['averageScore'] >= 100 && !$this->exists($userId, 'score_milestone', ['score' => 100])) {
            $achievements[] = [
                'userId' => $userId,
                'achievementType' => 'score_milestone',
                'achievementName' => 'Parfait !',
                'description' => 'Score parfait de 100% !',
                'icon' => 'crown',
                'points' => 50,
                'metadata' => ['score' => 100]
            ];
        }

        // Créer les achievements
        foreach ($achievements as $achievement) {
            $this->create($achievement);
        }

        return $achievements;
    }
}
