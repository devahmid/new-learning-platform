<?php

namespace App\Models;

/**
 * Modèle Category - Équivalent de l'entité Category NestJS
 */
class Category extends BaseModel {
    protected static $table = 'categories';
    
    protected static $fillable = [
        'name',
        'description',
        'imageUrl',
        'isActive',
        'order'
    ];
    
    /**
     * Récupère les cours de cette catégorie
     */
    public function courses() {
        return Course::where(['categoryId' => $this->id]);
    }
    
    /**
     * Récupère les sous-catégories de cette catégorie
     */
    public function subcategories() {
        return Subcategory::where(['categoryId' => $this->id]);
    }
}
