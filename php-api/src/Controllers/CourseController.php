<?php

namespace App\Controllers;

use App\Models\Course;
use App\Utils\Response;
use Exception;

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
     * Récupère les cours par classe
     */
    public function findByClasse($classeId) {
        $courses = Course::findByClasse($classeId);
        $coursesArray = array_map(function($course) {
            return $course->toArray();
        }, $courses);
        
        // Format compatible NestJS
        Response::json($coursesArray, 200);
    }
    
    /**
     * Récupère les cours par classe et catégorie
     */
    public function findByClasseAndCategory($classeId, $categoryId) {
        // Debug: Log des paramètres reçus
        error_log("DEBUG findByClasseAndCategory - classeId: $classeId, categoryId: $categoryId");
        
        // Vérifier que les paramètres sont valides
        if (!is_numeric($classeId) || !is_numeric($categoryId)) {
            error_log("DEBUG - Paramètres invalides: classeId=$classeId, categoryId=$categoryId");
            Response::json([], 200);
            return;
        }
        
        $courses = Course::findByClasseAndCategory($classeId, $categoryId);
        error_log("DEBUG - Nombre de cours trouvés: " . count($courses));
        
        $coursesArray = array_map(function($course) {
            return $course->toArray();
        }, $courses);
        
        // Debug: Log des cours trouvés
        error_log("DEBUG - Cours trouvés: " . json_encode($coursesArray));
        
        // Format compatible NestJS
        Response::json($coursesArray, 200);
    }
    
    /**
     * Récupère les catégories disponibles pour une classe
     */
    public function getCategoriesForClasse($classeId) {
        $categories = Course::getCategoriesForClasse($classeId);
        
        // Format compatible NestJS
        Response::json($categories, 200);
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
            'classeId' => 'required|integer',
            'categoryId' => 'required|integer'
        ]);
        
        if (!$validator->validate()) {
            Response::validationError($validator->getErrors());
        }
        
        // Créer le cours
        $course = new Course([
            'title' => $data['title'],
            'description' => $data['description'],
            'classeId' => $data['classeId'],
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
        $fillableFields = ['title', 'description', 'classeId', 'categoryId', 'subcategoryId', 'instructorId', 'price', 'discountPrice', 'tags', 'order', 'isActive', 'status'];
        
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
    
    /**
     * Met à jour l'ordre de plusieurs cours en masse
     */
    public function bulkOrder() {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['orders']) || !is_array($data['orders'])) {
            Response::validationError(['orders' => 'Le champ orders est requis et doit être un tableau']);
        }
        
        $orders = $data['orders'];
        $updatedCourses = [];
        $errors = [];
        
        try {
            // Démarrer une transaction
            $pdo = \DatabaseConfig::getInstance()->getConnection();
            $pdo->beginTransaction();
            
            foreach ($orders as $orderData) {
                if (!isset($orderData['courseId']) || !isset($orderData['order'])) {
                    $errors[] = 'Chaque élément doit contenir courseId et order';
                    continue;
                }
                
                $courseId = (int)$orderData['courseId'];
                $order = (int)$orderData['order'];
                
                // Vérifier que le cours existe
                $course = Course::find($courseId);
                if (!$course) {
                    $errors[] = "Cours avec l'ID {$courseId} non trouvé";
                    continue;
                }
                
                // Mettre à jour l'ordre
                $course->order = $order;
                $course->save();
                
                $updatedCourses[] = [
                    'id' => $course->id,
                    'title' => $course->title,
                    'order' => $course->order
                ];
            }
            
            if (!empty($errors)) {
                $pdo->rollBack();
                Response::validationError($errors);
            }
            
            // Valider la transaction
            $pdo->commit();
            
            // Format compatible NestJS
            Response::json([
                'success' => true,
                'message' => 'Ordre des cours mis à jour avec succès',
                'data' => $updatedCourses
            ], 200);
            
        } catch (Exception $e) {
            if (isset($pdo)) {
                $pdo->rollBack();
            }
            
            Response::serverError('Erreur lors de la mise à jour de l\'ordre des cours: ' . $e->getMessage());
        }
    }
}
