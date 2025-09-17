<?php

namespace App\Models;

/**
 * Modèle Classe - Équivalent de l'entité Classe NestJS
 */
class Classe extends BaseModel {
    protected static $table = 'classes';
    
    protected static $fillable = [
        'name',
        'description',
        'levelId',
        'instructorId',
        'maxStudents',
        'isActive',
        'startDate',
        'endDate',
        'schedule'
    ];
    
    /**
     * Récupère le niveau de la classe
     */
    public function level() {
        if ($this->levelId) {
            return Level::find($this->levelId);
        }
        return null;
    }
    
    /**
     * Récupère l'instructeur de la classe
     */
    public function instructor() {
        if ($this->instructorId) {
            return User::find($this->instructorId);
        }
        return null;
    }
    
    /**
     * Récupère les étudiants de la classe
     */
    public function students() {
        return User::where(['classeId' => $this->id, 'type' => 'child']);
    }
    
    /**
     * Récupère les créneaux de la classe
     */
    public function schedules() {
        return Schedule::where(['classeId' => $this->id]);
    }
    
    /**
     * Convertit en tableau pour l'API avec les relations
     */
    public function toArray() {
        $array = parent::toArray();
        
        // Relations simples (sans récursion pour éviter les boucles infinies)
        if ($this->levelId) {
            $array['level'] = $this->level()?->toArrayWithoutRelations();
        }
        
        if ($this->instructorId) {
            $array['instructor'] = $this->instructor()?->toArrayWithoutRelations();
        }
        
        // Relations avec les étudiants
        $array['students'] = array_map(function($student) {
            return $student->toArrayWithoutRelations();
        }, $this->students());
        
        // Relations avec les créneaux
        $array['schedules'] = array_map(function($schedule) {
            return $schedule->toArray();
        }, $this->schedules());
        
        return $array;
    }
}
