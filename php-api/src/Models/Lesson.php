<?php

namespace App\Models;

/**
 * Modèle Lesson - Équivalent de l'entité Lesson NestJS
 */
class Lesson extends BaseModel {
    protected static $table = 'lessons';
    
    protected static $fillable = [
        'title',
        'description',
        'content',
        'videoUrl',
        'fileUrl',
        'duration',
        'order',
        'isActive',
        'courseId'
    ];
    
    /**
     * Récupère le cours de cette leçon
     */
    public function course() {
        if ($this->courseId) {
            return Course::find($this->courseId);
        }
        return null;
    }
    
    /**
     * Récupère les exercices de cette leçon
     */
    public function exercises() {
        return Exercise::where(['lessonId' => $this->id]);
    }
    
    /**
     * Récupère les quiz de cette leçon
     */
    public function quizzes() {
        return Quiz::where(['lessonId' => $this->id]);
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
        
        // Relations avec les exercices et quiz (sans références circulaires)
        $array['exercises'] = array_map(function($exercise) {
            return $exercise->toArrayWithoutRelations();
        }, $this->exercises());
        
        $array['quizzes'] = array_map(function($quiz) {
            return $quiz->toArrayWithoutRelations();
        }, $this->quizzes());
        
        return $array;
    }
    
    /**
     * Convertit en tableau sans référence au cours (évite les références circulaires)
     */
    public function toArrayWithoutCourse() {
        $array = parent::toArray();
        
        // Ajouter les exercices et quiz (sans références circulaires)
        $array['exercises'] = array_map(function($exercise) {
            return $exercise->toArray();
        }, $this->exercises());
        
        $array['quizzes'] = array_map(function($quiz) {
            return $quiz->toArrayWithoutCourse();
        }, $this->quizzes());
        
        return $array;
    }
}