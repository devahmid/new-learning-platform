<?php

namespace App\Models;

/**
 * Modèle QuizAnswer - Équivalent de l'entité QuizAnswer NestJS
 */
class QuizAnswer extends BaseModel {
    protected static $table = 'quiz_answers';
    
    protected static $fillable = [
        'answer',
        'isCorrect',
        'order',
        'questionId'
    ];
    
    /**
     * Récupère la question de cette réponse
     */
    public function question() {
        if ($this->questionId) {
            return QuizQuestion::find($this->questionId);
        }
        return null;
    }
}
