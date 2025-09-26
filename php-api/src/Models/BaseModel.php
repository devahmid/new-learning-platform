<?php

namespace App\Models;

/**
 * Classe de base pour tous les modèles
 * Fournit des fonctionnalités communes ORM simples
 */
abstract class BaseModel {
    protected static $table;
    protected static $fillable = [];
    protected $attributes = [];
    protected $original = [];
    protected $exists = false;
    
    public function __construct($attributes = []) {
        $this->fill($attributes);
        $this->original = $this->attributes;
    }
    
    /**
     * Remplit le modèle avec des données
     */
    public function fill($attributes) {
        foreach ($attributes as $key => $value) {
            if (in_array($key, static::$fillable) || empty(static::$fillable)) {
                $this->attributes[$key] = $value;
            }
        }
        return $this;
    }
    
    /**
     * Récupère une propriété
     */
    public function __get($key) {
        return $this->attributes[$key] ?? null;
    }
    
    /**
     * Définit une propriété
     */
    public function __set($key, $value) {
        $this->attributes[$key] = $value;
    }
    
    /**
     * Vérifie si une propriété existe
     */
    public function __isset($key) {
        return isset($this->attributes[$key]);
    }
    
    /**
     * Convertit le modèle en tableau
     */
    public function toArray() {
        return $this->attributes;
    }
    
    /**
     * Convertit le modèle en tableau sans relations (pour éviter les boucles infinies)
     */
    public function toArrayWithoutRelations() {
        return $this->attributes;
    }
    
    /**
     * Convertit le modèle en JSON
     */
    public function toJson() {
        return json_encode($this->toArray());
    }
    
    /**
     * Sauvegarde le modèle
     */
    public function save() {
        $db = \DatabaseConfig::getInstance()->getConnection();
        
        if ($this->exists) {
            return $this->update();
        } else {
            return $this->insert();
        }
    }
    
    /**
     * Insère un nouveau record
     */
    protected function insert() {
        $db = \DatabaseConfig::getInstance()->getConnection();
        
        $columns = array_keys($this->attributes);
        $escapedColumns = array_map(function($col) { return "`$col`"; }, $columns);
        $placeholders = array_map(function($col) { return ":$col"; }, $columns);
        
        $sql = "INSERT INTO " . static::$table . " (" . implode(', ', $escapedColumns) . ") VALUES (" . implode(', ', $placeholders) . ")";
        
        $stmt = $db->prepare($sql);
        $stmt->execute($this->attributes);
        
        $this->attributes['id'] = $db->lastInsertId();
        $this->exists = true;
        $this->original = $this->attributes;
        
        return $this;
    }
    
    /**
     * Met à jour un record existant
     */
    protected function update() {
        $db = \DatabaseConfig::getInstance()->getConnection();
        
        $updates = [];
        foreach ($this->attributes as $key => $value) {
            if ($key !== 'id') {
                $updates[] = "`$key` = :$key";
            }
        }
        
        $sql = "UPDATE " . static::$table . " SET " . implode(', ', $updates) . " WHERE id = :id";
        
        $stmt = $db->prepare($sql);
        $stmt->execute($this->attributes);
        
        $this->original = $this->attributes;
        
        return $this;
    }
    
    /**
     * Supprime le record
     */
    public function delete() {
        if (!$this->exists || !isset($this->attributes['id'])) {
            return false;
        }
        
        $db = \DatabaseConfig::getInstance()->getConnection();
        $stmt = $db->prepare("DELETE FROM " . static::$table . " WHERE id = ?");
        
        return $stmt->execute([$this->attributes['id']]);
    }
    
    /**
     * Trouve tous les records
     */
    public static function all() {
        $db = \DatabaseConfig::getInstance()->getConnection();
        $stmt = $db->query("SELECT * FROM " . static::$table);
        
        $results = [];
        while ($row = $stmt->fetch()) {
            $model = new static($row);
            $model->attributes = $row; // Ajouter cette ligne pour assigner les attributs
            $model->exists = true;
            $model->original = $row;
            $results[] = $model;
        }
        
        return $results;
    }
    
    /**
     * Trouve un record par ID
     */
    public static function find($id) {
        $db = \DatabaseConfig::getInstance()->getConnection();
        $stmt = $db->prepare("SELECT * FROM " . static::$table . " WHERE id = ?");
        $stmt->execute([$id]);
        
        $row = $stmt->fetch();
        if (!$row) {
            return null;
        }
        
        $model = new static($row);
        $model->attributes = $row; // Ajouter cette ligne pour assigner les attributs
        $model->exists = true;
        $model->original = $row;
        
        return $model;
    }
    
    /**
     * Trouve des records avec des conditions
     */
    public static function where($conditions = [], $limit = null, $offset = null) {
        $db = \DatabaseConfig::getInstance()->getConnection();
        
        $sql = "SELECT * FROM " . static::$table;
        $params = [];
        
        if (!empty($conditions)) {
            $whereClauses = [];
            foreach ($conditions as $key => $value) {
                $whereClauses[] = "`$key` = :$key";
                $params[$key] = $value;
            }
            $sql .= " WHERE " . implode(' AND ', $whereClauses);
        }
        
        if ($limit) {
            $sql .= " LIMIT $limit";
            if ($offset) {
                $sql .= " OFFSET $offset";
            }
        }
        
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        
        $results = [];
        while ($row = $stmt->fetch()) {
            $model = new static($row);
            $model->attributes = $row; // Ajouter cette ligne pour assigner les attributs
            $model->exists = true;
            $model->original = $row;
            $results[] = $model;
        }
        
        return $results;
    }
    
    /**
     * Compte les records
     */
    public static function count($conditions = []) {
        $db = \DatabaseConfig::getInstance()->getConnection();
        
        $sql = "SELECT COUNT(*) as count FROM " . static::$table;
        $params = [];
        
        if (!empty($conditions)) {
            $whereClauses = [];
            foreach ($conditions as $key => $value) {
                $whereClauses[] = "`$key` = :$key";
                $params[$key] = $value;
            }
            $sql .= " WHERE " . implode(' AND ', $whereClauses);
        }
        
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        
        return (int) $stmt->fetch()['count'];
    }
    
    /**
     * Trouve un record par un champ spécifique
     */
    public static function findBy($field, $value) {
        $db = \DatabaseConfig::getInstance()->getConnection();
        $stmt = $db->prepare("SELECT * FROM " . static::$table . " WHERE `$field` = ?");
        $stmt->execute([$value]);
        
        $row = $stmt->fetch();
        if (!$row) {
            return null;
        }
        
        $model = new static($row);
        $model->attributes = $row;
        $model->exists = true;
        $model->original = $row;
        
        return $model;
    }
    
    /**
     * Crée un nouveau record
     */
    public static function create($attributes = []) {
        $model = new static($attributes);
        return $model->save();
    }
}
