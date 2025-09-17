<?php

namespace App\Models;

/**
 * Modèle Subcategory - Équivalent de l'entité Subcategory NestJS
 */
class Subcategory extends BaseModel {
    protected static $table = 'subcategories';
    
    protected static $fillable = [
        'name',
        'description',
        'imageUrl',
        'isActive',
        'order',
        'categoryId'
    ];
    
    /**
     * Récupère la catégorie de cette sous-catégorie
     */
    public function category() {
        if ($this->categoryId) {
            return Category::find($this->categoryId);
        }
        return null;
    }
    
    /**
     * Récupère les cours de cette sous-catégorie
     */
    public function courses() {
        return Course::where(['subcategoryId' => $this->id]);
    }
    
    /**
     * Convertit en tableau pour l'API avec les relations
     */
    public function toArray() {
        $array = parent::toArray();
        
        // Ajouter les relations si nécessaire
        if ($this->categoryId) {
            $array['category'] = $this->category()?->toArray();
        }
        
        return $array;
    }
}