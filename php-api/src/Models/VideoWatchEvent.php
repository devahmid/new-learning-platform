<?php

namespace App\Models;

use PDO;

class VideoWatchEvent
{
    private $db;
    private $table = 'video_watch_events';

    public function __construct($database)
    {
        $this->db = $database;
    }

    /**
     * Enregistrer un événement de visionnage
     */
    public function recordEvent($data)
    {
        $sql = "INSERT INTO {$this->table} 
                (sessionId, userId, lessonId, eventType, timestamp, eventTime, 
                 eventData, deviceType) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            $data['sessionId'],
            $data['userId'],
            $data['lessonId'],
            $data['eventType'],
            $data['timestamp'],
            $data['eventTime'] ?? date('Y-m-d H:i:s'),
            $data['eventData'] ? json_encode($data['eventData']) : null,
            $data['deviceType'] ?? 'desktop'
        ]);
    }

    /**
     * Récupérer les événements d'une session
     */
    public function getBySessionId($sessionId)
    {
        $sql = "SELECT * FROM {$this->table} 
                WHERE sessionId = ? 
                ORDER BY eventTime ASC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$sessionId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Récupérer les événements d'un utilisateur
     */
    public function getByUserId($userId, $lessonId = null, $limit = null)
    {
        $sql = "SELECT * FROM {$this->table} 
                WHERE userId = ?";
        
        $params = [$userId];
        
        if ($lessonId) {
            $sql .= " AND lessonId = ?";
            $params[] = $lessonId;
        }
        
        $sql .= " ORDER BY eventTime DESC";
        
        if ($limit) {
            $sql .= " LIMIT ?";
            $params[] = $limit;
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Analyser les patterns de visionnage
     */
    public function analyzeWatchPatterns($userId, $lessonId)
    {
        $sql = "SELECT 
                    eventType,
                    COUNT(*) as eventCount,
                    AVG(timestamp) as averageTimestamp,
                    MIN(timestamp) as firstOccurrence,
                    MAX(timestamp) as lastOccurrence
                FROM {$this->table} 
                WHERE userId = ? AND lessonId = ?
                GROUP BY eventType
                ORDER BY eventCount DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$userId, $lessonId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Récupérer les points de pause fréquents
     */
    public function getFrequentPausePoints($userId, $lessonId, $threshold = 3)
    {
        $sql = "SELECT 
                    ROUND(timestamp, 0) as pauseTime,
                    COUNT(*) as pauseCount
                FROM {$this->table} 
                WHERE userId = ? AND lessonId = ? AND eventType = 'pause'
                GROUP BY ROUND(timestamp, 0)
                HAVING pauseCount >= ?
                ORDER BY pauseCount DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$userId, $lessonId, $threshold]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Récupérer les segments les plus regardés
     */
    public function getMostWatchedSegments($userId, $lessonId, $segmentSize = 30)
    {
        $sql = "SELECT 
                    FLOOR(timestamp / ?) * ? as segmentStart,
                    FLOOR(timestamp / ?) * ? + ? as segmentEnd,
                    COUNT(*) as watchCount
                FROM {$this->table} 
                WHERE userId = ? AND lessonId = ? AND eventType = 'play'
                GROUP BY FLOOR(timestamp / ?)
                ORDER BY watchCount DESC
                LIMIT 10";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$segmentSize, $segmentSize, $segmentSize, $segmentSize, $segmentSize, $userId, $lessonId, $segmentSize]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Calculer l'engagement vidéo
     */
    public function calculateEngagement($userId, $lessonId)
    {
        $sql = "SELECT 
                    COUNT(CASE WHEN eventType = 'play' THEN 1 END) as playEvents,
                    COUNT(CASE WHEN eventType = 'pause' THEN 1 END) as pauseEvents,
                    COUNT(CASE WHEN eventType = 'seek' THEN 1 END) as seekEvents,
                    COUNT(CASE WHEN eventType = 'replay' THEN 1 END) as replayEvents,
                    AVG(CASE WHEN eventType = 'play' THEN timestamp END) as averagePlayPosition
                FROM {$this->table} 
                WHERE userId = ? AND lessonId = ?";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$userId, $lessonId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
