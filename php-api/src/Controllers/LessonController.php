<?php

namespace App\Controllers;

use App\Models\Lesson;
use App\Utils\Response;

/**
 * Contrôleur pour la gestion des leçons
 */
class LessonController {
    
    /**
     * Récupère toutes les leçons
     */
    public function findAll() {
        $lessons = Lesson::all();
        $lessonsArray = array_map(function($lesson) {
            return $lesson->toArray();
        }, $lessons);
        Response::json($lessonsArray, 200);
    }
    
    /**
     * Récupère une leçon par son ID
     */
    public function findById($id) {
        $lesson = Lesson::find($id);
        
        if (!$lesson) {
            Response::json(['error' => 'Leçon non trouvée'], 404);
            return;
        }
        
        Response::json($lesson->toArray(), 200);
    }
    
    /**
     * Récupère les leçons d'un cours
     */
    public function findByCourse($courseId) {
        $lessons = Lesson::where(['courseId' => $courseId]);
        $lessonsArray = array_map(function($lesson) {
            return $lesson->toArray();
        }, $lessons);
        Response::json($lessonsArray, 200);
    }
    
    /**
     * Crée une nouvelle leçon
     */
    public function create() {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!$data) {
            Response::json(['error' => 'Données JSON invalides'], 400);
            return;
        }
        
        $lesson = new Lesson($data);
        
        if ($lesson->save()) {
            Response::json($lesson->toArray(), 201);
        } else {
            Response::json(['error' => 'Erreur lors de la création de la leçon'], 500);
        }
    }
    
    /**
     * Met à jour une leçon
     */
    public function update($id) {
        $lesson = Lesson::find($id);
        
        if (!$lesson) {
            Response::json(['error' => 'Leçon non trouvée'], 404);
            return;
        }
        
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!$data) {
            Response::json(['error' => 'Données JSON invalides'], 400);
            return;
        }
        
        foreach ($data as $key => $value) {
            if (in_array($key, $lesson->getFillable())) {
                $lesson->$key = $value;
            }
        }
        
        if ($lesson->save()) {
            Response::json($lesson->toArray(), 200);
        } else {
            Response::json(['error' => 'Erreur lors de la mise à jour de la leçon'], 500);
        }
    }
    
    /**
     * Supprime une leçon
     */
    public function delete($id) {
        $lesson = Lesson::find($id);
        
        if (!$lesson) {
            Response::json(['error' => 'Leçon non trouvée'], 404);
            return;
        }
        
        if ($lesson->delete()) {
            Response::json(['message' => 'Leçon supprimée avec succès'], 200);
        } else {
            Response::json(['error' => 'Erreur lors de la suppression de la leçon'], 500);
        }
    }
}
