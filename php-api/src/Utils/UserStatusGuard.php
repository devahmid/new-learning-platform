<?php

namespace App\Utils;

use App\Models\User;
use App\Utils\JWT;
use App\Utils\Response;

/**
 * Middleware pour vérifier le statut de validation de l'utilisateur
 */
class UserStatusGuard {
    
    /**
     * Vérifie si l'utilisateur est approuvé
     * Redirige vers une page d'attente si non approuvé
     */
    public static function requireApproved() {
        $user = JWT::getCurrentUser();
        
        if (!$user) {
            Response::unauthorized('Utilisateur non authentifié');
            return;
        }
        
        // Récupérer l'utilisateur complet depuis la DB
        $fullUser = User::find($user['id']);
        
        if (!$fullUser) {
            Response::unauthorized('Utilisateur non trouvé');
            return;
        }
        
        // Les admins sont toujours autorisés
        if ($fullUser->role === 'admin') {
            return $fullUser;
        }
        
        // Vérifier le statut
        if ($fullUser->isPending()) {
            Response::json([
                'success' => false,
                'message' => 'Votre compte est en attente de validation par un administrateur',
                'status' => 'pending',
                'redirect' => '/waiting-approval'
            ], 403);
            return;
        }
        
        if ($fullUser->isRejected()) {
            Response::json([
                'success' => false,
                'message' => 'Votre compte a été rejeté',
                'status' => 'rejected',
                'reason' => $fullUser->rejection_reason,
                'redirect' => '/account-rejected'
            ], 403);
            return;
        }
        
        if (!$fullUser->isApproved()) {
            Response::json([
                'success' => false,
                'message' => 'Statut de compte invalide',
                'status' => $fullUser->status,
                'redirect' => '/login'
            ], 403);
            return;
        }
        
        return $fullUser;
    }
    
    /**
     * Vérifie si l'utilisateur peut accéder en mode "preview"
     * Permet l'accès même si non approuvé, mais avec restrictions
     */
    public static function allowPreview() {
        $user = JWT::getCurrentUser();
        
        if (!$user) {
            Response::unauthorized('Utilisateur non authentifié');
            return;
        }
        
        $fullUser = User::find($user['id']);
        
        if (!$fullUser) {
            Response::unauthorized('Utilisateur non trouvé');
            return;
        }
        
        // Les admins ont accès complet
        if ($fullUser->role === 'admin') {
            return $fullUser;
        }
        
        // Tous les autres utilisateurs ont accès en mode preview
        return $fullUser;
    }
    
    /**
     * Vérifie si l'utilisateur a accès complet (approuvé ou admin)
     */
    public static function requireFullAccess() {
        $user = self::requireApproved();
        
        if (!$user) {
            return null;
        }
        
        // Vérifier que l'utilisateur n'est pas rejeté
        if ($user->isRejected()) {
            Response::json([
                'success' => false,
                'message' => 'Votre compte a été rejeté',
                'status' => 'rejected',
                'reason' => $user->rejection_reason
            ], 403);
            return null;
        }
        
        return $user;
    }
}
