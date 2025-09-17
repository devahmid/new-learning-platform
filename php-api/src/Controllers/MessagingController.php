<?php

namespace App\Controllers;

use App\Models\Message;
use App\Models\MessageTemplate;
use App\Models\EmailNotification;
use App\Models\User;
use App\Utils\EmailService;
use Exception;

class MessagingController
{
    private $messageModel;
    private $templateModel;
    private $emailNotificationModel;
    private $userModel;
    private $emailService;

    public function __construct()
    {
        $this->db = \DatabaseConfig::getInstance()->getConnection();
        $this->messageModel = new Message($this->db);
        $this->templateModel = new MessageTemplate($this->db);
        $this->emailNotificationModel = new EmailNotification($this->db);
        $this->userModel = new User($this->db);
        $this->emailService = new EmailService();
    }

    /**
     * Envoyer un message
     */
    public function sendMessage()
    {
        try {
            $data = $this->getRequestData();
            
            // Validation des données requises
            $requiredFields = ['recipient_id', 'subject', 'content'];
            foreach ($requiredFields as $field) {
                if (!isset($data[$field]) || empty($data[$field])) {
                    $this->sendError("Champ requis manquant: $field", 400);
                    return;
                }
            }

            // Vérifier que l'utilisateur existe
            $recipient = $this->userModel->getById($data['recipient_id']);
            if (!$recipient) {
                $this->sendError('Destinataire introuvable', 404);
                return;
            }

            // Déterminer le type de message
            $senderId = $this->getCurrentUserId();
            $sender = $this->userModel->getById($senderId);
            $messageType = $this->determineMessageType($sender['role'], $recipient['role']);

            // Créer le message
            $messageData = [
                'sender_id' => $senderId,
                'recipient_id' => $data['recipient_id'],
                'subject' => $data['subject'],
                'content' => $data['content'],
                'message_type' => $messageType,
                'is_important' => $data['is_important'] ?? false,
                'parent_message_id' => $data['parent_message_id'] ?? null,
                'attachments' => $data['attachments'] ?? null
            ];

            $messageId = $this->messageModel->create($messageData);
            
            if (!$messageId) {
                $this->sendError('Erreur lors de la création du message', 500);
                return;
            }

            // Créer la notification email si activée
            if ($this->shouldSendEmail($recipient)) {
                $this->createEmailNotification($messageId, $recipient, $data['subject'], $data['content']);
            }

            // Récupérer le message créé
            $message = $this->messageModel->getById($messageId);
            
            $this->sendSuccess($message, 'Message envoyé avec succès');
            
        } catch (Exception $e) {
            $this->sendError('Erreur serveur: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Récupérer les messages d'un utilisateur
     */
    public function getMessages($userId = null)
    {
        try {
            $currentUserId = $userId ?: $this->getCurrentUserId();
            $filters = $this->getQueryFilters();
            
            $messages = $this->messageModel->getByUserId($currentUserId, $filters);
            
            $this->sendSuccess($messages, 'Messages récupérés');
            
        } catch (Exception $e) {
            $this->sendError('Erreur serveur: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Récupérer un message par ID
     */
    public function getMessage($id)
    {
        try {
            $message = $this->messageModel->getById($id);
            
            if (!$message) {
                $this->sendError('Message introuvable', 404);
                return;
            }

            // Vérifier les permissions
            $currentUserId = $this->getCurrentUserId();
            if ($message['sender_id'] != $currentUserId && $message['recipient_id'] != $currentUserId) {
                $this->sendError('Accès non autorisé', 403);
                return;
            }

            // Marquer comme lu si c'est le destinataire
            if ($message['recipient_id'] == $currentUserId && !$message['is_read']) {
                $this->messageModel->markAsRead($id);
                $message['is_read'] = true;
            }
            
            $this->sendSuccess($message, 'Message récupéré');
            
        } catch (Exception $e) {
            $this->sendError('Erreur serveur: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Marquer un message comme lu
     */
    public function markAsRead($id)
    {
        try {
            $result = $this->messageModel->markAsRead($id);
            
            if ($result) {
                $this->sendSuccess(['marked' => true], 'Message marqué comme lu');
            } else {
                $this->sendError('Erreur lors de la mise à jour', 500);
            }
            
        } catch (Exception $e) {
            $this->sendError('Erreur serveur: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Marquer un message comme important
     */
    public function toggleImportant($id)
    {
        try {
            $result = $this->messageModel->toggleImportant($id);
            
            if ($result) {
                $this->sendSuccess(['toggled' => true], 'Statut important modifié');
            } else {
                $this->sendError('Erreur lors de la mise à jour', 500);
            }
            
        } catch (Exception $e) {
            $this->sendError('Erreur serveur: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Archiver un message
     */
    public function archiveMessage($id)
    {
        try {
            $result = $this->messageModel->archive($id);
            
            if ($result) {
                $this->sendSuccess(['archived' => true], 'Message archivé');
            } else {
                $this->sendError('Erreur lors de l\'archivage', 500);
            }
            
        } catch (Exception $e) {
            $this->sendError('Erreur serveur: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Supprimer un message
     */
    public function deleteMessage($id)
    {
        try {
            $result = $this->messageModel->delete($id);
            
            if ($result) {
                $this->sendSuccess(['deleted' => true], 'Message supprimé');
            } else {
                $this->sendError('Erreur lors de la suppression', 500);
            }
            
        } catch (Exception $e) {
            $this->sendError('Erreur serveur: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Récupérer les conversations
     */
    public function getConversations($userId = null)
    {
        try {
            $currentUserId = $userId ?: $this->getCurrentUserId();
            $limit = $this->getQueryParam('limit', 20);
            
            $conversations = $this->messageModel->getConversations($currentUserId, $limit);
            
            $this->sendSuccess($conversations, 'Conversations récupérées');
            
        } catch (Exception $e) {
            $this->sendError('Erreur serveur: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Récupérer les messages d'une conversation
     */
    public function getConversationMessages($otherUserId)
    {
        try {
            $currentUserId = $this->getCurrentUserId();
            $limit = $this->getQueryParam('limit', 50);
            
            $messages = $this->messageModel->getConversationMessages($currentUserId, $otherUserId, $limit);
            
            $this->sendSuccess($messages, 'Messages de conversation récupérés');
            
        } catch (Exception $e) {
            $this->sendError('Erreur serveur: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Rechercher des messages
     */
    public function searchMessages()
    {
        try {
            $currentUserId = $this->getCurrentUserId();
            $query = $this->getQueryParam('q', '');
            $limit = $this->getQueryParam('limit', 20);
            
            if (empty($query)) {
                $this->sendError('Terme de recherche requis', 400);
                return;
            }
            
            $messages = $this->messageModel->search($currentUserId, $query, $limit);
            
            $this->sendSuccess($messages, 'Résultats de recherche');
            
        } catch (Exception $e) {
            $this->sendError('Erreur serveur: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Compter les messages non lus
     */
    public function getUnreadCount($userId = null)
    {
        try {
            $currentUserId = $userId ?: $this->getCurrentUserId();
            $count = $this->messageModel->countUnread($currentUserId);
            
            $this->sendSuccess(['count' => $count], 'Nombre de messages non lus');
            
        } catch (Exception $e) {
            $this->sendError('Erreur serveur: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Récupérer les templates de messages
     */
    public function getTemplates()
    {
        try {
            $filters = $this->getQueryFilters();
            $templates = $this->templateModel->getAll($filters);
            
            $this->sendSuccess($templates, 'Templates récupérés');
            
        } catch (Exception $e) {
            $this->sendError('Erreur serveur: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Récupérer la liste des utilisateurs pour les destinataires
     */
    public function getUsers()
    {
        try {
            $users = $this->userModel->findAll();
            
            // Filtrer pour ne montrer que les admins et profs comme destinataires
            $filteredUsers = array_filter($users, function($user) {
                return in_array($user['role'], ['admin', 'teacher']);
            });
            
            $this->sendSuccess($filteredUsers, 'Utilisateurs récupérés');
            
        } catch (Exception $e) {
            $this->sendError('Erreur serveur: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Créer un template
     */
    public function createTemplate()
    {
        try {
            $data = $this->getRequestData();
            $data['created_by'] = $this->getCurrentUserId();
            
            $templateId = $this->templateModel->create($data);
            
            if ($templateId) {
                $template = $this->templateModel->getById($templateId);
                $this->sendSuccess($template, 'Template créé');
            } else {
                $this->sendError('Erreur lors de la création du template', 500);
            }
            
        } catch (Exception $e) {
            $this->sendError('Erreur serveur: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Envoyer un message avec template
     */
    public function sendTemplateMessage()
    {
        try {
            $data = $this->getRequestData();
            
            // Validation des données requises
            $requiredFields = ['template_id', 'recipient_id', 'variables'];
            foreach ($requiredFields as $field) {
                if (!isset($data[$field])) {
                    $this->sendError("Champ requis manquant: $field", 400);
                    return;
                }
            }

            // Valider les variables du template
            $validation = $this->templateModel->validateVariables($data['template_id'], $data['variables']);
            if (!$validation['valid']) {
                $this->sendError('Variables manquantes: ' . implode(', ', $validation['missing_variables']), 400);
                return;
            }

            // Traiter le template
            $processedTemplate = $this->templateModel->processTemplate($data['template_id'], $data['variables']);
            
            if (!$processedTemplate) {
                $this->sendError('Template introuvable', 404);
                return;
            }

            // Créer le message
            $messageData = [
                'recipient_id' => $data['recipient_id'],
                'subject' => $processedTemplate['subject'],
                'content' => $processedTemplate['content'],
                'sender_id' => $this->getCurrentUserId()
            ];

            $messageId = $this->messageModel->create($messageData);
            
            if ($messageId) {
                $message = $this->messageModel->getById($messageId);
                $this->sendSuccess($message, 'Message envoyé avec template');
            } else {
                $this->sendError('Erreur lors de l\'envoi du message', 500);
            }
            
        } catch (Exception $e) {
            $this->sendError('Erreur serveur: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Déterminer le type de message
     */
    private function determineMessageType($senderRole, $recipientRole)
    {
        if ($senderRole === 'admin' && $recipientRole === 'parent') {
            return 'admin_to_parent';
        } elseif ($senderRole === 'parent' && $recipientRole === 'admin') {
            return 'parent_to_admin';
        } elseif ($senderRole === 'admin' && $recipientRole === 'admin') {
            return 'admin_to_admin';
        }
        
        return 'admin_to_parent';
    }

    /**
     * Vérifier si un email doit être envoyé
     */
    private function shouldSendEmail($recipient)
    {
        // Vérifier les préférences de notification de l'utilisateur
        // Pour l'instant, envoyer toujours un email
        return true;
    }

    /**
     * Créer une notification email
     */
    private function createEmailNotification($messageId, $recipient, $subject, $content)
    {
        $emailData = [
            'message_id' => $messageId,
            'recipient_email' => $recipient['email'],
            'subject' => $subject,
            'content' => $content
        ];

        return $this->emailNotificationModel->create($emailData);
    }

    /**
     * Obtenir l'ID de l'utilisateur actuel
     */
    private function getCurrentUserId()
    {
        // Implémentation selon votre système d'authentification
        $headers = getallheaders();
        $token = $headers['Authorization'] ?? '';
        
        if (empty($token)) {
            return 1; // Utilisateur par défaut pour les tests
        }

        // Décoder le token JWT et récupérer l'ID utilisateur
        return 1; // Temporaire pour les tests
    }

    /**
     * Récupérer les filtres de requête
     */
    private function getQueryFilters()
    {
        $filters = [];
        
        if (isset($_GET['is_read'])) {
            $filters['is_read'] = $_GET['is_read'] === 'true';
        }
        
        if (isset($_GET['is_important'])) {
            $filters['is_important'] = $_GET['is_important'] === 'true';
        }
        
        if (isset($_GET['message_type'])) {
            $filters['message_type'] = $_GET['message_type'];
        }
        
        if (isset($_GET['is_archived'])) {
            $filters['is_archived'] = $_GET['is_archived'] === 'true';
        }
        
        if (isset($_GET['limit'])) {
            $filters['limit'] = (int)$_GET['limit'];
        }
        
        if (isset($_GET['offset'])) {
            $filters['offset'] = (int)$_GET['offset'];
        }
        
        return $filters;
    }

    /**
     * Récupérer un paramètre de requête
     */
    private function getQueryParam($key, $default = null)
    {
        return $_GET[$key] ?? $default;
    }

    /**
     * Envoyer une réponse de succès
     */
    private function sendSuccess($data = null, $message = 'Success')
    {
        \App\Utils\Response::json([
            'success' => true,
            'message' => $message,
            'data' => $data
        ], 200);
    }

    /**
     * Envoyer une réponse d'erreur
     */
    private function sendError($message, $statusCode = 400)
    {
        \App\Utils\Response::json([
            'success' => false,
            'message' => $message,
            'statusCode' => $statusCode
        ], $statusCode);
    }

    /**
     * Récupérer les données de la requête
     */
    private function getRequestData()
    {
        return json_decode(file_get_contents('php://input'), true) ?: [];
    }
}
