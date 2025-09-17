<?php

namespace App\Controllers;

use App\Models\Classe;
use App\Utils\Response;

/**
 * Contrôleur pour la gestion des classes
 */
class ClassController {
    
    /**
     * Récupère toutes les classes
     */
    public function findAll() {
        $classes = Classe::all();
        $classesArray = array_map(function($classe) {
            return $classe->toArray();
        }, $classes);
        Response::json($classesArray, 200);
    }
    
    /**
     * Récupère une classe par son ID
     */
    public function findById($id) {
        $classe = Classe::find($id);
        
        if (!$classe) {
            Response::json(['error' => 'Classe non trouvée'], 404);
            return;
        }
        
        Response::json($classe->toArray(), 200);
    }
    
    /**
     * Crée une nouvelle classe
     */
    public function create() {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!$data) {
            Response::json(['error' => 'Données JSON invalides'], 400);
            return;
        }
        
        $classe = new Classe($data);
        
        if ($classe->save()) {
            Response::json($classe->toArray(), 201);
        } else {
            Response::json(['error' => 'Erreur lors de la création de la classe'], 500);
        }
    }
    
    /**
     * Met à jour une classe
     */
    public function update($id) {
        $classe = Classe::find($id);
        
        if (!$classe) {
            Response::json(['error' => 'Classe non trouvée'], 404);
            return;
        }
        
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!$data) {
            Response::json(['error' => 'Données JSON invalides'], 400);
            return;
        }
        
        foreach ($data as $key => $value) {
            if (in_array($key, $classe->getFillable())) {
                $classe->$key = $value;
            }
        }
        
        if ($classe->save()) {
            Response::json($classe->toArray(), 200);
        } else {
            Response::json(['error' => 'Erreur lors de la mise à jour de la classe'], 500);
        }
    }
    
    /**
     * Supprime une classe
     */
    public function delete($id) {
        $classe = Classe::find($id);
        
        if (!$classe) {
            Response::json(['error' => 'Classe non trouvée'], 404);
            return;
        }
        
        if ($classe->delete()) {
            Response::json(['message' => 'Classe supprimée avec succès'], 200);
        } else {
            Response::json(['error' => 'Erreur lors de la suppression de la classe'], 500);
        }
    }
    
    /**
     * Récupère les catégories d'une classe
     */
    public function getCategories($classeId) {
        $classe = Classe::find($classeId);
        
        if (!$classe) {
            Response::json(['error' => 'Classe non trouvée'], 404);
            return;
        }
        
        $categories = Classe::getCategoriesForClasse($classeId);
        Response::json($categories, 200);
    }
    
    /**
     * Récupère les cours d'une classe
     */
    public function getCourses($classeId) {
        $classe = Classe::find($classeId);
        
        if (!$classe) {
            Response::json(['error' => 'Classe non trouvée'], 404);
            return;
        }
        
        $courses = Classe::getCoursesForClasse($classeId);
        $coursesArray = array_map(function($course) {
            return $course->toArray();
        }, $courses);
        
        Response::json($coursesArray, 200);
    }
    
    /**
     * Récupère les cours d'une classe par catégorie
     */
    public function getCoursesByCategory($classeId, $categoryId) {
        $classe = Classe::find($classeId);
        
        if (!$classe) {
            Response::json(['error' => 'Classe non trouvée'], 404);
            return;
        }
        
        $courses = Classe::getCoursesForClasseByCategory($classeId, $categoryId);
        $coursesArray = array_map(function($course) {
            return $course->toArray();
        }, $courses);
        
        Response::json($coursesArray, 200);
    }
    
    /**
     * Ajoute une catégorie à une classe
     */
    public function addCategory($classeId) {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!$data || !isset($data['categoryId'])) {
            Response::json(['error' => 'categoryId requis'], 400);
            return;
        }
        
        $classe = Classe::find($classeId);
        if (!$classe) {
            Response::json(['error' => 'Classe non trouvée'], 404);
            return;
        }
        
        $order = $data['order'] ?? 0;
        $result = Classe::addCategoryToClasse($classeId, $data['categoryId'], $order);
        
        if ($result) {
            Response::json(['message' => 'Catégorie ajoutée à la classe avec succès'], 200);
        } else {
            Response::json(['error' => 'Erreur lors de l\'ajout de la catégorie'], 500);
        }
    }
    
    /**
     * Supprime une catégorie d'une classe
     */
    public function removeCategory($classeId, $categoryId) {
        $classe = Classe::find($classeId);
        if (!$classe) {
            Response::json(['error' => 'Classe non trouvée'], 404);
            return;
        }
        
        $result = Classe::removeCategoryFromClasse($classeId, $categoryId);
        
        if ($result) {
            Response::json(['message' => 'Catégorie supprimée de la classe avec succès'], 200);
        } else {
            Response::json(['error' => 'Erreur lors de la suppression de la catégorie'], 500);
        }
    }
}
