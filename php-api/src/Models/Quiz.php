<?php

namespace App\Models;

/**
 * Modèle Quiz - Équivalent de l'entité Quiz NestJS
 */
class Quiz extends BaseModel {
    protected static $table = 'quizzes';
    
    protected static $fillable = [
        'title',
        'description',
        'timeLimit',
        'passingScore',
        'isActive',
        'courseId',
        'lessonId'
    ];
    
    /**
     * Récupère le cours de ce quiz
     */
    public function course() {
        if ($this->courseId) {
            return Course::find($this->courseId);
        }
        return null;
    }
    
    /**
     * Récupère la leçon de ce quiz
     */
    public function lesson() {
        if ($this->lessonId) {
            return Lesson::find($this->lessonId);
        }
        return null;
    }
    
    /**
     * Récupère les questions de ce quiz
     */
    public function questions() {
        $db = \DatabaseConfig::getInstance()->getConnection();
        
        $sql = "SELECT * FROM quiz_questions WHERE quizId = ? ORDER BY order_index ASC";
        $stmt = $db->prepare($sql);
        $stmt->execute([$this->id]);
        $questions = $stmt->fetchAll();
        
        // Pour chaque question, récupérer les options
        foreach ($questions as &$question) {
            $optionsSql = "SELECT * FROM quiz_question_options WHERE questionId = ? ORDER BY order_index ASC";
            $optionsStmt = $db->prepare($optionsSql);
            $optionsStmt->execute([$question['id']]);
            $question['options'] = $optionsStmt->fetchAll();
        }
        
        return $questions;
    }
    
    /**
     * Convertit en tableau pour l'API avec les relations
     */
    public function toArray() {
        $array = parent::toArray();
        
        // Relations simples (sans récursion pour éviter les boucles infinies)
        if ($this->courseId) {
            $array['course'] = $this->course()?->toArrayWithoutRelations();
        }
        
        if ($this->lessonId) {
            $array['lesson'] = $this->lesson()?->toArrayWithoutRelations();
        }
        
        // Relations avec les questions
        $array['questions'] = array_map(function($question) {
            return $question->toArrayWithoutRelations();
        }, $this->questions());
        
        return $array;
    }
    
    /**
     * Convertit en tableau sans référence au cours (évite les références circulaires)
     */
    public function toArrayWithoutCourse() {
        $array = parent::toArray();
        
        // Charger les questions avec leurs options
        $array['questions'] = $this->questions();
        
        return $array;
    }
}