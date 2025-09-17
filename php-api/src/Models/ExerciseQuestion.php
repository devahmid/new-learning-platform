<?php

namespace App\Models;

/**
 * Modèle ExerciseQuestion - Équivalent de l'entité ExerciseQuestion NestJS
 */
class ExerciseQuestion extends BaseModel {
    protected static $table = 'exercise_questions';
    
    protected static $fillable = [
        'text',
        'audioUrl',
        'imageUrl',
        'order',
        'metadata',
        'exerciseId'
    ];
    
    /**
     * Récupère l'exercice de cette question
     */
    public function exercise() {
        if ($this->exerciseId) {
            return Exercise::find($this->exerciseId);
        }
        return null;
    }
    
    /**
     * Récupère les réponses de cette question
     */
    public function answers() {
        return ExerciseAnswer::where(['questionId' => $this->id]);
    }
    
    /**
     * Convertit en tableau pour l'API avec les relations
     */
    public function toArray() {
        $array = parent::toArray();
        
        // Ajouter les réponses (sans références circulaires)
        $array['answers'] = array_map(function($answer) {
            return $answer->toArrayWithoutRelations();
        }, $this->answers());
        
        return $array;
    }
}