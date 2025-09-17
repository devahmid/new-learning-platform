<?php

namespace App\Models;

/**
 * Modèle Classe - Équivalent de l'entité Classe NestJS
 */
class Classe extends BaseModel {
    protected static $table = 'classes';
    
    protected static $fillable = [
        'name',
        'description',
        'color',
        'capacity',
        'isActive'
    ];
    
    /**
     * Récupère les catégories de la classe
     */
    public function categories() {
        return ClasseCategory::where(['classeId' => $this->id, 'isActive' => 1]);
    }
    
    /**
     * Récupère les cours de la classe
     */
    public function courses() {
        return Course::where(['classeId' => $this->id]);
    }
    
    /**
     * Récupère les étudiants de la classe
     */
    public function students() {
        return User::where(['classeId' => $this->id, 'type' => 'child']);
    }
    
    /**
     * Récupère les créneaux de la classe
     */
    public function schedules() {
        return Schedule::where(['classeId' => $this->id]);
    }
    
    /**
     * Convertit en tableau pour l'API avec les relations
     */
    public function toArray() {
        $array = parent::toArray();
        
        // Relations avec les catégories
        $array['categories'] = array_map(function($cc) {
            return $cc->category()?->toArrayWithoutRelations();
        }, $this->categories());
        
        // Relations avec les cours
        $array['courses'] = array_map(function($course) {
            return $course->toArrayWithoutRelations();
        }, $this->courses());
        
        // Relations avec les étudiants
        $array['students'] = array_map(function($student) {
            return $student->toArrayWithoutRelations();
        }, $this->students());
        
        // Relations avec les créneaux
        $array['schedules'] = array_map(function($schedule) {
            return $schedule->toArray();
        }, $this->schedules());
        
        return $array;
    }
    
    /**
     * Récupère les catégories disponibles pour une classe
     */
    public static function getCategoriesForClasse($classeId) {
        return ClasseCategory::getCategoriesForClasse($classeId);
    }
    
    /**
     * Récupère les cours d'une classe
     */
    public static function getCoursesForClasse($classeId) {
        return Course::findByClasse($classeId);
    }
    
    /**
     * Récupère les cours d'une classe par catégorie
     */
    public static function getCoursesForClasseByCategory($classeId, $categoryId) {
        return Course::findByClasseAndCategory($classeId, $categoryId);
    }
    
    /**
     * Ajoute une catégorie à une classe
     */
    public static function addCategoryToClasse($classeId, $categoryId, $order = 0) {
        return ClasseCategory::createAssociation($classeId, $categoryId, $order);
    }
    
    /**
     * Supprime une catégorie d'une classe
     */
    public static function removeCategoryFromClasse($classeId, $categoryId) {
        return ClasseCategory::removeAssociation($classeId, $categoryId);
    }
}
