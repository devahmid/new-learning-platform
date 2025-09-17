<?php

namespace App\Controllers;

use App\Models\Course;
use App\Utils\Response;
use App\Utils\JWT;

/**
 * Contrôleur Admin pour la gestion des cours
 * Version simplifiée pour test
 */
class AdminCoursesController {
    
    /**
     * Récupère tous les cours (version admin)
     */
    public function getAllCourses() {
        // Vérifier l'authentification admin
        JWT::requireRole(['admin']);
        
        try {
            $courses = Course::all();
            $coursesArray = array_map(function($course) {
                return $course->toArray();
            }, $courses);
            
            Response::success($coursesArray, 'Cours récupérés avec succès');
            
        } catch (\Exception $e) {
            Response::error('Erreur lors de la récupération des cours: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Crée un nouveau cours (version admin)
     */
    public function createCourse() {
        // Vérifier l'authentification admin
        JWT::requireRole(['admin']);
        
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Validation basique
            if (empty($data['title']) || empty($data['description']) || empty($data['classeId']) || empty($data['categoryId'])) {
                Response::error('Données manquantes: title, description, classeId, categoryId requis', 400);
                return;
            }
            
            // Créer le cours
            $course = new Course([
                'title' => $data['title'],
                'description' => $data['description'],
                'classeId' => $data['classeId'],
                'categoryId' => $data['categoryId'],
                'subcategoryId' => $data['subcategoryId'] ?? null,
                'instructorId' => $data['instructorId'] ?? 1,
                'price' => $data['price'] ?? '0.00',
                'discountPrice' => $data['discountPrice'] ?? null,
                'tags' => $data['tags'] ?? null,
                'isActive' => $data['isActive'] ?? true,
                'videoUrl' => $data['videoUrl'] ?? null,
                'pdfUrl' => $data['pdfUrl'] ?? null,
                'imageUrl' => $data['imageUrl'] ?? null,
                'duration' => $data['duration'] ?? null,
                'difficulty' => $data['difficulty'] ?? 'débutant'
            ]);
            
            $course->save();
            
            Response::success($course->toArray(), 'Cours créé avec succès');
            
        } catch (\Exception $e) {
            Response::error('Erreur lors de la création du cours: ' . $e->getMessage(), 500);
        }
    }
}
