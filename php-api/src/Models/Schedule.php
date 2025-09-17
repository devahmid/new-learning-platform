<?php

namespace App\Models;

/**
 * Modèle Schedule - Gestion des créneaux horaires
 */
class Schedule extends BaseModel {
    protected static $table = 'schedules';
    
    protected static $fillable = [
        'id',
        'day',
        'startHour',
        'endHour',
        'classeId',
        'teacherId',
        'description',
        'createdAt',
        'updatedAt'
    ];
    
    /**
     * Récupère la classe associée
     */
    public function classe() {
        return Classe::find($this->classeId);
    }
    
    /**
     * Récupère le professeur associé
     */
    public function teacher() {
        return User::find($this->teacherId);
    }
    
    /**
     * Formate l'heure pour l'affichage
     */
    public function formatTime($time) {
        if (empty($time)) return '';
        return date('H:i', strtotime($time));
    }
    
    /**
     * Convertit en tableau avec les relations
     */
    public function toArray() {
        $array = parent::toArray();
        
        // Ajouter la classe si elle existe (sans récursion)
        if ($this->classeId) {
            $classe = $this->classe();
            if ($classe) {
                $array['classe'] = $classe->toArrayWithoutRelations();
            }
        }
        
        // Ajouter le professeur si il existe
        if ($this->teacherId) {
            $teacher = $this->teacher();
            if ($teacher) {
                $array['teacher'] = $teacher->toArrayWithoutRelations();
            }
        }
        
        return $array;
    }
}
