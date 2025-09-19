<?php
/**
 * Version ultra-simple du ContactController
 */

namespace App\Controllers;

class ContactControllerSimple
{
    /**
     * Envoyer un message de contact
     */
    public function sendMessage()
    {
        try {
            // Vérifier la méthode HTTP
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                http_response_code(405);
                echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
                return;
            }

            // Récupérer les données JSON
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Données JSON invalides']);
                return;
            }

            // Validation simple
            $required = ['firstName', 'lastName', 'email', 'subject', 'message'];
            foreach ($required as $field) {
                if (empty($input[$field])) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'message' => "Le champ {$field} est requis"]);
                    return;
                }
            }

            // Valider l'email
            if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Adresse email invalide']);
                return;
            }

            // Envoyer les emails
            $messageId = rand(1000, 9999);
            $emailSent = false;
            $confirmationSent = false;
            
            // Email de notification à l'admin
            try {
                $emailSent = $this->sendNotificationEmail($input, $messageId);
            } catch (Exception $e) {
                $emailSent = false;
            }
            
            // Email de confirmation au client
            try {
                $confirmationSent = $this->sendConfirmationEmail($input);
            } catch (Exception $e) {
                $confirmationSent = false;
            }

            // Réponse de succès
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Message envoyé avec succès',
                'data' => [
                    'messageId' => $messageId,
                    'emailSent' => $emailSent,
                    'confirmationSent' => $confirmationSent
                ]
            ]);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Erreur: ' . $e->getMessage()]);
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
                'phone' => null,
                'address' => null,
                'hours' => [
                    'weekdays' => '9h00 - 18h00',
                    'saturday' => '9h00 - 12h00',
                    'sunday' => 'Fermé'
                ],
                'responseTime' => '24-48h'
            ];

            http_response_code(200);
            echo json_encode([
                'success' => true,
                'data' => $contactInfo
            ]);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Erreur interne du serveur']);
        }
    }

    /**
     * Envoyer l'email de notification à l'admin
     */
    private function sendNotificationEmail($data, $messageId)
    {
        try {
            $to = 'centre.culturel.olivier@gmail.com';
            $subject = "Nouveau message de contact - {$data['subject']}";
            
            $body = "
                <h2>Nouveau message de contact</h2>
                <p><strong>ID du message:</strong> {$messageId}</p>
                <p><strong>Nom:</strong> {$data['firstName']} {$data['lastName']}</p>
                <p><strong>Email:</strong> {$data['email']}</p>
                <p><strong>Téléphone:</strong> " . ($data['phone'] ?: 'Non renseigné') . "</p>
                <p><strong>Sujet:</strong> {$data['subject']}</p>
                <p><strong>Message:</strong></p>
                <p>" . nl2br(htmlspecialchars($data['message'])) . "</p>
                <hr>
                <p><small>Envoyé le " . date('d/m/Y à H:i') . " depuis l'IP: " . ($_SERVER['REMOTE_ADDR'] ?? 'unknown') . "</small></p>
            ";

            $headers = [
                'MIME-Version: 1.0',
                'Content-type: text/html; charset=UTF-8',
                'From: Centre Culturel l\'Olivier <noreply@centre-culturel-olivier.fr>',
                'Reply-To: ' . $data['email'],
                'X-Mailer: PHP/' . phpversion()
            ];

            return mail($to, $subject, $body, implode("\r\n", $headers));

        } catch (Exception $e) {
            return false;
        }
    }

    /**
     * Envoyer l'email de confirmation au client
     */
    private function sendConfirmationEmail($data)
    {
        try {
            $to = $data['email'];
            $subject = "Confirmation de réception - Centre Culturel l'Olivier";
            
            $body = "
                <h2>Merci pour votre message !</h2>
                <p>Bonjour {$data['firstName']},</p>
                <p>Nous avons bien reçu votre message concernant : <strong>{$data['subject']}</strong></p>
                <p>Notre équipe vous répondra dans les plus brefs délais (24-48h).</p>
                <p>En attendant, n'hésitez pas à consulter notre site pour découvrir nos cours d'arabe.</p>
                <hr>
                <p><strong>Centre Culturel l'Olivier</strong><br>
                Email: centre.culturel.olivier@gmail.com</p>
            ";

            $headers = [
                'MIME-Version: 1.0',
                'Content-type: text/html; charset=UTF-8',
                'From: Centre Culturel l\'Olivier <noreply@centre-culturel-olivier.fr>',
                'X-Mailer: PHP/' . phpversion()
            ];

            return mail($to, $subject, $body, implode("\r\n", $headers));

        } catch (Exception $e) {
            return false;
        }
    }
}