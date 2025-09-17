<?php

namespace App\Controllers;

use App\Models\User;
use App\Utils\Response;
use App\Utils\JWT;
use App\Utils\Validator;
use App\Utils\EmailService;

/**
 * Contrôleur d'authentification - Équivalent du AuthController NestJS
 */
class AuthController {
    
    /**
     * Connexion utilisateur
     */
    public function login() {
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Validation
        $validator = new Validator($data, [
            'email' => 'required|email',
            'password' => 'required|min:6'
        ]);
        
        if (!$validator->validate()) {
            Response::validationError($validator->getErrors());
        }
        
        // Chercher l'utilisateur
        $user = User::findByEmail($data['email']);
        
        if (!$user || !$user->verifyPassword($data['password'])) {
            Response::unauthorized('Email ou mot de passe incorrect');
        }
        
        // Générer le token JWT
        $payload = [
            'sub' => $user->id,
            'email' => $user->email,
            'role' => $user->role,
            'type' => $user->type,
            'firstName' => $user->firstName,
            'lastName' => $user->lastName
        ];
        
        $token = JWT::encode($payload);
        
        // Format compatible NestJS
        Response::json([
            'access_token' => $token,
            'user' => $user->toArray()
        ], 200);
    }
    
    /**
     * Inscription utilisateur
     */
    public function register() {
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Validation
        $validator = new Validator($data, [
            'email' => 'required|email',
            'password' => 'required|min:6',
            'firstName' => 'required|min:2',
            'lastName' => 'required|min:2',
            'type' => 'required|in:parent,child'
        ]);
        
        if (!$validator->validate()) {
            Response::validationError($validator->getErrors());
        }
        
        // Vérifier si l'email existe déjà
        $existingUser = User::findByEmail($data['email']);
        if ($existingUser) {
            Response::badRequest('Cet email est déjà utilisé');
        }
        
        // Créer l'utilisateur
        $userData = [
            'email' => $data['email'],
            'firstName' => $data['firstName'],
            'lastName' => $data['lastName'],
            'type' => $data['type'],
            'phoneNumber' => $data['phoneNumber'] ?? null,
            'dateOfBirth' => $data['dateOfBirth'] ?? null,
            'levelId' => $data['levelId'] ?? null,
            'parentId' => $data['parentId'] ?? null
        ];
        
        // Déterminer le rôle et le statut
        if (isset($data['role']) && $data['role'] === 'admin') {
            $userData['role'] = 'admin';
            $userData['status'] = 'approved'; // Les admins sont automatiquement approuvés
            $userData['approved_at'] = date('Y-m-d H:i:s');
        } else {
            $userData['role'] = 'user';
            $userData['status'] = 'pending'; // Les utilisateurs normaux sont en attente
        }
        
        $user = new User($userData);
        
        $user->setPassword($data['password']);
        $user->save();
        
        // Générer le token JWT
        $payload = [
            'sub' => $user->id,
            'email' => $user->email,
            'role' => $user->role,
            'type' => $user->type,
            'firstName' => $user->firstName,
            'lastName' => $user->lastName
        ];
        
        $token = JWT::encode($payload);
        
        // Format compatible NestJS
        Response::json([
            'access_token' => $token,
            'user' => $user->toArray()
        ], 201);
    }
    
    /**
     * Demande de réinitialisation de mot de passe
     */
    public function requestPasswordReset() {
        try {
            // Désactiver l'affichage des erreurs pour éviter la pollution HTML
            ini_set('display_errors', 0);
            error_reporting(0);
            
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!$data) {
                Response::badRequest('Données JSON invalides');
                return;
            }
            
            $validator = new Validator($data, [
                'email' => 'required|email'
            ]);
            
            if (!$validator->validate()) {
                Response::validationError($validator->getErrors());
                return;
            }
            
            $user = User::findByEmail($data['email']);
            
            if (!$user) {
                // Ne pas révéler si l'email existe ou non pour des raisons de sécurité
                Response::success(null, 'Si cet email existe, un lien de réinitialisation a été envoyé');
                return;
            }
            
            $token = $user->generateResetToken();
            
            // Envoyer l'email avec le token
            $emailService = new EmailService();
            $emailSent = $emailService->sendPasswordResetEmail(
                $user->email, 
                $token, 
                $user->firstName
            );
            
            if ($emailSent) {
                error_log("Email de réinitialisation envoyé à: " . $user->email);
            } else {
                error_log("Erreur lors de l'envoi de l'email à: " . $user->email);
            }
            
            // Toujours retourner le même message pour la sécurité
            Response::success(null, 'Si cet email existe, un lien de réinitialisation a été envoyé');
            
        } catch (Exception $e) {
            error_log("RequestPasswordReset - Erreur: " . $e->getMessage());
            Response::error('Erreur lors de la demande de réinitialisation: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Réinitialisation de mot de passe
     */
    public function resetPassword() {
        try {
            // Désactiver l'affichage des erreurs pour éviter la pollution HTML
            ini_set('display_errors', 0);
            error_reporting(0);
            
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!$data) {
                Response::badRequest('Données JSON invalides');
                return;
            }
            
            $validator = new Validator($data, [
                'token' => 'required',
                'password' => 'required|min:6'
            ]);
            
            if (!$validator->validate()) {
                Response::validationError($validator->getErrors());
                return;
            }
            
            $users = User::where(['resetToken' => $data['token']]);
            $user = !empty($users) ? $users[0] : null;
            
            if (!$user || !$user->isResetTokenValid($data['token'])) {
                Response::badRequest('Token de réinitialisation invalide ou expiré');
                return;
            }
            
            $user->setPassword($data['password']);
            $user->resetToken = null;
            $user->resetTokenExpiration = null;
            $user->save();
            
            Response::success(null, 'Mot de passe réinitialisé avec succès');
            
        } catch (Exception $e) {
            error_log("ResetPassword - Erreur: " . $e->getMessage());
            Response::error('Erreur lors de la réinitialisation: ' . $e->getMessage(), 500);
        }
    }
}
