<?php

namespace App\Controllers;

use App\Utils\Response;
use App\Utils\Validator;
use App\Utils\EmailService;
use App\Models\User;
use App\Models\Notification;

/**
 * Contrôleur de notifications - Équivalent du NotificationsController NestJS
 */
class NotificationController {
    
    /**
     * Envoyer un email
     */
    public function sendEmail() {
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Validation
        $validator = new Validator($data, [
            'to' => 'required|email',
            'subject' => 'required|min:1',
            'content' => 'required|min:1'
        ]);
        
        if (!$validator->validate()) {
            Response::validationError($validator->getErrors());
        }
        
        // Envoi d'email réel avec PHPMailer
        try {
            $this->sendRealEmail($data['to'], $data['subject'], $data['content']);
        } catch (Exception $e) {
            error_log("❌ Erreur envoi email: " . $e->getMessage());
            Response::internalError("Erreur lors de l'envoi de l'email: " . $e->getMessage());
            return;
        }
        
        Response::success([
            'status' => 'ok',
            'message' => 'Email envoyé avec succès',
            'to' => $data['to'],
            'subject' => $data['subject']
        ], 'Email envoyé avec succès');
    }
    
    /**
     * Envoyer un SMS
     */
    public function sendSms() {
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Validation
        $validator = new Validator($data, [
            'to' => 'required|min:10',
            'message' => 'required|min:1'
        ]);
        
        if (!$validator->validate()) {
            Response::validationError($validator->getErrors());
        }
        
        // Pour l'instant, on simule l'envoi de SMS
        // En production, vous devriez utiliser une vraie API SMS
        error_log("📱 SMS envoyé à: {$data['to']}");
        error_log("📱 Message: {$data['message']}");
        
        // Simuler un délai d'envoi
        sleep(1);
        
        Response::success([
            'status' => 'ok',
            'message' => 'SMS envoyé avec succès',
            'to' => $data['to'],
            'message_content' => $data['message']
        ], 'SMS envoyé avec succès');
    }
    
    /**
     * Envoie un email réel (à configurer selon votre serveur)
     */
    private function sendRealEmail($to, $subject, $content) {
        // Configuration SMTP (à adapter selon votre hébergeur)
        $smtpHost = $_ENV['SMTP_HOST'] ?? 'localhost';
        $smtpPort = $_ENV['SMTP_PORT'] ?? 587;
        $smtpUsername = $_ENV['SMTP_USERNAME'] ?? '';
        $smtpPassword = $_ENV['SMTP_PASSWORD'] ?? '';
        $fromEmail = $_ENV['FROM_EMAIL'] ?? 'noreply@centre-culturel-olivier.fr';
        $fromName = $_ENV['FROM_NAME'] ?? 'Centre Culturel Olivier';
        
        // Headers pour l'email
        $headers = [
            'From: ' . $fromName . ' <' . $fromEmail . '>',
            'Reply-To: ' . $fromEmail,
            'Content-Type: text/html; charset=UTF-8',
            'MIME-Version: 1.0'
        ];
        
        // Contenu HTML de l'email
        $htmlContent = "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <title>{$subject}</title>
        </head>
        <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
            <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                <h2 style='color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;'>
                    Message du Centre Culturel Olivier
                </h2>
                <div style='background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;'>
                    " . nl2br(htmlspecialchars($content)) . "
                </div>
                <hr style='border: none; border-top: 1px solid #eee; margin: 30px 0;'>
                <p style='font-size: 12px; color: #666; text-align: center;'>
                    Centre Culturel Olivier<br>
                    Cet email a été envoyé automatiquement, merci de ne pas y répondre.
                </p>
            </div>
        </body>
        </html>";
        
        // Envoi de l'email
        $success = mail($to, $subject, $htmlContent, implode("\r\n", $headers));
        
        if (!$success) {
            throw new Exception("Impossible d'envoyer l'email");
        }
        
        error_log("✅ Email réel envoyé à: {$to} - Sujet: {$subject}");
        return true;
    }

