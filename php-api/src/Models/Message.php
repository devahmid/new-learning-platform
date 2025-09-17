<?php

namespace App\Models;

use PDO;

class Message
{
    private $db;
    private $table = 'messages';

    public function __construct($database)
    {
        $this->db = $database;
    }

    /**
     * Créer un nouveau message
     */
    public function create($data)
    {
        $sql = "INSERT INTO {$this->table} 
                (senderId, receiverId, subject, content, type, priority) 
                VALUES (?, ?, ?, ?, ?, ?)";

        $stmt = $this->db->prepare($sql);
        $result = $stmt->execute([
            $data['sender_id'] ?? $data['senderId'],
            $data['recipient_id'] ?? $data['receiverId'],
            $data['subject'],
            $data['content'],
            $data['message_type'] ?? $data['type'] ?? 'message',
            $data['is_important'] ? 'high' : 'normal'
        ]);

        return $result ? $this->db->lastInsertId() : false;
    }

    /**
     * Récupérer les messages d'un utilisateur
     */
    public function getByUserId($userId, $filters = [])
    {
        $sql = "SELECT m.*, 
                       sender.firstName as sender_name, sender.lastName as sender_lastname,
                       receiver.firstName as recipient_name, receiver.lastName as recipient_lastname
                FROM {$this->table} m
                LEFT JOIN users sender ON m.senderId = sender.id
                LEFT JOIN users receiver ON m.receiverId = receiver.id
                WHERE m.receiverId = ?";

        $params = [$userId];

        // Filtres
        if (isset($filters['is_read'])) {
            $sql .= " AND m.isRead = ?";
            $params[] = $filters['is_read'];
        }

        if (isset($filters['is_important'])) {
            $sql .= " AND m.priority = ?";
            $params[] = $filters['is_important'] ? 'high' : 'normal';
        }

        if (isset($filters['message_type'])) {
            $sql .= " AND m.type = ?";
            $params[] = $filters['message_type'];
        }

        $sql .= " ORDER BY m.createdAt DESC";

        if (isset($filters['limit'])) {
            $sql .= " LIMIT ?";
            $params[] = $filters['limit'];
        }

        if (isset($filters['offset'])) {
            $sql .= " OFFSET ?";
            $params[] = $filters['offset'];
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Récupérer un message par ID
     */
    public function getById($id)
    {
        $sql = "SELECT m.*, 
                       sender.firstName as sender_name, sender.lastName as sender_lastname, sender.email as sender_email,
                       receiver.firstName as recipient_name, receiver.lastName as recipient_lastname, receiver.email as recipient_email
                FROM {$this->table} m
                LEFT JOIN users sender ON m.senderId = sender.id
                LEFT JOIN users receiver ON m.receiverId = receiver.id
                WHERE m.id = ?";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Marquer un message comme lu
     */
    public function markAsRead($id)
    {
        $sql = "UPDATE {$this->table} 
                SET isRead = TRUE, readAt = CURRENT_TIMESTAMP 
                WHERE id = ? AND isRead = FALSE";

        $stmt = $this->db->prepare($sql);
        return $stmt->execute([$id]);
    }

    /**
     * Marquer un message comme important
     */
    public function toggleImportant($id)
    {
        $sql = "UPDATE {$this->table} 
                SET priority = CASE WHEN priority = 'high' THEN 'normal' ELSE 'high' END 
                WHERE id = ?";

        $stmt = $this->db->prepare($sql);
        return $stmt->execute([$id]);
    }


    /**
     * Supprimer un message
     */
    public function delete($id)
    {
        $sql = "DELETE FROM {$this->table} WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([$id]);
    }

    /**
     * Compter les messages non lus
     */
    public function countUnread($userId)
    {
        $sql = "SELECT COUNT(*) as count 
                FROM {$this->table} 
                WHERE receiverId = ? AND isRead = FALSE";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$userId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result['count'];
    }

    /**
     * Récupérer les conversations (threads)
     */
    public function getConversations($userId, $limit = 20)
    {
        $sql = "SELECT DISTINCT
                    CASE 
                        WHEN m.senderId = ? THEN m.receiverId 
                        ELSE m.senderId 
                    END as other_user_id,
                    CASE 
                        WHEN m.senderId = ? THEN CONCAT(receiver.firstName, ' ', receiver.lastName)
                        ELSE CONCAT(sender.firstName, ' ', sender.lastName)
                    END as other_user_name,
                    CASE 
                        WHEN m.senderId = ? THEN receiver.email
                        ELSE sender.email
                    END as other_user_email,
                    MAX(m.content) as last_message,
                    MAX(m.createdAt) as last_message_date,
                    COUNT(*) as message_count,
                    SUM(CASE WHEN m.receiverId = ? AND m.isRead = FALSE THEN 1 ELSE 0 END) as unread_count
                FROM {$this->table} m
                LEFT JOIN users sender ON m.senderId = sender.id
                LEFT JOIN users receiver ON m.receiverId = receiver.id
                WHERE m.senderId = ? OR m.receiverId = ?
                GROUP BY other_user_id, other_user_name, other_user_email
                ORDER BY last_message_date DESC
                LIMIT ?";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$userId, $userId, $userId, $userId, $userId, $userId, $limit]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Récupérer les messages d'une conversation
     */
    public function getConversationMessages($userId1, $userId2, $limit = 50)
    {
        $sql = "SELECT m.*, 
                       sender.firstName as sender_name, sender.lastName as sender_lastname,
                       receiver.firstName as recipient_name, receiver.lastName as recipient_lastname
                FROM {$this->table} m
                LEFT JOIN users sender ON m.senderId = sender.id
                LEFT JOIN users receiver ON m.receiverId = receiver.id
                WHERE ((m.senderId = ? AND m.receiverId = ?) 
                    OR (m.senderId = ? AND m.receiverId = ?))
                ORDER BY m.createdAt ASC
                LIMIT ?";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$userId1, $userId2, $userId2, $userId1, $limit]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Rechercher des messages
     */
    public function search($userId, $query, $limit = 20)
    {
        $sql = "SELECT m.*, 
                       sender.firstName as sender_name, sender.lastName as sender_lastname,
                       receiver.firstName as recipient_name, receiver.lastName as recipient_lastname
                FROM {$this->table} m
                LEFT JOIN users sender ON m.senderId = sender.id
                LEFT JOIN users receiver ON m.receiverId = receiver.id
                WHERE m.receiverId = ? 
                AND (m.subject LIKE ? OR m.content LIKE ?)
                ORDER BY m.createdAt DESC
                LIMIT ?";

        $searchTerm = "%{$query}%";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$userId, $searchTerm, $searchTerm, $limit]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
