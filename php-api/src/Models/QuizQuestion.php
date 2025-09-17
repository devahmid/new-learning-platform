<?php

namespace App\Models;

/**
 * Modèle QuizQuestion - Équivalent de l'entité QuizQuestion NestJS
 */
class QuizQuestion extends BaseModel {
    protected static $table = 'quiz_questions';
    
    protected static $fillable = [
        'question',
        'type',
        'order',
        'quizId'
    ];
    
    /**
     * Récupère le quiz de cette question
     */
    public function quiz() {
        if ($this->quizId) {
            return Quiz::find($this->quizId);
        }
        return null;
    }
    
    /**
     * Récupère les réponses de cette question
     */
    public function answers() {
        return QuizAnswer::where(['questionId' => $this->id]);
    }
    
    /**
     * Convertit en tableau pour l'API avec les relations
     */
    public function toArray() {
        $array = parent::toArray();
        
        // Ajouter les réponses
        $array['answers'] = array_map(function($answer) {
            return $answer->toArray();
        }, $this->answers());
        
        return $array;
    }
}
