<?php

namespace App\Controllers;

use App\Models\Subcategory;
use App\Utils\Response;

/**
 * Contrôleur pour la gestion des sous-catégories
 */
class SubcategoryController {
    
    /**
     * Récupère toutes les sous-catégories
     */
    public function findAll() {
        try {
            $subcategories = Subcategory::where(['isActive' => 1]);
            $subcategoriesArray = array_map(function($subcategory) {
                return $subcategory->toArray();
            }, $subcategories);
            
            Response::json([
                'success' => true,
                'data' => $subcategoriesArray
            ], 200);
        } catch (\Exception $e) {
            Response::json(['error' => 'Erreur lors de la récupération des sous-catégories: ' . $e->getMessage()], 500);
        }
    }
    
    /**
     * Récupère les sous-catégories d'une catégorie
     */
    public function findByCategory($categoryId) {
        try {
            $subcategories = Subcategory::where(['categoryId' => $categoryId, 'isActive' => 1]);
            $subcategoriesArray = array_map(function($subcategory) {
                return $subcategory->toArray();
            }, $subcategories);
            
            Response::json($subcategoriesArray, 200);
        } catch (\Exception $e) {
            Response::json(['error' => 'Erreur lors de la récupération des sous-catégories: ' . $e->getMessage()], 500);
        }
    }
    
    /**
     * Récupère une sous-catégorie par son ID
     */
    public function findById($id) {
        try {
            $subcategory = Subcategory::find($id);
            
            if (!$subcategory || !$subcategory->isActive) {
                Response::json(['error' => 'Sous-catégorie non trouvée'], 404);
                return;
            }
            
            Response::json([
                'success' => true,
                'data' => $subcategory->toArray()
            ], 200);
        } catch (\Exception $e) {
            Response::json(['error' => 'Erreur lors de la récupération de la sous-catégorie: ' . $e->getMessage()], 500);
        }
    }
    
    /**
     * Crée une nouvelle sous-catégorie
     */
    public function create() {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!$data) {
                Response::json(['error' => 'Données JSON invalides'], 400);
                return;
            }
            
            // Validation des champs requis
            if (empty($data['name']) || empty($data['categoryId'])) {
                Response::json(['error' => 'Le nom et la catégorie sont requis'], 400);
                return;
            }
            
            // Créer une nouvelle instance de Subcategory
            $subcategory = new Subcategory([
                'name' => $data['name'],
                'description' => $data['description'] ?? '',
                'categoryId' => $data['categoryId'],
                'order' => $data['order'] ?? 1,
                'isActive' => 1
            ]);
            
            // Sauvegarder la sous-catégorie
            $subcategory = $subcategory->save();
            
            if ($subcategory) {
                Response::json([
                    'success' => true,
                    'data' => $subcategory->toArray()
                ], 201);
            } else {
                Response::json(['error' => 'Erreur lors de la création de la sous-catégorie'], 500);
            }
        } catch (\Exception $e) {
            Response::json(['error' => 'Erreur lors de la création de la sous-catégorie: ' . $e->getMessage()], 500);
        }
    }
    
    /**
     * Met à jour une sous-catégorie
     */
    public function update($id) {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!$data) {
                Response::json(['error' => 'Données JSON invalides'], 400);
                return;
            }
            
            $subcategory = Subcategory::find($id);
            
            if (!$subcategory) {
                Response::json(['error' => 'Sous-catégorie non trouvée'], 404);
                return;
            }
            
            // Mettre à jour les champs fournis
            if (isset($data['name'])) {
                $subcategory->name = $data['name'];
            }
            if (isset($data['description'])) {
                $subcategory->description = $data['description'];
            }
            if (isset($data['categoryId'])) {
                $subcategory->categoryId = $data['categoryId'];
            }
            if (isset($data['order'])) {
                $subcategory->order = $data['order'];
            }
            if (isset($data['isActive'])) {
                $subcategory->isActive = $data['isActive'];
            }
            
            $subcategory = $subcategory->save();
            
            if ($subcategory) {
                Response::json([
                    'success' => true,
                    'data' => $subcategory->toArray()
                ], 200);
            } else {
                Response::json(['error' => 'Erreur lors de la mise à jour de la sous-catégorie'], 500);
            }
        } catch (\Exception $e) {
            Response::json(['error' => 'Erreur lors de la mise à jour de la sous-catégorie: ' . $e->getMessage()], 500);
        }
    }
    
    /**
     * Supprime une sous-catégorie
     */
    public function delete($id) {
        try {
            $subcategory = Subcategory::find($id);
            
            if (!$subcategory) {
                Response::json(['error' => 'Sous-catégorie non trouvée'], 404);
                return;
            }
            
            // Soft delete - marquer comme inactif
            $subcategory->isActive = 0;
            $subcategory = $subcategory->save();
            
            if ($subcategory) {
                Response::json([
                    'success' => true,
                    'message' => 'Sous-catégorie supprimée avec succès'
                ], 200);
            } else {
                Response::json(['error' => 'Erreur lors de la suppression de la sous-catégorie'], 500);
            }
        } catch (\Exception $e) {
            Response::json(['error' => 'Erreur lors de la suppression de la sous-catégorie: ' . $e->getMessage()], 500);
        }
    }
}
