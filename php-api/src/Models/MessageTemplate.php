<?php

namespace App\Models;

use PDO;

class MessageTemplate
{
    private $db;
    private $table = 'message_templates';

    public function __construct($database)
    {
        $this->db = $database;
    }

    /**
     * Créer un nouveau template
     */
    public function create($data)
    {
        $sql = "INSERT INTO {$this->table} 
                (name, subject, content, template_type, available_variables, is_system, created_by) 
                VALUES (?, ?, ?, ?, ?, ?, ?)";

        $stmt = $this->db->prepare($sql);
        $result = $stmt->execute([
            $data['name'],
            $data['subject'],
            $data['content'],
            $data['template_type'] ?? 'custom',
            $data['available_variables'] ? json_encode($data['available_variables']) : null,
            $data['is_system'] ?? false,
            $data['created_by']
        ]);

        return $result ? $this->db->lastInsertId() : false;
    }

    /**
     * Récupérer tous les templates
     */
    public function getAll($filters = [])
    {
        $sql = "SELECT t.*, u.firstName as created_by_name, u.lastName as created_by_lastname
                FROM {$this->table} t
                LEFT JOIN users u ON t.created_by = u.id
                WHERE 1=1";

        $params = [];

        if (isset($filters['is_active'])) {
            $sql .= " AND t.is_active = ?";
            $params[] = $filters['is_active'];
        }

        if (isset($filters['template_type'])) {
            $sql .= " AND t.template_type = ?";
            $params[] = $filters['template_type'];
        }

        if (isset($filters['created_by'])) {
            $sql .= " AND t.created_by = ?";
            $params[] = $filters['created_by'];
        }

        $sql .= " ORDER BY t.template_type, t.name";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Récupérer un template par ID
     */
    public function getById($id)
    {
        $sql = "SELECT t.*, u.firstName as created_by_name, u.lastName as created_by_lastname
                FROM {$this->table} t
                LEFT JOIN users u ON t.created_by = u.id
                WHERE t.id = ?";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Récupérer un template par type
     */
    public function getByType($type)
    {
        $sql = "SELECT * FROM {$this->table} 
                WHERE template_type = ? AND is_active = TRUE 
                ORDER BY name";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$type]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Mettre à jour un template
     */
    public function update($id, $data)
    {
        $sql = "UPDATE {$this->table} 
                SET name = ?, subject = ?, content = ?, template_type = ?, 
                    available_variables = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ? AND is_system = FALSE";

        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            $data['name'],
            $data['subject'],
            $data['content'],
            $data['template_type'],
            $data['available_variables'] ? json_encode($data['available_variables']) : null,
            $data['is_active'] ?? true,
            $id
        ]);
    }

    /**
     * Supprimer un template
     */
    public function delete($id)
    {
        $sql = "DELETE FROM {$this->table} 
                WHERE id = ? AND is_system = FALSE";

        $stmt = $this->db->prepare($sql);
        return $stmt->execute([$id]);
    }

    /**
     * Activer/Désactiver un template
     */
    public function toggleActive($id)
    {
        $sql = "UPDATE {$this->table} 
                SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?";

        $stmt = $this->db->prepare($sql);
        return $stmt->execute([$id]);
    }

    /**
     * Remplacer les variables dans un template
     */
    public function processTemplate($templateId, $variables = [])
    {
        $template = $this->getById($templateId);
        if (!$template) {
            return false;
        }

        $subject = $template['subject'];
        $content = $template['content'];

        // Remplacer les variables
        foreach ($variables as $key => $value) {
            $placeholder = '{' . $key . '}';
            $subject = str_replace($placeholder, $value, $subject);
            $content = str_replace($placeholder, $value, $content);
        }

        return [
            'subject' => $subject,
            'content' => $content,
            'template' => $template
        ];
    }

    /**
     * Récupérer les variables disponibles d'un template
     */
    public function getAvailableVariables($templateId)
    {
        $template = $this->getById($templateId);
        if (!$template || !$template['available_variables']) {
            return [];
        }

        return json_decode($template['available_variables'], true);
    }

    /**
     * Valider les variables d'un template
     */
    public function validateVariables($templateId, $variables)
    {
        $availableVars = $this->getAvailableVariables($templateId);
        $missingVars = [];

        foreach ($availableVars as $var) {
            $varName = str_replace(['{', '}'], '', $var);
            if (!isset($variables[$varName])) {
                $missingVars[] = $varName;
            }
        }

        return [
            'valid' => empty($missingVars),
            'missing_variables' => $missingVars
        ];
    }
}