    /**
     * Envoyer une notification à tous les utilisateurs
     */
    public function sendToAll() {
        try {
            $rawInput = file_get_contents('php://input');
            $input = json_decode($rawInput, true);
            
            // Debug
            error_log("sendToAll - Raw input: " . $rawInput);
            error_log("sendToAll - Input décodé: " . print_r($input, true));
            
            if (!$input || !isset($input['subject']) || !isset($input['content'])) {
                error_log("sendToAll - Validation échouée. Input: " . print_r($input, true));
                return Response::error('Sujet et contenu requis', 400);
            }

            $subject = $input['subject'];
            $content = $input['content'];
            $adminId = $input['admin_id'] ?? 1; // TODO: Récupérer depuis la session

            // Récupérer tous les utilisateurs (pas seulement les actifs)
            $users = User::where([]);
            
            if (empty($users)) {
                return Response::error('Aucun utilisateur trouvé', 404);
            }

            $successCount = 0;
            $errorCount = 0;
            $errors = [];

            // TODO: Enregistrer la notification en base quand la classe sera déployée
            // $notification = new Notification();
            // $notification->subject = $subject;
            // $notification->content = $content;
            // $notification->admin_id = $adminId;
            // $notification->total_recipients = count($users);
            // $notification->sent_at = date('Y-m-d H:i:s');
            // $notification->save();

            // Envoyer à chaque utilisateur avec le même format que les emails individuels
            foreach ($users as $user) {
                try {
                    $personalizedContent = $this->personalizeContent($content, $user);
                    
                    $sent = $this->sendRealEmail(
                        $user->email,
                        $subject,
                        $personalizedContent
                    );

                    if ($sent) {
                        $successCount++;
                    } else {
                        $errorCount++;
                        $errors[] = "Erreur pour {$user->email}";
                    }
                } catch (\Exception $e) {
                    $errorCount++;
                    $errors[] = "Erreur pour {$user->email}: " . $e->getMessage();
                }
            }

            // TODO: Mettre à jour les statistiques quand la classe sera déployée
            // $notification->success_count = $successCount;
            // $notification->error_count = $errorCount;
            // $notification->update();

            return Response::success([
                'notification_id' => 0, // TODO: Récupérer l'ID quand la classe sera déployée
                'total_recipients' => count($users),
                'success_count' => $successCount,
                'error_count' => $errorCount,
                'errors' => $errors
            ]);

        } catch (\Exception $e) {
            error_log('NotificationController Error (sendToAll): ' . $e->getMessage());
            return Response::error('Erreur lors de l\'envoi des notifications: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Récupérer l'historique des notifications
     */
    public function getHistory() {
        try {
            // TODO: Récupérer l'historique quand la classe Notification sera déployée
            return Response::success([]);
        } catch (\Exception $e) {
            error_log('NotificationController Error (getHistory): ' . $e->getMessage());
            return Response::error('Erreur lors de la récupération de l\'historique: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Récupérer les statistiques des utilisateurs
     */
    public function getUserStats() {
        try {
            $totalUsers = count(User::where([]));
            $activeUsers = count(User::where(['status' => 'active']));
            $parents = count(User::where(['role' => 'parent']));
            $teachers = count(User::where(['role' => 'teacher']));

            return Response::success([
                'total_users' => $totalUsers,
                'active_users' => $activeUsers,
                'parents' => $parents,
                'teachers' => $teachers
            ]);
        } catch (\Exception $e) {
            error_log('NotificationController Error (getUserStats): ' . $e->getMessage());
            return Response::error('Erreur lors de la récupération des statistiques: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Personnaliser le contenu avec les données de l'utilisateur
     */
    private function personalizeContent($content, $user) {
        $replacements = [
            '{{first_name}}' => $user->firstName ?? '',
            '{{last_name}}' => $user->lastName ?? '',
            '{{full_name}}' => ($user->firstName ?? '') . ' ' . ($user->lastName ?? ''),
            '{{email}}' => $user->email ?? '',
            '{{phone}}' => $user->phoneNumber ?? '',
        ];

        return str_replace(array_keys($replacements), array_values($replacements), $content);
    }
}
