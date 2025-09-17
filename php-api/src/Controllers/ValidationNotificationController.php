<?php

namespace App\Controllers;

use App\Models\User;
use App\Utils\JWT;
use App\Utils\Response;
use App\Utils\Validator;

/**
 * Contrôleur pour la gestion des notifications de validation des utilisateurs
 */
class ValidationNotificationController {
    
    /**
     * Envoyer une notification d'approbation
     */
    public function sendApprovalNotification() {
        $currentUser = JWT::requireRole(['admin']);
        
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!$data) {
                Response::badRequest('Données JSON invalides');
                return;
            }
            
            $validator = new Validator($data, [
                'userId' => 'required|integer',
                'userEmail' => 'required|email',
                'userName' => 'required|string|min:2',
                'type' => 'required|string|in:approval'
            ]);
            
            if (!$validator->validate()) {
                Response::validationError($validator->getErrors());
                return;
            }
            
            // Récupérer l'utilisateur
            $user = User::find($data['userId']);
            if (!$user) {
                Response::notFound('Utilisateur non trouvé');
                return;
            }
            
            // Créer la notification
            $notification = $this->createNotification([
                'userId' => $data['userId'],
                'type' => 'approval',
                'message' => 'Votre compte a été approuvé ! Vous pouvez maintenant accéder à toutes les fonctionnalités de la plateforme.',
                'createdAt' => date('Y-m-d H:i:s'),
                'read' => false
            ]);
            
            // Envoyer l'email de notification
            $this->sendApprovalEmail($data['userEmail'], $data['userName']);
            
