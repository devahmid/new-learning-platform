<?php

namespace App\Models;

/**
 * Modèle Enrollment - Équivalent de l'entité Enrollment NestJS
 */
class Enrollment extends BaseModel {
    protected static $table = 'enrollments';
    
    protected static $fillable = [
        'userId',
        'courseId',
        'enrolledAt',
        'status',
        'progress'
    ];
    
    /**
     * Récupère l'utilisateur de cette inscription
     */
    public function user() {
        if ($this->userId) {
            return User::find($this->userId);
        }
        return null;
    }
    
    /**
     * Récupère le cours de cette inscription
     */
    public function course() {
        if ($this->courseId) {
            return Course::find($this->courseId);
        }
        return null;
    }
    
    /**
     * Convertit en tableau pour l'API avec les relations
     */
    public function toArray() {
        $array = parent::toArray();
        
        // Ajouter les relations si nécessaire
        if ($this->userId) {
            $array['user'] = $this->user()?->toArray();
        }
        
        if ($this->courseId) {
            $array['course'] = $this->course()?->toArray();
        }
        
        return $array;
    }
}
