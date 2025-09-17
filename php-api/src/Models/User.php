<?php

namespace App\Models;

/**
 * Modèle User - Équivalent de l'entité User NestJS
 */
class User extends BaseModel {
    protected static $table = 'users';
    
    protected static $fillable = [
        'email',
        'phoneNumber',
        'password',
        'firstName',
        'lastName',
        'dateOfBirth',
        'type',
        'role',
        'status',
        'approved_at',
        'approved_by',
        'rejection_reason',
        'levelId',
        'parentId',
        'classeId',
        'resetToken',
        'resetTokenExpiration'
    ];
    
    /**
     * Hash le mot de passe
     */
    public function setPassword($password) {
        $this->attributes['password'] = password_hash($password, PASSWORD_DEFAULT);
    }
    
    /**
     * Vérifie le mot de passe
     */
    public function verifyPassword($password) {
        return password_verify($password, $this->attributes['password'] ?? '');
    }
    
    /**
     * Récupère les enfants d'un parent
     */
    public function children() {
        return self::where(['parentId' => $this->id]);
    }
    
    /**
     * Récupère le parent d'un enfant
     */
    public function parent() {
        if ($this->parentId) {
            return self::find($this->parentId);
        }
        return null;
    }
    
    /**
     * Récupère le niveau de l'utilisateur
     */
    public function level() {
        if ($this->levelId) {
            return Level::find($this->levelId);
        }
        return null;
    }
    
    /**
     * Récupère les inscriptions de l'utilisateur
     */
    public function enrollments() {
        return Enrollment::where(['userId' => $this->id]);
    }
    
    /**
     * Récupère les paiements de l'utilisateur
     */
    public function payments() {
        return Payment::where(['userId' => $this->id]);
    }
    
    /**
     * Trouve un utilisateur par email
     */
    public static function findByEmail($email) {
        $users = self::where(['email' => $email]);
        return !empty($users) ? $users[0] : null;
    }
    
    /**
     * Crée un token de réinitialisation
     */
    public function generateResetToken() {
        $this->resetToken = bin2hex(random_bytes(32));
        $this->resetTokenExpiration = date('Y-m-d H:i:s', time() + 3600); // 1 heure
        $this->save();
        return $this->resetToken;
    }
    
    /**
     * Vérifie si le token de réinitialisation est valide
     */
    public function isResetTokenValid($token) {
        return $this->resetToken === $token && 
               $this->resetTokenExpiration && 
               strtotime($this->resetTokenExpiration) > time();
    }
    
    /**
     * Convertit en tableau pour l'API (sans mot de passe)
     */
    public function toArray() {
        $array = parent::toArray();
        unset($array['password']);
        unset($array['resetToken']);
        unset($array['resetTokenExpiration']);
        
        // Ajouter les relations si nécessaire
        if ($this->levelId) {
            $array['level'] = $this->level()?->toArray();
        }
        
        return $array;
    }
    
    /**
     * Compte les utilisateurs par type
     */
    public static function countByType($type) {
        $db = \DatabaseConfig::getInstance()->getConnection();
        $stmt = $db->prepare("SELECT COUNT(*) as count FROM " . self::$table . " WHERE type = ?");
        $stmt->execute([$type]);
        $result = $stmt->fetch(\PDO::FETCH_ASSOC);
        return (int)$result['count'];
    }
    
    /**
     * Compte les utilisateurs par rôle
     */
    public static function countByRole($role) {
        $db = \DatabaseConfig::getInstance()->getConnection();
        $stmt = $db->prepare("SELECT COUNT(*) as count FROM " . self::$table . " WHERE role = ?");
        $stmt->execute([$role]);
        $result = $stmt->fetch(\PDO::FETCH_ASSOC);
        return (int)$result['count'];
    }
    
    /**
     * Compte les utilisateurs par statut
     */
    public static function countByStatus($status) {
        $db = \DatabaseConfig::getInstance()->getConnection();
        $stmt = $db->prepare("SELECT COUNT(*) as count FROM " . self::$table . " WHERE status = ?");
        $stmt->execute([$status]);
        $result = $stmt->fetch(\PDO::FETCH_ASSOC);
        return (int)$result['count'];
    }
    
    /**
     * Vérifie si l'utilisateur est approuvé
     */
    public function isApproved() {
        return $this->status === 'approved';
    }
    
    /**
     * Vérifie si l'utilisateur est en attente
     */
    public function isPending() {
        return $this->status === 'pending';
    }
    
    /**
     * Vérifie si l'utilisateur est rejeté
     */
    public function isRejected() {
        return $this->status === 'rejected';
    }
    
