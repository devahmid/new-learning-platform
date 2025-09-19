<?php

require_once __DIR__ . '/../Core/Response.php';
require_once __DIR__ . '/../Utils/Validator.php';
require_once __DIR__ . '/../Utils/EmailSender.php';
require_once __DIR__ . '/../Core/Database.php';

class ContactController
{
    private $response;
    private $validator;
    private $emailSender;

    public function __construct()
    {
        $this->response = new Response();
        $this->validator = new Validator();
        $this->emailSender = new EmailSender();
    }

    /**
     * Envoyer un message de contact
     */
    public function sendMessage()
    {
        try {
            // Vérifier la méthode HTTP
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                return $this->response->error('Méthode non autorisée', 405);
            }

            // Récupérer les données JSON
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input) {
                return $this->response->error('Données JSON invalides', 400);
            }

            // Valider les données
            $validation = $this->validateContactData($input);
            if (!$validation['valid']) {
                return $this->response->error($validation['message'], 400);
            }

            // Préparer les données du message
            $messageData = [
                'first_name' => $input['firstName'],
                'last_name' => $input['lastName'],
                'email' => $input['email'],
                'phone' => $input['phone'] ?? null,
                'subject' => $input['subject'],
                'message' => $input['message'],
                'created_at' => date('Y-m-d H:i:s'),
                'ip_address' => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
            ];

            // Sauvegarder en base de données
            $messageId = $this->saveContactMessage($messageData);
            
            if (!$messageId) {
                return $this->response->error('Erreur lors de la sauvegarde du message', 500);
            }

            // Envoyer l'email de notification
            $emailSent = $this->sendNotificationEmail($messageData);
            
            // Envoyer l'email de confirmation au client
            $confirmationSent = $this->sendConfirmationEmail($messageData);

            return $this->response->success([
                'message' => 'Message envoyé avec succès',
                'messageId' => $messageId,
                'emailSent' => $emailSent,
                'confirmationSent' => $confirmationSent
            ]);

        } catch (Exception $e) {
            error_log('Erreur ContactController::sendMessage: ' . $e->getMessage());
            return $this->response->error('Erreur interne du serveur', 500);
        }
    }

    /**
     * Obtenir les informations de contact
     */
    public function getContactInfo()
    {
        try {
            $contactInfo = [
                'email' => 'contact@centre-culturel-olivier.fr',
                'phone' => null, // Supprimé selon la demande
                'address' => null, // Supprimé selon la demande
                'hours' => [
                    'weekdays' => '9h00 - 18h00',
                    'saturday' => '9h00 - 12h00',
                    'sunday' => 'Fermé'
                ],
                'responseTime' => '24-48h'
            ];

            return $this->response->success($contactInfo);

        } catch (Exception $e) {
            error_log('Erreur ContactController::getContactInfo: ' . $e->getMessage());
            return $this->response->error('Erreur interne du serveur', 500);
        }
    }

    /**
     * Valider les données de contact
     */
    private function validateContactData($data)
    {
        $required = ['firstName', 'lastName', 'email', 'subject', 'message'];
        
        foreach ($required as $field) {
            if (empty($data[$field])) {
                return ['valid' => false, 'message' => "Le champ {$field} est requis"];
            }
        }

        // Valider l'email
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            return ['valid' => false, 'message' => 'Adresse email invalide'];
        }

        // Valider la longueur des champs
        if (strlen($data['firstName']) < 2) {
            return ['valid' => false, 'message' => 'Le prénom doit contenir au moins 2 caractères'];
        }

        if (strlen($data['lastName']) < 2) {
            return ['valid' => false, 'message' => 'Le nom doit contenir au moins 2 caractères'];
        }

        if (strlen($data['message']) < 10) {
            return ['valid' => false, 'message' => 'Le message doit contenir au moins 10 caractères'];
        }

        return ['valid' => true];
    }

    /**
     * Sauvegarder le message en base de données
     */
    private function saveContactMessage($data)
    {
        try {
            $pdo = \Database::getConnection();
            
            $sql = "INSERT INTO contact_messages 
                    (first_name, last_name, email, phone, subject, message, ip_address, created_at) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
            
            $stmt = $pdo->prepare($sql);
            $result = $stmt->execute([
                $data['first_name'],
                $data['last_name'],
                $data['email'],
                $data['phone'],
                $data['subject'],
                $data['message'],
                $data['ip_address'],
                $data['created_at']
            ]);

            return $result ? $pdo->lastInsertId() : false;

        } catch (Exception $e) {
            error_log('Erreur saveContactMessage: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Envoyer l'email de notification à l'admin
     */
    private function sendNotificationEmail($data)
    {
        try {
            $subject = "Nouveau message de contact - {$data['subject']}";
            
            $body = "
                <h2>Nouveau message de contact</h2>
                <p><strong>Nom:</strong> {$data['first_name']} {$data['last_name']}</p>
                <p><strong>Email:</strong> {$data['email']}</p>
                <p><strong>Téléphone:</strong> " . ($data['phone'] ?: 'Non renseigné') . "</p>
                <p><strong>Sujet:</strong> {$data['subject']}</p>
                <p><strong>Message:</strong></p>
                <p>" . nl2br(htmlspecialchars($data['message'])) . "</p>
                <hr>
                <p><small>Envoyé le " . date('d/m/Y à H:i') . " depuis l'IP: {$data['ip_address']}</small></p>
            ";

            return $this->emailSender->sendEmail(
                'contact@centre-culturel-olivier.fr',
                'Nouveau message de contact',
                $body
            );

        } catch (Exception $e) {
            error_log('Erreur sendNotificationEmail: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Envoyer l'email de confirmation au client
     */
    private function sendConfirmationEmail($data)
    {
        try {
            $subject = "Confirmation de réception - Centre Culturel l'Olivier";
            
            $body = "
                <h2>Merci pour votre message !</h2>
                <p>Bonjour {$data['first_name']},</p>
                <p>Nous avons bien reçu votre message concernant : <strong>{$data['subject']}</strong></p>
                <p>Notre équipe vous répondra dans les plus brefs délais (24-48h).</p>
                <p>En attendant, n'hésitez pas à consulter notre site pour découvrir nos cours d'arabe.</p>
                <hr>
                <p><strong>Centre Culturel l'Olivier</strong><br>
                Email: contact@centre-culturel-olivier.fr</p>
            ";

            return $this->emailSender->sendEmail(
                $data['email'],
                $subject,
                $body
            );

        } catch (Exception $e) {
            error_log('Erreur sendConfirmationEmail: ' . $e->getMessage());
            return false;
        }
    }
}
