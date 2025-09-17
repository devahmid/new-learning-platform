<?php

namespace App\Models;

use App\Core\Database;
use PDO;

class ProgressNotification
{
    private $db;
    private $table = 'progress_notifications';

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    /**
     * Créer une nouvelle notification
     */
    public function create($data)
    {
        $sql = "INSERT INTO {$this->table} 
                (userId, parentId, notificationType, priority, title, message, actionUrl,
                 courseId, lessonId, metadata, expiresAt)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            $data['userId'],
            $data['parentId'] ?? null,
            $data['notificationType'],
            $data['priority'] ?? 'normal',
            $data['title'],
            $data['message'],
            $data['actionUrl'] ?? null,
            $data['courseId'] ?? null,
            $data['lessonId'] ?? null,
            json_encode($data['metadata'] ?? []),
            $data['expiresAt'] ?? null
        ]);
    }

    /**
     * Récupérer les notifications d'un utilisateur
     */
    public function getByUserId($userId, $unreadOnly = false, $limit = null)
    {
        $sql = "SELECT * FROM {$this->table} 
                WHERE userId = ? AND (expiresAt IS NULL OR expiresAt > NOW())";
        
        if ($unreadOnly) {
            $sql .= " AND isRead = FALSE";
        }

        $sql .= " ORDER BY priority DESC, createdAt DESC";

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
     * Récupérer les notifications pour un parent
     */
    public function getByParentId($parentId, $unreadOnly = false, $limit = null)
    {
        $sql = "SELECT * FROM {$this->table} 
                WHERE parentId = ? AND (expiresAt IS NULL OR expiresAt > NOW())";
        
        if ($unreadOnly) {
            $sql .= " AND isRead = FALSE";
        }

        $sql .= " ORDER BY priority DESC, createdAt DESC";

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
     * Marquer une notification comme lue
     */
    public function markAsRead($notificationId, $userId)
    {
        $sql = "UPDATE {$this->table} 
                SET isRead = TRUE, readAt = NOW() 
                WHERE id = ? AND (userId = ? OR parentId = ?)";

        $stmt = $this->db->prepare($sql);
        return $stmt->execute([$notificationId, $userId, $userId]);
    }

    /**
     * Marquer toutes les notifications comme lues
     */
    public function markAllAsRead($userId)
    {
        $sql = "UPDATE {$this->table} 
                SET isRead = TRUE, readAt = NOW() 
                WHERE (userId = ? OR parentId = ?) AND isRead = FALSE";

        $stmt = $this->db->prepare($sql);
        return $stmt->execute([$userId, $userId]);
    }

    /**
     * Compter les notifications non lues
     */
    public function countUnread($userId)
    {
        $sql = "SELECT COUNT(*) FROM {$this->table} 
                WHERE (userId = ? OR parentId = ?) 
                AND isRead = FALSE 
                AND (expiresAt IS NULL OR expiresAt > NOW())";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$userId, $userId]);
        return $stmt->fetchColumn();
    }

    /**
     * Créer une notification de progression
     */
    public function createProgressNotification($userId, $parentId, $type, $data)
    {
        $notifications = [];

        switch ($type) {
            case 'milestone':
                $notifications[] = [
                    'userId' => $userId,
                    'parentId' => $parentId,
                    'notificationType' => 'progress_milestone',
                    'priority' => 'normal',
                    'title' => 'Nouveau jalon atteint !',
                    'message' => "Félicitations ! Vous avez atteint {$data['milestone']}% de progression.",
                    'actionUrl' => '/progress',
                    'metadata' => $data
                ];
                break;

            case 'achievement':
                $notifications[] = [
                    'userId' => $userId,
                    'parentId' => $parentId,
                    'notificationType' => 'achievement_unlocked',
                    'priority' => 'high',
                    'title' => 'Nouveau succès débloqué !',
                    'message' => "Vous avez débloqué le succès : {$data['achievementName']}",
                    'actionUrl' => '/achievements',
                    'metadata' => $data
                ];
                break;

            case 'slow_progress':
                $notifications[] = [
                    'userId' => $userId,
                    'parentId' => $parentId,
                    'notificationType' => 'slow_progress',
                    'priority' => 'high',
                    'title' => 'Progression lente détectée',
                    'message' => "Votre progression semble ralentir. Besoin d'aide ?",
                    'actionUrl' => '/help',
                    'metadata' => $data
                ];
                break;

            case 'study_reminder':
                $notifications[] = [
                    'userId' => $userId,
                    'parentId' => $parentId,
                    'notificationType' => 'study_reminder',
                    'priority' => 'normal',
                    'title' => 'Rappel d\'étude',
                    'message' => "Il est temps de continuer votre apprentissage !",
                    'actionUrl' => '/dashboard',
                    'metadata' => $data
                ];
                break;
        }

        foreach ($notifications as $notification) {
            $this->create($notification);
        }

        return $notifications;
    }

    /**
     * Nettoyer les notifications expirées
     */
    public function cleanupExpired()
    {
        $sql = "DELETE FROM {$this->table} 
                WHERE expiresAt IS NOT NULL AND expiresAt < NOW()";

        $stmt = $this->db->prepare($sql);
        return $stmt->execute();
    }
}
