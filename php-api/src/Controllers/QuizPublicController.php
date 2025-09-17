<?php

namespace App\Controllers;

use App\Models\Quiz;
use App\Utils\Response;

/**
 * Contrôleur public pour la gestion des quiz (sans authentification)
 */
class QuizPublicController {
    
    /**
     * Récupère tous les quiz publics
     */
    public function findAll() {
        $quizzes = Quiz::where(['isActive' => 1]);
        $quizzesArray = array_map(function($quiz) {
            return $quiz->toArray();
        }, $quizzes);
        Response::json($quizzesArray, 200);
    }
    
    /**
     * Récupère un quiz par son ID
     */
    public function findById($id) {
        $quiz = Quiz::find($id);
        
        if (!$quiz || !$quiz->isActive) {
            Response::json(['error' => 'Quiz non trouvé'], 404);
            return;
        }
        
        Response::json($quiz->toArray(), 200);
    }
    
    /**
     * Récupère les quiz d'une leçon
     */
    public function findByLesson($lessonId) {
        $quizzes = Quiz::where(['lessonId' => $lessonId, 'isActive' => 1]);
        $quizzesArray = array_map(function($quiz) {
            return $quiz->toArray();
        }, $quizzes);
        Response::json($quizzesArray, 200);
    }
    
    /**
     * Récupère les quiz d'un cours
     */
    public function findByCourse($courseId) {
        try {
            $quizzes = Quiz::where(['courseId' => $courseId, 'isActive' => 1]);
            $quizzesArray = array_map(function($quiz) {
                // Utiliser toArrayWithoutCourse pour éviter de charger les questions
                return $quiz->toArrayWithoutCourse();
            }, $quizzes);
            
            // Retourner directement la réponse JSON
            header('Content-Type: application/json');
            echo json_encode($quizzesArray);
            exit;
            
        } catch (\Exception $e) {
            error_log("Erreur QuizPublicController::findByCourse: " . $e->getMessage());
            
            // Retourner une réponse d'erreur
            header('Content-Type: application/json');
            http_response_code(500);
            echo json_encode([
                'error' => 'Internal Server Error',
                'message' => 'Erreur lors du chargement des quiz',
                'statusCode' => 500
            ]);
            exit;
        }
    }
}
