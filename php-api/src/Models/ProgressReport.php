<?php

namespace App\Models;

use App\Core\Database;
use PDO;

class ProgressReport
{
    private $db;
    private $table = 'progress_reports';

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    /**
     * Créer un nouveau rapport
     */
    public function create($data)
    {
        $sql = "INSERT INTO {$this->table} 
                (userId, parentId, reportType, periodStart, periodEnd, reportData, generatedAt)
                VALUES (?, ?, ?, ?, ?, ?, ?)";

        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            $data['userId'],
            $data['parentId'] ?? null,
            $data['reportType'],
            $data['periodStart'],
            $data['periodEnd'],
            json_encode($data['reportData']),
            $data['generatedAt'] ?? date('Y-m-d H:i:s')
        ]);
    }

    /**
     * Récupérer les rapports d'un utilisateur
     */
    public function getByUserId($userId, $reportType = null, $limit = null)
    {
        $sql = "SELECT * FROM {$this->table} WHERE userId = ?";
        $params = [$userId];

        if ($reportType) {
            $sql .= " AND reportType = ?";
            $params[] = $reportType;
        }

        $sql .= " ORDER BY generatedAt DESC";

        if ($limit) {
            $sql .= " LIMIT ?";
            $params[] = $limit;
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Récupérer les rapports pour un parent
     */
    public function getByParentId($parentId, $limit = null)
    {
        $sql = "SELECT * FROM {$this->table} 
                WHERE parentId = ? 
                ORDER BY generatedAt DESC";
        
        if ($limit) {
            $sql .= " LIMIT ?";
        }

        $stmt = $this->db->prepare($sql);
        if ($limit) {
            $stmt->execute([$parentId, $limit]);
        } else {
            $stmt->execute([$parentId]);
        }
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Marquer un rapport comme lu
     */
    public function markAsRead($reportId, $userId)
    {
        $sql = "UPDATE {$this->table} 
                SET isRead = TRUE, readAt = NOW() 
                WHERE id = ? AND (userId = ? OR parentId = ?)";

        $stmt = $this->db->prepare($sql);
        return $stmt->execute([$reportId, $userId, $userId]);
    }

    /**
     * Générer un rapport hebdomadaire
     */
    public function generateWeeklyReport($userId)
    {
        $startDate = date('Y-m-d', strtotime('monday this week'));
        $endDate = date('Y-m-d', strtotime('sunday this week'));

        $analyticsModel = new StudentProgressAnalytics();
        $sessionModel = new ProgressSession();
        $achievementModel = new ProgressAchievement();

        // Récupérer les données de la semaine
        $analytics = $analyticsModel->getByUserId($userId);
        $sessions = $sessionModel->getByPeriod($userId, $startDate, $endDate);
        $achievements = $achievementModel->getRecentAchievements($userId, 7);

        // Calculer les statistiques
        $totalStudyTime = array_sum(array_column($sessions, 'duration'));
        $averageScore = $sessions ? array_sum(array_column($sessions, 'score')) / count($sessions) : 0;
        $lessonsCompleted = count(array_filter($sessions, function($s) { return $s['progressGained'] > 0; }));

        $reportData = [
            'period' => [
                'start' => $startDate,
                'end' => $endDate
            ],
            'summary' => [
                'totalStudyTime' => $totalStudyTime,
                'averageScore' => round($averageScore, 2),
                'lessonsCompleted' => $lessonsCompleted,
                'newAchievements' => count($achievements),
                'studyStreak' => $analytics[0]['studyStreak'] ?? 0
            ],
            'analytics' => $analytics,
            'sessions' => $sessions,
            'achievements' => $achievements,
            'recommendations' => $this->generateRecommendations($analytics)
        ];

        return $this->create([
            'userId' => $userId,
            'reportType' => 'weekly',
            'periodStart' => $startDate,
            'periodEnd' => $endDate,
            'reportData' => $reportData
        ]);
    }

    /**
     * Générer des recommandations basées sur les analytics
     */
    private function generateRecommendations($analytics)
    {
        $recommendations = [];

        foreach ($analytics as $analytic) {
            if ($analytic['averageScore'] < 70) {
                $recommendations[] = [
                    'type' => 'review',
                    'subject' => $analytic['subject'],
                    'message' => "Révision recommandée pour {$analytic['subject']}",
                    'priority' => 'high'
                ];
            }

            if ($analytic['studyStreak'] >= 7) {
                $recommendations[] = [
                    'type' => 'congratulate',
                    'subject' => 'Général',
                    'message' => "Excellent ! {$analytic['studyStreak']} jours consécutifs d'étude !",
                    'priority' => 'low'
                ];
            }
        }

        return $recommendations;
    }
}