    /**
     * Approuve un utilisateur
     */
    public function approve($approvedBy) {
        $this->status = 'approved';
        $this->approved_at = date('Y-m-d H:i:s');
        $this->approved_by = $approvedBy;
        $this->rejection_reason = null;
        return $this->save();
    }
    
    /**
     * Rejette un utilisateur
     */
    public function reject($rejectionReason, $rejectedBy) {
        $this->status = 'rejected';
        $this->rejection_reason = $rejectionReason;
        $this->approved_by = $rejectedBy;
        return $this->save();
    }
    
    /**
     * Remet un utilisateur en attente
     */
    public function setPending() {
        $this->status = 'pending';
        $this->rejection_reason = null;
        $this->approved_at = null;
        $this->approved_by = null;
        return $this->save();
    }
    
    /**
     * Compte les utilisateurs actifs (créés dans les X derniers jours)
     */
    public static function countActiveUsers($days = 30) {
        $db = \DatabaseConfig::getInstance()->getConnection();
        $stmt = $db->prepare("SELECT COUNT(*) as count FROM " . self::$table . " WHERE createdAt >= DATE_SUB(NOW(), INTERVAL ? DAY)");
        $stmt->execute([$days]);
        $result = $stmt->fetch(\PDO::FETCH_ASSOC);
        return (int)$result['count'];
    }
    
    /**
     * Récupère la répartition des utilisateurs par type
     */
    public static function getUsersByType() {
        $db = \DatabaseConfig::getInstance()->getConnection();
        $stmt = $db->query("SELECT type, COUNT(*) as count FROM " . self::$table . " GROUP BY type");
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
    
    /**
     * Récupère la répartition des utilisateurs par rôle
     */
    public static function getUsersByRole() {
        $db = \DatabaseConfig::getInstance()->getConnection();
        $stmt = $db->query("SELECT role, COUNT(*) as count FROM " . self::$table . " GROUP BY role");
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
    
    /**
     * Récupère les utilisateurs récents
     */
    public static function getRecentUsers($days = 7) {
        $db = \DatabaseConfig::getInstance()->getConnection();
        $stmt = $db->prepare("SELECT * FROM " . self::$table . " WHERE createdAt >= DATE_SUB(NOW(), INTERVAL ? DAY) ORDER BY createdAt DESC");
        $stmt->execute([$days]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
    
    /**
     * Récupère les utilisateurs par mois
     */
    public static function getUsersByMonth($months = 12) {
        $db = \DatabaseConfig::getInstance()->getConnection();
        $stmt = $db->prepare("
            SELECT 
                DATE_FORMAT(createdAt, '%Y-%m') as month,
                COUNT(*) as count 
            FROM " . self::$table . " 
            WHERE createdAt >= DATE_SUB(NOW(), INTERVAL ? MONTH)
            GROUP BY DATE_FORMAT(createdAt, '%Y-%m')
            ORDER BY month DESC
        ");
        $stmt->execute([$months]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
    

    
    /**
     * Récupère les utilisateurs actifs quotidiens
     */
    public static function getDailyActiveUsers() {
        $db = \DatabaseConfig::getInstance()->getConnection();
        $stmt = $db->query("SELECT COUNT(DISTINCT userId) as count FROM user_activities WHERE DATE(createdAt) = CURDATE()");
        $result = $stmt->fetch(\PDO::FETCH_ASSOC);
        return (int)$result['count'];
    }
    
    /**
     * Récupère les utilisateurs actifs hebdomadaires
     */
    public static function getWeeklyActiveUsers() {
        $db = \DatabaseConfig::getInstance()->getConnection();
        $stmt = $db->query("SELECT COUNT(DISTINCT userId) as count FROM user_activities WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)");
        $result = $stmt->fetch(\PDO::FETCH_ASSOC);
        return (int)$result['count'];
    }
    
    /**
     * Récupère les utilisateurs actifs mensuels
     */
    public static function getMonthlyActiveUsers() {
        $db = \DatabaseConfig::getInstance()->getConnection();
        $stmt = $db->query("SELECT COUNT(*) as count FROM " . self::$table . " WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)");
        $result = $stmt->fetch(\PDO::FETCH_ASSOC);
        return (int)$result['count'];
    }
    
    /**
     * Récupère les utilisateurs inactifs depuis X jours
     */
    public function getInactiveUsers($days = 30) {
        $db = \DatabaseConfig::getInstance()->getConnection();
        $stmt = $db->prepare("
            SELECT id, firstName, lastName, email, createdAt 
            FROM " . self::$table . " 
            WHERE createdAt < DATE_SUB(NOW(), INTERVAL ? DAY)
        ");
        $stmt->execute([$days]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
}
