<?php

namespace App\Controllers;

use App\Models\User;
use App\Utils\JWT;
use App\Utils\Response;
use App\Utils\Validator;

/**
 * Contrôleur pour la gestion des validations d'utilisateurs par l'admin
 */
class UserValidationController {
    
    /**
     * Récupère tous les utilisateurs en attente de validation
     */
    public function getPendingUsers() {
        JWT::requireRole(['admin']);
        
        try {
            // Récupérer les utilisateurs en attente (status = 'pending' ou status = NULL)
            $db = \DatabaseConfig::getInstance()->getConnection();
            $stmt = $db->prepare("SELECT * FROM users WHERE status = 'pending' OR status IS NULL");
            $stmt->execute();
            $users = $stmt->fetchAll(\PDO::FETCH_ASSOC);
            
            // Formater les données pour l'admin
            $formattedUsers = array_map(function($user) {
                return [
                    'id' => $user['id'],
                    'firstName' => $user['firstName'],
                    'lastName' => $user['lastName'],
                    'email' => $user['email'],
                    'phoneNumber' => $user['phoneNumber'],
                    'type' => $user['type'],
                    'role' => $user['role'],
                    'createdAt' => $user['createdAt'],
                    'status' => $user['status'] ?? 'pending' // Utiliser 'pending' si status est NULL
                ];
            }, $users);
            
            Response::json(['users' => $formattedUsers], 200);
            
        } catch (Exception $e) {
            error_log("GetPendingUsers - Erreur: " . $e->getMessage());
            Response::error('Erreur lors de la récupération des utilisateurs en attente', 500);
        }
    }
    
    /**
     * Approuve un utilisateur
     */
    public function approveUser($id) {
        $currentUser = JWT::requireRole(['admin']);
        
        try {
            $user = User::find($id);
            
            if (!$user) {
                Response::notFound('Utilisateur non trouvé');
                return;
            }
            
            if ($user->status !== 'pending') {
                Response::badRequest('Cet utilisateur n\'est pas en attente de validation');
                return;
            }
            
            $user->approve($currentUser['id']);
            
            Response::success([
                'message' => 'Utilisateur approuvé avec succès',
                'user' => $user->toArray()
            ], 'Utilisateur approuvé');
            
        } catch (Exception $e) {
            error_log("ApproveUser - Erreur: " . $e->getMessage());
            Response::error('Erreur lors de l\'approbation de l\'utilisateur', 500);
        }
    }
    
    /**
     * Rejette un utilisateur
     */
    public function rejectUser($id) {
        $currentUser = JWT::requireRole(['admin']);
        
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!$data) {
                Response::badRequest('Données JSON invalides');
                return;
            }
            
            $validator = new Validator($data, [
                'reason' => 'required|min:10'
            ]);
            
            if (!$validator->validate()) {
                Response::validationError($validator->getErrors());
                return;
            }
            
            $user = User::find($id);
            
            if (!$user) {
                Response::notFound('Utilisateur non trouvé');
                return;
            }
            
            if ($user->status !== 'pending') {
                Response::badRequest('Cet utilisateur n\'est pas en attente de validation');
                return;
            }
            
            $user->reject($data['reason'], $currentUser['id']);
            
            Response::success([
                'message' => 'Utilisateur rejeté avec succès',
                'user' => $user->toArray()
            ], 'Utilisateur rejeté');
            
        } catch (Exception $e) {
            error_log("RejectUser - Erreur: " . $e->getMessage());
            Response::error('Erreur lors du rejet de l\'utilisateur', 500);
        }
    }
    
    /**
     * Remet un utilisateur en attente
     */
    public function setUserPending($id) {
        $currentUser = JWT::requireRole(['admin']);
        
        try {
            $user = User::find($id);
            
            if (!$user) {
                Response::notFound('Utilisateur non trouvé');
                return;
            }
            
            $user->setPending();
            
            Response::success([
                'message' => 'Utilisateur remis en attente avec succès',
                'user' => $user->toArray()
            ], 'Utilisateur remis en attente');
            
        } catch (Exception $e) {
            error_log("SetUserPending - Erreur: " . $e->getMessage());
            Response::error('Erreur lors de la mise en attente de l\'utilisateur', 500);
        }
    }
    
    /**
     * Récupère les statistiques de validation
     */
    public function getValidationStats() {
        JWT::requireRole(['admin']);
        
        try {
            // Compter les utilisateurs par statut (inclure NULL comme 'pending')
            $db = \DatabaseConfig::getInstance()->getConnection();
            
            $stmt = $db->prepare("SELECT COUNT(*) as count FROM users WHERE status = 'pending' OR status IS NULL");
            $stmt->execute();
            $pending = (int)$stmt->fetch(\PDO::FETCH_ASSOC)['count'];
            
            $stmt = $db->prepare("SELECT COUNT(*) as count FROM users WHERE status = 'approved'");
            $stmt->execute();
            $approved = (int)$stmt->fetch(\PDO::FETCH_ASSOC)['count'];
            
            $stmt = $db->prepare("SELECT COUNT(*) as count FROM users WHERE status = 'rejected'");
            $stmt->execute();
            $rejected = (int)$stmt->fetch(\PDO::FETCH_ASSOC)['count'];
            
            $stats = [
                'pending' => $pending,
                'approved' => $approved,
                'rejected' => $rejected,
                'total' => $pending + $approved + $rejected
            ];
            
            Response::json($stats, 200);
            
        } catch (Exception $e) {
            error_log("GetValidationStats - Erreur: " . $e->getMessage());
            Response::error('Erreur lors de la récupération des statistiques', 500);
        }
    }
}
