<?php

namespace App\Models;

use PDO;

class VideoWatchSession
{
    private $db;
    private $table = 'video_watch_sessions';

    public function __construct($database)
    {
        $this->db = $database;
    }

    /**
     * Démarrer une session de visionnage
     */
    public function startSession($data)
    {
        $sql = "INSERT INTO {$this->table} 
                (userId, lessonId, videoUrl, sessionStart, totalDuration, startTime, 
                 quality, playbackSpeed, deviceType, browserInfo, ipAddress, status) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        $stmt = $this->db->prepare($sql);
        $result = $stmt->execute([
            $data['userId'],
            $data['lessonId'],
            $data['videoUrl'],
            $data['sessionStart'] ?? date('Y-m-d H:i:s'),
            $data['totalDuration'] ?? 0,
            $data['startTime'] ?? 0.00,
            $data['quality'] ?? 'auto',
            $data['playbackSpeed'] ?? 1.00,
            $data['deviceType'] ?? 'desktop',
            $data['browserInfo'] ?? null,
            $data['ipAddress'] ?? null,
            'watching'
        ]);

        return $result ? $this->db->lastInsertId() : false;
    }

    /**
     * Mettre à jour une session de visionnage
     */
    public function updateSession($sessionId, $data)
    {
        $sql = "UPDATE {$this->table} 
                SET watchedDuration = ?, 
                    watchPercentage = ?,
                    endTime = ?,
                    lastPosition = ?,
                    pauseCount = ?,
                    seekCount = ?,
                    replayCount = ?,
                    status = ?,
                    isCompleted = ?,
                    sessionEnd = ?
                WHERE id = ?";

        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            $data['watchedDuration'] ?? 0,
            $data['watchPercentage'] ?? 0.00,
            $data['endTime'] ?? 0.00,
            $data['lastPosition'] ?? 0.00,
            $data['pauseCount'] ?? 0,
            $data['seekCount'] ?? 0,
            $data['replayCount'] ?? 0,
            $data['status'] ?? 'watching',
            $data['isCompleted'] ?? false,
            $data['sessionEnd'] ?? date('Y-m-d H:i:s'),
            $sessionId
        ]);
    }

    /**
     * Terminer une session de visionnage
     */
    public function endSession($sessionId, $data)
    {
        $sql = "UPDATE {$this->table} 
                SET sessionEnd = ?, 
                    watchedDuration = ?,
                    watchPercentage = ?,
                    endTime = ?,
                    lastPosition = ?,
                    status = ?,
                    isCompleted = ?
                WHERE id = ?";

        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            $data['sessionEnd'] ?? date('Y-m-d H:i:s'),
            $data['watchedDuration'] ?? 0,
            $data['watchPercentage'] ?? 0.00,
            $data['endTime'] ?? 0.00,
            $data['lastPosition'] ?? 0.00,
            $data['status'] ?? 'completed',
            $data['isCompleted'] ?? false,
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
     * Récupérer les sessions d'une leçon
     */
    public function getByLessonId($lessonId, $userId = null)
    {
        $sql = "SELECT * FROM {$this->table} 
                WHERE lessonId = ?";
        
        $params = [$lessonId];
        
        if ($userId) {
            $sql .= " AND userId = ?";
            $params[] = $userId;
        }
        
        $sql .= " ORDER BY sessionStart DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Récupérer la session active d'un utilisateur pour une leçon
     */
    public function getActiveSession($userId, $lessonId)
    {
        $sql = "SELECT * FROM {$this->table} 
                WHERE userId = ? AND lessonId = ? 
                AND status IN ('watching', 'paused')
                ORDER BY sessionStart DESC 
                LIMIT 1";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$userId, $lessonId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Calculer les statistiques de visionnage
     */
    public function getWatchStats($userId, $period = 'week')
    {
        $dateCondition = $this->getDateCondition($period);
        
        $sql = "SELECT 
                    COUNT(*) as totalSessions,
                    SUM(watchedDuration) as totalWatchTime,
                    AVG(watchedDuration) as averageWatchTime,
                    AVG(watchPercentage) as averageCompletion,
                    SUM(CASE WHEN isCompleted = 1 THEN 1 ELSE 0 END) as completedSessions
                FROM {$this->table} 
                WHERE userId = ? AND sessionStart >= ?";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$userId, $dateCondition]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Récupérer les leçons les plus regardées
     */
    public function getMostWatchedLessons($userId, $limit = 10)
    {
        $sql = "SELECT 
                    lessonId,
                    COUNT(*) as sessionCount,
                    SUM(watchedDuration) as totalWatchTime,
                    AVG(watchPercentage) as averageCompletion
                FROM {$this->table} 
                WHERE userId = ? 
                GROUP BY lessonId 
                ORDER BY totalWatchTime DESC 
                LIMIT ?";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$userId, $limit]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    private function getDateCondition($period)
    {
        switch ($period) {
            case 'day':
                return date('Y-m-d 00:00:00');
            case 'week':
                return date('Y-m-d 00:00:00', strtotime('-7 days'));
            case 'month':
                return date('Y-m-d 00:00:00', strtotime('-30 days'));
            case 'year':
                return date('Y-m-d 00:00:00', strtotime('-365 days'));
            default:
                return date('Y-m-d 00:00:00', strtotime('-7 days'));
        }
    }
}
