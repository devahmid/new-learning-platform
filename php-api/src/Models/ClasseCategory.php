<?php

namespace App\Models;

/**
 * Modèle ClasseCategory - Table de liaison entre classes et catégories
 */
class ClasseCategory extends BaseModel {
    protected static $table = 'classe_categories';
    
    protected static $fillable = [
        'classeId',
        'categoryId',
        'isActive',
        'order'
    ];
    
    /**
     * Récupère la classe
     */
    public function classe() {
        if ($this->classeId) {
            return Classe::find($this->classeId);
        }
        return null;
    }
    
    /**
     * Récupère la catégorie
     */
    public function category() {
        if ($this->categoryId) {
            return Category::find($this->categoryId);
        }
        return null;
    }
    
    /**
     * Convertit en tableau pour l'API avec les relations
     */
    public function toArray() {
        $array = parent::toArray();
        
        // Relations simples (sans récursion pour éviter les boucles infinies)
        if ($this->classeId) {
            $array['classe'] = $this->classe()?->toArrayWithoutRelations();
        }
        
        if ($this->categoryId) {
            $array['category'] = $this->category()?->toArrayWithoutRelations();
        }
        
        return $array;
    }
    
    /**
     * Récupère les catégories pour une classe
     */
    public static function getCategoriesForClasse($classeId) {
        $classeCategories = self::where(['classeId' => $classeId, 'isActive' => 1]);
        $categories = array_map(function($cc) {
            return $cc->category();
        }, $classeCategories);
        
        // Filtrer les valeurs nulles et retourner les tableaux
        return array_map(function($category) {
            return $category ? $category->toArray() : null;
        }, array_filter($categories));
    }
    
    /**
     * Récupère les classes pour une catégorie
     */
    public static function getClassesForCategory($categoryId) {
        $classeCategories = self::where(['categoryId' => $categoryId, 'isActive' => 1]);
        return array_map(function($cc) {
            return $cc->classe();
        }, $classeCategories);
    }
    
    /**
     * Vérifie si une association classe-catégorie existe
     */
    public static function exists($classeId, $categoryId) {
        $result = self::where([
            'classeId' => $classeId,
            'categoryId' => $categoryId
        ]);
        return !empty($result);
    }
    
    /**
     * Crée une association classe-catégorie
     */
    public static function createAssociation($classeId, $categoryId, $order = 0) {
        $classeCategory = new self([
            'classeId' => $classeId,
            'categoryId' => $categoryId,
            'isActive' => 1,
            'order' => $order
        ]);
        return $classeCategory->save();
    }
    
    /**
     * Supprime une association classe-catégorie
     */
    public static function removeAssociation($classeId, $categoryId) {
        $classeCategory = self::where([
            'classeId' => $classeId,
            'categoryId' => $categoryId
        ]);
        
        if (!empty($classeCategory)) {
            return $classeCategory[0]->delete();
        }
        
        return false;
    }
}
