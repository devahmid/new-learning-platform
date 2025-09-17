<?php

namespace App\Controllers;

use App\Models\Exercise;
use App\Utils\Response;

/**
 * Contrôleur public pour la gestion des exercices (sans authentification)
 */
class ExercisePublicController {
    
    /**
     * Récupère tous les exercices publics
     */
    public function findAll() {
        $exercises = Exercise::where(['isActive' => 1]);
        $exercisesArray = array_map(function($exercise) {
            return $exercise->toArray();
        }, $exercises);
        Response::json($exercisesArray, 200);
    }
    
    /**
     * Récupère un exercice par son ID
     */
    public function findById($id) {
        $exercise = Exercise::find($id);
        
        if (!$exercise || !$exercise->isActive) {
            Response::json(['error' => 'Exercice non trouvé'], 404);
            return;
        }
        
        Response::json($exercise->toArray(), 200);
    }
    
    /**
     * Récupère les exercices d'une leçon
     */
    public function findByLesson($lessonId) {
        $exercises = Exercise::where(['lessonId' => $lessonId, 'isActive' => 1]);
        $exercisesArray = array_map(function($exercise) {
            return $exercise->toArray();
        }, $exercises);
        Response::json($exercisesArray, 200);
    }
    
    /**
     * Récupère les exercices d'un cours
     */
    public function findByCourse($courseId) {
        // Récupérer toutes les leçons du cours
        $lessons = \App\Models\Lesson::where(['courseId' => $courseId, 'isActive' => 1]);
        $exercises = [];
        
        foreach ($lessons as $lesson) {
            $lessonExercises = Exercise::where(['lessonId' => $lesson->id, 'isActive' => 1]);
            $exercises = array_merge($exercises, $lessonExercises);
        }
        
        $exercisesArray = array_map(function($exercise) {
            return $exercise->toArray();
        }, $exercises);
        
        Response::json($exercisesArray, 200);
    }
    

}
