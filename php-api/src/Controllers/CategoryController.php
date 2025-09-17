<?php

namespace App\Controllers;

use App\Models\Category;
use App\Utils\Response;

/**
 * Contrôleur pour la gestion des catégories
 */
class CategoryController {
    
    /**
     * Récupère toutes les catégories avec leurs sous-catégories
     */
    public function findAll() {
        try {
            $categories = Category::where(['isActive' => 1]);
            $categoriesArray = array_map(function($category) {
                $categoryData = $category->toArray();
                // Ajouter les sous-catégories
                $subcategories = $category->subcategories();
                $categoryData['subcategories'] = array_map(function($sub) {
                    return $sub->toArray();
                }, $subcategories);
                return $categoryData;
            }, $categories);
            
            Response::json([
                'success' => true,
                'data' => $categoriesArray
            ], 200);
        } catch (\Exception $e) {
            Response::json(['error' => 'Erreur lors de la récupération des catégories: ' . $e->getMessage()], 500);
        }
    }
    
    /**
     * Récupère une catégorie par son ID avec ses sous-catégories
     */
    public function findById($id) {
        try {
            $category = Category::find($id);
            
            if (!$category || !$category->isActive) {
                Response::json(['error' => 'Catégorie non trouvée'], 404);
                return;
            }
            
            $categoryData = $category->toArray();
            $subcategories = $category->subcategories();
            $categoryData['subcategories'] = array_map(function($sub) {
                return $sub->toArray();
            }, $subcategories);
            
            Response::json([
                'success' => true,
                'data' => $categoryData
            ], 200);
        } catch (\Exception $e) {
            Response::json(['error' => 'Erreur lors de la récupération de la catégorie: ' . $e->getMessage()], 500);
        }
    }
    
    /**
     * Crée une nouvelle catégorie
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
                Response::json(['error' => 'Le nom de la catégorie est requis'], 400);
                return;
            }
            
            // Créer une nouvelle instance de Category
            $category = new Category([
                'name' => $data['name'],
                'description' => $data['description'] ?? '',
                'imageUrl' => $data['imageUrl'] ?? null,
                'isActive' => 1,
                'order' => $data['order'] ?? 1
            ]);
            
            // Sauvegarder la catégorie
            $category = $category->save();
            
            if ($category) {
                Response::json([
                    'success' => true,
                    'data' => $category->toArray()
                ], 201);
            } else {
                Response::json(['error' => 'Erreur lors de la création de la catégorie'], 500);
            }
        } catch (\Exception $e) {
            Response::json(['error' => 'Erreur lors de la création de la catégorie: ' . $e->getMessage()], 500);
        }
    }
    
    /**
     * Met à jour une catégorie
     */
    public function update($id) {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!$data) {
                Response::json(['error' => 'Données JSON invalides'], 400);
                return;
            }
            
            $category = Category::find($id);
            if (!$category) {
                Response::json(['error' => 'Catégorie non trouvée'], 404);
                return;
            }
            
            // Mettre à jour les champs
            if (isset($data['name'])) $category->name = $data['name'];
            if (isset($data['description'])) $category->description = $data['description'];
            if (isset($data['imageUrl'])) $category->imageUrl = $data['imageUrl'];
            if (isset($data['order'])) $category->order = $data['order'];
            
            $updated = $category->save();
            
            if ($updated) {
                Response::json([
                    'success' => true,
                    'data' => $category->toArray()
                ], 200);
            } else {
                Response::json(['error' => 'Erreur lors de la mise à jour de la catégorie'], 500);
            }
        } catch (\Exception $e) {
            Response::json(['error' => 'Erreur lors de la mise à jour de la catégorie: ' . $e->getMessage()], 500);
        }
    }
    
    /**
     * Supprime une catégorie
     */
    public function delete($id) {
        try {
            $category = Category::find($id);
            if (!$category) {
                Response::json(['error' => 'Catégorie non trouvée'], 404);
                return;
            }
            
            $deleted = $category->delete();
            
            if ($deleted) {
                Response::json([
                    'success' => true,
                    'data' => ['message' => 'Catégorie supprimée avec succès']
                ], 200);
            } else {
                Response::json(['error' => 'Erreur lors de la suppression de la catégorie'], 500);
            }
        } catch (\Exception $e) {
            Response::json(['error' => 'Erreur lors de la suppression de la catégorie: ' . $e->getMessage()], 500);
        }
    }
}
