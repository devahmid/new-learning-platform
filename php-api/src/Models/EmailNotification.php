<?php

namespace App\Models;

use PDO;

class EmailNotification
{
    private $db;
    private $table = 'email_notifications';

    public function __construct($database)
    {
        $this->db = $database;
    }

    /**
     * Créer une notification email
     */
    public function create($data)
    {
        $sql = "INSERT INTO {$this->table} 
                (message_id, recipient_email, subject, content, status, max_attempts) 
                VALUES (?, ?, ?, ?, ?, ?)";

        $stmt = $this->db->prepare($sql);
        $result = $stmt->execute([
            $data['message_id'],
            $data['recipient_email'],
            $data['subject'],
            $data['content'],
            $data['status'] ?? 'pending',
            $data['max_attempts'] ?? 3
        ]);

        return $result ? $this->db->lastInsertId() : false;
    }

    /**
     * Récupérer les notifications en attente
     */
    public function getPending($limit = 10)
    {
        $sql = "SELECT * FROM {$this->table} 
                WHERE status = 'pending' 
                AND (next_attempt_at IS NULL OR next_attempt_at <= NOW())
                AND attempts < max_attempts
                ORDER BY created_at ASC
                LIMIT ?";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$limit]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Marquer une notification comme envoyée
     */
    public function markAsSent($id)
    {
        $sql = "UPDATE {$this->table} 
                SET status = 'sent', sent_at = CURRENT_TIMESTAMP 
                WHERE id = ?";

        $stmt = $this->db->prepare($sql);
        return $stmt->execute([$id]);
    }

    /**
     * Marquer une notification comme échouée
     */
    public function markAsFailed($id, $errorMessage = null)
    {
        $sql = "UPDATE {$this->table} 
                SET status = 'failed', error_message = ?, attempts = attempts + 1,
                    next_attempt_at = CASE 
                        WHEN attempts + 1 < max_attempts THEN DATE_ADD(NOW(), INTERVAL POWER(2, attempts) MINUTE)
                        ELSE NULL
                    END
                WHERE id = ?";

        $stmt = $this->db->prepare($sql);
        return $stmt->execute([$errorMessage, $id]);
    }

    /**
     * Marquer une notification comme rebondie
     */
    public function markAsBounced($id)
    {
        $sql = "UPDATE {$this->table} 
                SET status = 'bounced', sent_at = CURRENT_TIMESTAMP 
                WHERE id = ?";

        $stmt = $this->db->prepare($sql);
        return $stmt->execute([$id]);
    }

    /**
     * Récupérer les statistiques d'envoi
     */
    public function getStats($dateFrom = null, $dateTo = null)
    {
        $sql = "SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent,
                    SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                    SUM(CASE WHEN status = 'bounced' THEN 1 ELSE 0 END) as bounced
                FROM {$this->table}";

        $params = [];

        if ($dateFrom) {
            $sql .= " WHERE created_at >= ?";
            $params[] = $dateFrom;
        }

        if ($dateTo) {
            $sql .= ($dateFrom ? " AND" : " WHERE") . " created_at <= ?";
            $params[] = $dateTo;
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Nettoyer les anciennes notifications
     */
    public function cleanup($daysOld = 30)
    {
        $sql = "DELETE FROM {$this->table} 
                WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)
                AND status IN ('sent', 'bounced')";

        $stmt = $this->db->prepare($sql);
        return $stmt->execute([$daysOld]);
    }

    /**
     * Récupérer les notifications d'un message
     */
    public function getByMessageId($messageId)
    {
        $sql = "SELECT * FROM {$this->table} WHERE message_id = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$messageId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Récupérer les notifications d'un email
     */
    public function getByEmail($email, $limit = 50)
    {
        $sql = "SELECT en.*, m.subject as message_subject, m.created_at as message_created_at
                FROM {$this->table} en
                LEFT JOIN messages m ON en.message_id = m.id
                WHERE en.recipient_email = ?
                ORDER BY en.created_at DESC
                LIMIT ?";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$email, $limit]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
