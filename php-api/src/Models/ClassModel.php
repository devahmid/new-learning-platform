<?php

namespace App\Models;

/**
 * Modèle ClassModel - Équivalent de l'entité Classe NestJS
 */
class ClassModel extends BaseModel {
    protected static $table = 'classes';
    
    protected static $fillable = [
        'name',
        'description',
        'color',
        'teacherId'
    ];
    
    /**
     * Récupère l'enseignant de la classe
     */
    public function teacher() {
        if ($this->teacherId) {
            return User::find($this->teacherId);
        }
        return null;
    }
    
    /**
     * Récupère les étudiants de la classe
     */
    public function students() {
        return User::where(['classeId' => $this->id]);
    }
    
    /**
     * Convertit en tableau pour l'API avec les relations
     */
    public function toArray() {
        $array = parent::toArray();
        
        // Relations simples (sans récursion pour éviter les boucles infinies)
        if ($this->teacherId) {
            $array['teacher'] = $this->teacher()?->toArrayWithoutRelations();
        }
        
        // Relations avec les étudiants (sans références circulaires)
        $array['students'] = array_map(function($student) {
            return $student->toArrayWithoutRelations();
        }, $this->students());
        
        return $array;
    }
    
    /**
     * Compte les classes actives
     */
    public static function countActive() {
        $db = \DatabaseConfig::getInstance()->getConnection();
        $stmt = $db->query("SELECT COUNT(*) as count FROM " . self::$table);
        $result = $stmt->fetch(\PDO::FETCH_ASSOC);
        return (int)$result['count'];
    }
    
    /**
     * Récupère les classes récentes
     */
    public static function getRecentClasses($days = 7) {
        $db = \DatabaseConfig::getInstance()->getConnection();
        $stmt = $db->prepare("SELECT * FROM " . self::$table . " WHERE createdAt >= DATE_SUB(NOW(), INTERVAL ? DAY) ORDER BY createdAt DESC");
        $stmt->execute([$days]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
    
    /**
     * Récupère les classes par enseignant
     */
    public static function getClassesByTeacher() {
        $db = \DatabaseConfig::getInstance()->getConnection();
        $stmt = $db->query("
            SELECT 
                u.firstName,
                u.lastName,
                COUNT(c.id) as count
            FROM " . self::$table . " c
            LEFT JOIN users u ON c.teacherId = u.id
            GROUP BY c.teacherId, u.firstName, u.lastName
            ORDER BY count DESC
        ");
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
    
    /**
     * Récupère les classes sans cours
     */
    public static function getClassesWithoutCourses() {
        $db = \DatabaseConfig::getInstance()->getConnection();
        $stmt = $db->prepare("
            SELECT c.*
            FROM " . self::$table . " c
            LEFT JOIN courses co ON c.id = co.classeId
            WHERE co.id IS NULL AND c.isActive = 1
        ");
        $stmt->execute();
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
}
