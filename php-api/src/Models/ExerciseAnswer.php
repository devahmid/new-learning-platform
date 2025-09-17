<?php

namespace App\Models;

/**
 * Modèle ExerciseAnswer - Équivalent de l'entité ExerciseAnswer NestJS
 */
class ExerciseAnswer extends BaseModel {
    protected static $table = 'exercise_answers';
    
    protected static $fillable = [
        'text',
        'isCorrect',
        'order',
        'metadata',
        'questionId'
    ];
    
    /**
     * Récupère la question de cette réponse
     */
    public function question() {
        if ($this->questionId) {
            return ExerciseQuestion::find($this->questionId);
        }
        return null;
    }
}