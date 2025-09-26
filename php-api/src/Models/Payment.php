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
    
    /**
     * Calculer le total des revenus (paiements complétés)
     */
    public static function getTotalRevenue() {
        $db = Database::getInstance();
        $sql = "SELECT SUM(amount) as total FROM " . static::$table . " WHERE status = 'completed'";
        $stmt = $db->prepare($sql);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result['total'] ?? 0;
    }
    
    /**
     * Calculer les revenus du mois en cours
     */
    public static function getCurrentMonthRevenue() {
        $db = Database::getInstance();
        $sql = "SELECT SUM(amount) as total FROM " . static::$table . " 
                WHERE status = 'completed' 
                AND MONTH(createdAt) = MONTH(CURRENT_DATE()) 
                AND YEAR(createdAt) = YEAR(CURRENT_DATE())";
        $stmt = $db->prepare($sql);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result['total'] ?? 0;
    }
    
    /**
     * Calculer les revenus du mois précédent
     */
    public static function getLastMonthRevenue() {
        $db = Database::getInstance();
        $sql = "SELECT SUM(amount) as total FROM " . static::$table . " 
                WHERE status = 'completed' 
                AND MONTH(createdAt) = MONTH(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH)) 
                AND YEAR(createdAt) = YEAR(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH))";
        $stmt = $db->prepare($sql);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result['total'] ?? 0;
    }
}