            Response::success([
                'message' => 'Notification d\'approbation envoyée avec succès',
                'notification' => $notification
            ], 'Notification envoyée');
            
        } catch (Exception $e) {
            error_log("SendApprovalNotification - Erreur: " . $e->getMessage());
            Response::error('Erreur lors de l\'envoi de la notification d\'approbation', 500);
        }
    }
    
    /**
     * Envoyer une notification de rejet
     */
    public function sendRejectionNotification() {
        $currentUser = JWT::requireRole(['admin']);
        
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!$data) {
                Response::badRequest('Données JSON invalides');
                return;
            }
            
            $validator = new Validator($data, [
                'userId' => 'required|integer',
                'userEmail' => 'required|email',
                'userName' => 'required|string|min:2',
                'reason' => 'required|string|min:10',
                'type' => 'required|string|in:rejection'
            ]);
            
            if (!$validator->validate()) {
                Response::validationError($validator->getErrors());
                return;
            }
            
            // Récupérer l'utilisateur
            $user = User::find($data['userId']);
            if (!$user) {
                Response::notFound('Utilisateur non trouvé');
                return;
            }
            
            // Créer la notification
            $notification = $this->createNotification([
                'userId' => $data['userId'],
                'type' => 'rejection',
                'message' => 'Votre compte a été rejeté. Raison : ' . $data['reason'],
                'reason' => $data['reason'],
                'createdAt' => date('Y-m-d H:i:s'),
                'read' => false
            ]);
            
            // Envoyer l'email de notification
            $this->sendRejectionEmail($data['userEmail'], $data['userName'], $data['reason']);
            
            Response::success([
                'message' => 'Notification de rejet envoyée avec succès',
                'notification' => $notification
            ], 'Notification envoyée');
            
        } catch (Exception $e) {
            error_log("SendRejectionNotification - Erreur: " . $e->getMessage());
            Response::error('Erreur lors de l\'envoi de la notification de rejet', 500);
        }
    }
    
    /**
     * Envoyer une notification de mise en attente
     */
    public function sendPendingNotification() {
        $currentUser = JWT::requireRole(['admin']);
        
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!$data) {
                Response::badRequest('Données JSON invalides');
                return;
            }
            
            $validator = new Validator($data, [
                'userId' => 'required|integer',
                'userEmail' => 'required|email',
                'userName' => 'required|string|min:2',
                'type' => 'required|string|in:pending'
            ]);
            
            if (!$validator->validate()) {
                Response::validationError($validator->getErrors());
                return;
            }
            
            // Récupérer l'utilisateur
            $user = User::find($data['userId']);
            if (!$user) {
                Response::notFound('Utilisateur non trouvé');
                return;
            }
            
            // Créer la notification
            $notification = $this->createNotification([
                'userId' => $data['userId'],
                'type' => 'pending',
                'message' => 'Votre compte a été remis en attente de validation. Un administrateur examinera votre demande.',
                'createdAt' => date('Y-m-d H:i:s'),
                'read' => false
            ]);
            
            // Envoyer l'email de notification
            $this->sendPendingEmail($data['userEmail'], $data['userName']);
            
            Response::success([
                'message' => 'Notification de mise en attente envoyée avec succès',
                'notification' => $notification
            ], 'Notification envoyée');
            
        } catch (Exception $e) {
            error_log("SendPendingNotification - Erreur: " . $e->getMessage());
            Response::error('Erreur lors de l\'envoi de la notification de mise en attente', 500);
        }
    }
    
    /**
     * Récupérer les notifications de validation pour un utilisateur
     */
    public function getUserValidationNotifications($userId) {
        JWT::requireRole(['admin', 'parent', 'child']);
        
        try {
            $currentUser = JWT::getCurrentUser();
            
            // Vérifier que l'utilisateur peut accéder à ces notifications
            if ($currentUser['role'] !== 'admin' && $currentUser['id'] != $userId) {
                Response::forbidden('Accès non autorisé');
                return;
            }
            
            $notifications = $this->getNotificationsByUserId($userId);
            
            Response::json($notifications, 200);
            
        } catch (Exception $e) {
            error_log("GetUserValidationNotifications - Erreur: " . $e->getMessage());
            Response::error('Erreur lors de la récupération des notifications', 500);
        }
    }
    
    /**
     * Marquer une notification comme lue
     */
    public function markNotificationAsRead($notificationId) {
        JWT::requireRole(['admin', 'parent', 'child']);
        
        try {
            $currentUser = JWT::getCurrentUser();
            
            // Vérifier que la notification appartient à l'utilisateur
            $notification = $this->getNotificationById($notificationId);
            if (!$notification) {
                Response::notFound('Notification non trouvée');
                return;
            }
            
            if ($currentUser['role'] !== 'admin' && $notification['userId'] != $currentUser['id']) {
                Response::forbidden('Accès non autorisé');
                return;
            }
            
            $this->updateNotificationReadStatus($notificationId, true);
            
            Response::success([
                'message' => 'Notification marquée comme lue'
            ], 'Notification mise à jour');
            
        } catch (Exception $e) {
            error_log("MarkNotificationAsRead - Erreur: " . $e->getMessage());
            Response::error('Erreur lors de la mise à jour de la notification', 500);
        }
    }
    
    /**
     * Récupérer le nombre de notifications non lues
     */
    public function getUnreadNotificationCount($userId) {
        JWT::requireRole(['admin', 'parent', 'child']);
        
        try {
            $currentUser = JWT::getCurrentUser();
            
            // Vérifier que l'utilisateur peut accéder à ces notifications
            if ($currentUser['role'] !== 'admin' && $currentUser['id'] != $userId) {
                Response::forbidden('Accès non autorisé');
                return;
            }
            
            $count = $this->getUnreadCountByUserId($userId);
            
            Response::json(['count' => $count], 200);
            
        } catch (Exception $e) {
            error_log("GetUnreadNotificationCount - Erreur: " . $e->getMessage());
            Response::error('Erreur lors de la récupération du nombre de notifications', 500);
        }
    }
    
    /**
     * Marquer toutes les notifications comme lues
     */
    public function markAllNotificationsAsRead($userId) {
        JWT::requireRole(['admin', 'parent', 'child']);
        
        try {
            $currentUser = JWT::getCurrentUser();
            
            // Vérifier que l'utilisateur peut accéder à ces notifications
            if ($currentUser['role'] !== 'admin' && $currentUser['id'] != $userId) {
                Response::forbidden('Accès non autorisé');
                return;
            }
            
            $this->markAllAsReadByUserId($userId);
            
            Response::success([
                'message' => 'Toutes les notifications ont été marquées comme lues'
            ], 'Notifications mises à jour');
            
        } catch (Exception $e) {
            error_log("MarkAllNotificationsAsRead - Erreur: " . $e->getMessage());
            Response::error('Erreur lors de la mise à jour des notifications', 500);
        }
    }
    
    // Méthodes privées pour la gestion des notifications
    
    private function createNotification($data) {
        $db = \DatabaseConfig::getInstance()->getConnection();
        $stmt = $db->prepare("
            INSERT INTO validation_notifications (userId, type, message, reason, createdAt, isRead) 
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $data['userId'],
            $data['type'],
            $data['message'],
            $data['reason'] ?? null,
            $data['createdAt'],
            $data['read'] ? 1 : 0
        ]);
        
        return [
            'id' => $db->lastInsertId(),
            'userId' => $data['userId'],
            'type' => $data['type'],
            'message' => $data['message'],
            'reason' => $data['reason'] ?? null,
            'createdAt' => $data['createdAt'],
            'read' => $data['read']
        ];
    }
    
    private function getNotificationsByUserId($userId) {
        $db = \DatabaseConfig::getInstance()->getConnection();
        $stmt = $db->prepare("
            SELECT id, userId, type, message, reason, createdAt, isRead as read
            FROM validation_notifications 
            WHERE userId = ? 
            ORDER BY createdAt DESC
        ");
        $stmt->execute([$userId]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
    
    private function getNotificationById($notificationId) {
        $db = \DatabaseConfig::getInstance()->getConnection();
        $stmt = $db->prepare("
            SELECT id, userId, type, message, reason, createdAt, isRead as read
            FROM validation_notifications 
            WHERE id = ?
        ");
        $stmt->execute([$notificationId]);
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }
    
    private function updateNotificationReadStatus($notificationId, $isRead) {
        $db = \DatabaseConfig::getInstance()->getConnection();
        $stmt = $db->prepare("
            UPDATE validation_notifications 
            SET isRead = ? 
            WHERE id = ?
        ");
        $stmt->execute([$isRead ? 1 : 0, $notificationId]);
    }
    
    private function getUnreadCountByUserId($userId) {
        $db = \DatabaseConfig::getInstance()->getConnection();
        $stmt = $db->prepare("
            SELECT COUNT(*) as count
            FROM validation_notifications 
            WHERE userId = ? AND isRead = 0
        ");
        $stmt->execute([$userId]);
        $result = $stmt->fetch(\PDO::FETCH_ASSOC);
        return (int)$result['count'];
    }
    
    private function markAllAsReadByUserId($userId) {
        $db = \DatabaseConfig::getInstance()->getConnection();
        $stmt = $db->prepare("
            UPDATE validation_notifications 
            SET isRead = 1 
            WHERE userId = ?
        ");
        $stmt->execute([$userId]);
    }
    
    // Méthodes d'envoi d'emails
    
    private function sendApprovalEmail($email, $userName) {
        $subject = 'Votre compte a été approuvé !';
        $message = "
            <h2>Félicitations {$userName} !</h2>
            <p>Votre compte a été approuvé par un administrateur.</p>
            <p>Vous pouvez maintenant accéder à toutes les fonctionnalités de notre plateforme éducative.</p>
            <p>Connectez-vous dès maintenant pour commencer votre apprentissage !</p>
            <br>
            <p>Cordialement,<br>L'équipe de la plateforme</p>
        ";
        
        $this->sendEmail($email, $subject, $message);
    }
    
    private function sendRejectionEmail($email, $userName, $reason) {
        $subject = 'Votre compte a été rejeté';
        $message = "
            <h2>Bonjour {$userName},</h2>
            <p>Nous avons examiné votre demande d'inscription et regrettons de vous informer que votre compte a été rejeté.</p>
            <p><strong>Raison :</strong> {$reason}</p>
            <p>Si vous pensez qu'il s'agit d'une erreur, n'hésitez pas à nous contacter.</p>
            <br>
            <p>Cordialement,<br>L'équipe de la plateforme</p>
        ";
        
        $this->sendEmail($email, $subject, $message);
    }
    
    private function sendPendingEmail($email, $userName) {
        $subject = 'Votre compte est en attente de validation';
        $message = "
            <h2>Bonjour {$userName},</h2>
            <p>Votre compte a été remis en attente de validation.</p>
            <p>Un administrateur examinera votre demande dans les plus brefs délais.</p>
            <p>Vous recevrez une notification dès que votre compte sera validé.</p>
            <br>
            <p>Cordialement,<br>L'équipe de la plateforme</p>
        ";
        
        $this->sendEmail($email, $subject, $message);
    }
    
    private function sendEmail($to, $subject, $message) {
        // Utiliser la fonction mail() de PHP ou un service d'email externe
        $headers = "MIME-Version: 1.0" . "\r\n";
        $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
        $headers .= "From: noreply@centre-culturel-olivier.fr" . "\r\n";
        
        return mail($to, $subject, $message, $headers);
    }
}
