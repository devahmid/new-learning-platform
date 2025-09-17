<?php

namespace App\Models;

use App\Core\Database;
use PDO;

class ProgressSession
{
    private $db;
    private $table = 'progress_sessions';

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    /**
     * Démarrer une nouvelle session d'étude
     */
    public function startSession($data)
    {
        $sql = "INSERT INTO {$this->table} 
                (userId, courseId, lessonId, sessionStart, sessionType, progressStart, 
                 deviceType, browserInfo, ipAddress)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

        $stmt = $this->db->prepare($sql);
        $result = $stmt->execute([
            $data['userId'],
            $data['courseId'] ?? null,
            $data['lessonId'] ?? null,
            $data['sessionStart'] ?? date('Y-m-d H:i:s'),
            $data['sessionType'],
            $data['progressStart'] ?? 0.00,
            $data['deviceType'] ?? 'desktop',
            $data['browserInfo'] ?? null,
            $data['ipAddress'] ?? null
        ]);

        return $result ? $this->db->lastInsertId() : false;
    }

    /**
     * Terminer une session d'étude
     */
    public function endSession($sessionId, $data)
    {
        $sql = "UPDATE {$this->table} 
                SET sessionEnd = ?, 
                    duration = TIMESTAMPDIFF(MINUTE, sessionStart, ?),
                    progressEnd = ?,
                    progressGained = ? - progressStart,
                    score = ?,
                    attempts = ?,
                    timePerQuestion = ?
                WHERE id = ?";

        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            $data['sessionEnd'] ?? date('Y-m-d H:i:s'),
            $data['sessionEnd'] ?? date('Y-m-d H:i:s'),
            $data['progressEnd'] ?? 0.00,
            $data['progressEnd'] ?? 0.00,
            $data['score'] ?? null,
            $data['attempts'] ?? 1,
            $data['timePerQuestion'] ?? null,
            $sessionId
        ]);
    }

    /**
     * Récupérer les sessions d'un utilisateur
     */
    public function getByUserId($userId, $limit = null, $offset = 0)
    {
        $sql = "SELECT * FROM {$this->table} 
                WHERE userId = ? 
                ORDER BY sessionStart DESC";
        
        if ($limit) {
            $sql .= " LIMIT ? OFFSET ?";
        }

        $stmt = $this->db->prepare($sql);
        if ($limit) {
            $stmt->execute([$userId, $limit, $offset]);
        } else {
            $stmt->execute([$userId]);
        }
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Récupérer les sessions d'une période donnée
     */
    public function getByPeriod($userId, $startDate, $endDate)
    {
        $sql = "SELECT * FROM {$this->table} 
                WHERE userId = ? 
                AND sessionStart >= ? 
                AND sessionStart <= ?
                ORDER BY sessionStart DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$userId, $startDate, $endDate]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Calculer les statistiques de session
     */
    public function getSessionStats($userId, $period = 'week')
    {
        $dateCondition = match($period) {
            'day' => 'DATE(sessionStart) = CURDATE()',
            'week' => 'sessionStart >= DATE_SUB(NOW(), INTERVAL 1 WEEK)',
            'month' => 'sessionStart >= DATE_SUB(NOW(), INTERVAL 1 MONTH)',
            default => 'sessionStart >= DATE_SUB(NOW(), INTERVAL 1 WEEK)'
        };

        $sql = "SELECT 
                    COUNT(*) as totalSessions,
                    SUM(duration) as totalDuration,
                    AVG(duration) as averageDuration,
                    SUM(progressGained) as totalProgressGained,
                    AVG(progressGained) as averageProgressGained,
                    AVG(score) as averageScore,
                    MAX(score) as bestScore,
                    COUNT(DISTINCT courseId) as coursesStudied,
                    COUNT(DISTINCT lessonId) as lessonsStudied
                FROM {$this->table} 
                WHERE userId = ? AND {$dateCondition}";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$userId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Récupérer les sessions actives (non terminées)
     */
    public function getActiveSessions($userId)
    {
        $sql = "SELECT * FROM {$this->table} 
                WHERE userId = ? AND sessionEnd IS NULL
                ORDER BY sessionStart DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Calculer les patterns d'étude
     */
    public function getStudyPatterns($userId)
    {
        $sql = "SELECT 
                    HOUR(sessionStart) as studyHour,
                    DAYNAME(sessionStart) as studyDay,
                    AVG(duration) as avgDuration,
                    COUNT(*) as sessionCount
                FROM {$this->table} 
                WHERE userId = ? AND sessionEnd IS NOT NULL
                GROUP BY HOUR(sessionStart), DAYNAME(sessionStart)
                ORDER BY sessionCount DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Récupérer les sessions par type
     */
    public function getByType($userId, $sessionType, $limit = null)
    {
        $sql = "SELECT * FROM {$this->table} 
                WHERE userId = ? AND sessionType = ?
                ORDER BY sessionStart DESC";
        
        if ($limit) {
            $sql .= " LIMIT ?";
        }

        $stmt = $this->db->prepare($sql);
        if ($limit) {
            $stmt->execute([$userId, $sessionType, $limit]);
        } else {
            $stmt->execute([$userId, $sessionType]);
        }
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Nettoyer les sessions anciennes (plus de 6 mois)
     */
    public function cleanupOldSessions()
    {
        $sql = "DELETE FROM {$this->table} 
                WHERE sessionStart < DATE_SUB(NOW(), INTERVAL 6 MONTH)";

        $stmt = $this->db->prepare($sql);
        return $stmt->execute();
    }
}
