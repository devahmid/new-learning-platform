<?php

namespace App\Models;

/**
 * Modèle Level - Équivalent de l'entité Level NestJS
 */
class Level extends BaseModel {
    protected static $table = 'levels';
    
    protected static $fillable = [
        'name',
        'description',
        'sortOrder',
        'isActive'
    ];
    
    /**
     * Récupère les cours de ce niveau
     */
    public function courses() {
        return Course::where(['levelId' => $this->id]);
    }
    
    /**
     * Récupère les utilisateurs de ce niveau
     */
    public function users() {
        return User::where(['levelId' => $this->id]);
    }
    
    /**
     * Récupère les niveaux sans cours
     */
    public function getLevelsWithoutCourses() {
        $db = \DatabaseConfig::getInstance()->getConnection();
        $stmt = $db->query("
            SELECT l.* 
            FROM " . self::$table . " l
            LEFT JOIN courses c ON l.id = c.levelId
            WHERE c.id IS NULL
        ");
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
}
