<?php

namespace App\Controllers;

use App\Models\Level;
use App\Utils\Response;

/**
 * Contrôleur pour la gestion des niveaux
 */
class LevelController {
    
    /**
     * Récupère tous les niveaux
     */
    public function findAll() {
        try {
            $levels = Level::where(['isActive' => 1]);
            $levelsArray = array_map(function($level) {
                return $level->toArray();
            }, $levels);
            
            Response::json($levelsArray, 200);
        } catch (\Exception $e) {
            Response::json(['error' => 'Erreur lors de la récupération des niveaux: ' . $e->getMessage()], 500);
        }
    }
    
    /**
     * Récupère un niveau par son ID
     */
    public function findById($id) {
        try {
            $level = Level::find($id);
            
            if (!$level || !$level->isActive) {
                Response::json(['error' => 'Niveau non trouvé'], 404);
                return;
            }
            
            Response::json($level->toArray(), 200);
        } catch (\Exception $e) {
            Response::json(['error' => 'Erreur lors de la récupération du niveau: ' . $e->getMessage()], 500);
        }
    }
    
    /**
     * Crée un nouveau niveau
     */
    public function create() {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!$data) {
                Response::json(['error' => 'Données JSON invalides'], 400);
                return;
            }
            
            // Validation des champs requis
            if (empty($data['name'])) {
                Response::json(['error' => 'Le nom du niveau est requis'], 400);
                return;
            }
            
            $level = Level::create([
                'name' => $data['name'],
                'description' => $data['description'] ?? '',
                'order' => $data['order'] ?? 1,
                'isActive' => 1
            ]);
            
            if ($level) {
                Response::json($level->toArray(), 201);
            } else {
                Response::json(['error' => 'Erreur lors de la création du niveau'], 500);
            }
        } catch (\Exception $e) {
            Response::json(['error' => 'Erreur lors de la création du niveau: ' . $e->getMessage()], 500);
        }
    }
}