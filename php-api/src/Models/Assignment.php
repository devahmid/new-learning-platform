<?php

namespace App\Models;

/**
 * Modèle Assignment - Gestion des devoirs
 */
class Assignment extends BaseModel {
    protected static $table = 'assignments';
    
    protected static $fillable = [
        'title',
        'description',
        'classeId',
        'dueDate',
        'createdBy',
        'isActive'
    ];
    
    /**
     * Récupère la classe associée au devoir
     */
    public function classe() {
        return Classe::find($this->classeId);
    }
    
    /**
     * Récupère l'utilisateur qui a créé le devoir
     */
    public function creator() {
        return User::find($this->createdBy);
    }
    
    /**
     * Récupère tous les étudiants de la classe concernée
     */
    public function students() {
        return User::where(['classeId' => $this->classeId, 'type' => 'child']);
    }
    
    /**
     * Récupère tous les parents des étudiants de la classe
     */
    public function parents() {
        $db = \DatabaseConfig::getInstance()->getConnection();
        
        $sql = "
            SELECT DISTINCT p.*
            FROM users p
            INNER JOIN users c ON p.id = c.parentId
            WHERE c.classeId = ? AND c.type = 'child' AND p.type = 'parent'
        ";
        
        $stmt = $db->prepare($sql);
        $stmt->execute([$this->classeId]);
        
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
    
    /**
     * Vérifie si le devoir est en retard
     */
    public function isOverdue() {
        if (!$this->dueDate) {
            return false;
        }
        
        return strtotime($this->dueDate) < time();
    }
    
    /**
     * Récupère le statut du devoir
     */
    public function getStatus() {
        if (!$this->dueDate) {
            return 'no_due_date';
        }
        
        $dueTimestamp = strtotime($this->dueDate);
        $now = time();
        
        if ($dueTimestamp < $now) {
            return 'overdue';
        } elseif ($dueTimestamp <= $now + (7 * 24 * 60 * 60)) { // 7 jours
            return 'due_soon';
        } else {
            return 'upcoming';
        }
    }
    
    /**
     * Convertit en tableau pour l'API avec les relations
     */
    public function toArray() {
        $data = parent::toArray();
        
        // Ajouter les informations de la classe
        if ($this->classeId) {
            $classe = $this->classe();
            $data['classe'] = $classe ? $classe->toArray() : null;
        }
        
        // Ajouter les informations du créateur
        if ($this->createdBy) {
            $creator = $this->creator();
            $data['creator'] = $creator ? [
                'id' => $creator->id,
                'firstName' => $creator->firstName,
                'lastName' => $creator->lastName,
                'email' => $creator->email
            ] : null;
        }
        
        // Ajouter le statut
        $data['status'] = $this->getStatus();
        $data['isOverdue'] = $this->isOverdue();
        
        return $data;
    }
    
    /**
     * Récupère les devoirs par classe
     */
    public static function getByClasse($classeId, $activeOnly = true) {
        $where = ['classeId' => $classeId];
        
        if ($activeOnly) {
            $where['isActive'] = 1;
        }
        
        return self::where($where);
    }
    
    /**
     * Récupère les devoirs pour un parent (via ses enfants)
     */
    public static function getForParent($parentId) {
        $db = \DatabaseConfig::getInstance()->getConnection();
        
        $sql = "
            SELECT DISTINCT a.*
            FROM assignments a
            INNER JOIN users c ON a.classeId = c.classeId
            WHERE c.parentId = ? AND c.type = 'child' AND a.isActive = 1
            ORDER BY a.dueDate ASC, a.createdAt DESC
        ";
        
        $stmt = $db->prepare($sql);
        $stmt->execute([$parentId]);
        
        $assignments = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        
        // Convertir en objets Assignment
        $result = [];
        foreach ($assignments as $assignmentData) {
            $assignment = new self();
            $assignment->fill($assignmentData);
            $result[] = $assignment;
        }
        
        return $result;
    }
}

