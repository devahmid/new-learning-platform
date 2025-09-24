<?php

namespace App\Models;

/**
 * Modèle Payment - Équivalent de l'entité Payment NestJS
 */
class Payment extends BaseModel {
    protected static $table = 'payments';
    
    protected static $fillable = [
        'userId',
        'courseId',
        'amount',
        'currency',
        'status',
        'paymentMethod',
        'transactionId',
        'description',
        'metadata',
        'paidAt'
    ];
    
    /**
     * Récupère l'utilisateur de ce paiement
     */
    public function user() {
        if ($this->userId) {
            return User::find($this->userId);
        }
        return null;
    }
    
    /**
     * Récupère le cours de ce paiement
     */
    public function course() {
        if ($this->courseId) {
            return Course::find($this->courseId);
        }
        return null;
    }
    
    /**
     * Convertit en tableau pour l'API avec les relations
     */
    public function toArray() {
        $array = parent::toArray();
        
        // Ajouter les relations si nécessaire
        if ($this->userId) {
            $array['user'] = $this->user()?->toArray();
        }
        
        if ($this->courseId) {
            $array['course'] = $this->course()?->toArray();
        }
        
        return $array;
    }
}
