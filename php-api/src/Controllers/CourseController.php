<?php

namespace App\Controllers;

use App\Models\Course;
use App\Utils\Response;

/**
 * Contrôleur Course - Équivalent du CourseController NestJS
 */
class CourseController {
    
    /**
     * Récupère tous les cours
     */
    public function findAll() {
        $courses = Course::all();
        $coursesArray = array_map(function($course) {
            return $course->toArray();
        }, $courses);
        
        // Format compatible NestJS
        Response::json($coursesArray, 200);
    }
    
    /**
     * Récupère un cours par ID
     */
    public function findById($id) {
        $course = Course::find($id);
        
        if (!$course) {
            Response::notFound('Cours non trouvé');
        }
        
        // Format compatible NestJS
        Response::json($course->toArray(), 200);
    }
    
    /**
     * Récupère les cours par niveau
     */
    public function findByLevel($levelId) {
        $courses = Course::where(['levelId' => $levelId]);
        $coursesArray = array_map(function($course) {
            return $course->toArray();
        }, $courses);
        
        // Format compatible NestJS
        Response::json($coursesArray, 200);
    }
    
    /**
     * Récupère les cours par catégorie et niveau
     */
    public function findByCategoryAndLevel($categoryId, $levelId) {
        $courses = Course::where([
            'categoryId' => $categoryId,
            'levelId' => $levelId
        ]);
        $coursesArray = array_map(function($course) {
            return $course->toArray();
        }, $courses);
        
        // Format compatible NestJS
        Response::json($coursesArray, 200);
    }
    
    /**
     * Crée un nouveau cours
     */
    public function create() {
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Validation
        $validator = new \App\Utils\Validator($data, [
            'title' => 'required|min:2',
            'description' => 'required|min:10',
            'levelId' => 'required|integer',
            'categoryId' => 'required|integer'
        ]);
        
        if (!$validator->validate()) {
            Response::validationError($validator->getErrors());
        }
        
        // Créer le cours
        $course = new Course([
            'title' => $data['title'],
            'description' => $data['description'],
            'levelId' => $data['levelId'],
            'categoryId' => $data['categoryId'],
            'subcategoryId' => $data['subcategoryId'] ?? null,
            'instructorId' => $data['instructorId'] ?? null,
            'price' => $data['price'] ?? '0.00',
            'discountPrice' => $data['discountPrice'] ?? null,
            'tags' => $data['tags'] ?? null,
            'order' => $data['order'] ?? 0,
            'isActive' => $data['isActive'] ?? true
        ]);
        
        $course->save();
        
        // Format compatible NestJS
        Response::json($course->toArray(), 201);
    }
    
    /**
     * Met à jour un cours
     */
    public function update($id) {
        $course = Course::find($id);
        
        if (!$course) {
            Response::notFound('Cours non trouvé');
        }
        
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Mettre à jour les champs
        $fillableFields = ['title', 'description', 'levelId', 'categoryId', 'subcategoryId', 'instructorId', 'price', 'discountPrice', 'tags', 'order', 'isActive'];
        
        foreach ($fillableFields as $field) {
            if (isset($data[$field])) {
                $course->$field = $data[$field];
            }
        }
        
        $course->save();
        
        // Format compatible NestJS
        Response::json($course->toArray(), 200);
    }
    
    /**
     * Supprime un cours
     */
    public function delete($id) {
        $course = Course::find($id);
        
        if (!$course) {
            Response::notFound('Cours non trouvé');
        }
        
        $course->delete();
        
        // Format compatible NestJS
        Response::json(['message' => 'Cours supprimé avec succès'], 200);
    }
}
