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
}
