<?php

namespace App\Utils;

class EmailService
{
    private $smtpHost;
    private $smtpPort;
    private $smtpUsername;
    private $smtpPassword;
    private $fromEmail;
    private $fromName;

    public function __construct()
    {
        // Configuration pour hébergement mutualisé
        $this->smtpHost = $_ENV['SMTP_HOST'] ?? 'localhost';
        $this->smtpPort = $_ENV['SMTP_PORT'] ?? 587;
        $this->smtpUsername = $_ENV['SMTP_USERNAME'] ?? '';
        $this->smtpPassword = $_ENV['SMTP_PASSWORD'] ?? '';
        $this->fromEmail = $_ENV['FROM_EMAIL'] ?? 'noreply@centre-culturel-olivier.fr';
        $this->fromName = $_ENV['FROM_NAME'] ?? 'Plateforme Éducative';
    }

    /**
     * Envoyer un email simple
     */
    public function sendEmail($to, $subject, $content, $isHtml = true)
    {
        try {
            // Headers de l'email
            $headers = [
                'From: ' . $this->fromName . ' <' . $this->fromEmail . '>',
                'Reply-To: ' . $this->fromEmail,
                'X-Mailer: PHP/' . phpversion(),
                'MIME-Version: 1.0',
                'Content-Type: ' . ($isHtml ? 'text/html' : 'text/plain') . '; charset=UTF-8'
            ];

            // Envoyer l'email
            $result = mail($to, $subject, $content, implode("\r\n", $headers));
            
            return $result;
            
        } catch (\Exception $e) {
            error_log('Erreur envoi email: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Envoyer un email avec template HTML
     */
    public function sendTemplateEmail($to, $subject, $template, $variables = [])
    {
        try {
            // Remplacer les variables dans le template
            $content = $this->processTemplate($template, $variables);
            
            return $this->sendEmail($to, $subject, $content, true);
            
        } catch (Exception $e) {
            error_log('Erreur envoi template email: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Envoyer un email de notification de message
     */
    public function sendMessageNotification($recipient, $message)
    {
        $template = $this->getMessageNotificationTemplate();
        
        $variables = [
            'recipient_name' => $recipient['firstName'] . ' ' . $recipient['lastName'],
            'sender_name' => $message['sender_name'] . ' ' . $message['sender_lastname'],
            'message_subject' => $message['subject'],
            'message_content' => nl2br($message['content']),
            'message_date' => date('d/m/Y à H:i', strtotime($message['created_at'])),
            'platform_url' => $_ENV['PLATFORM_URL'] ?? 'https://centre-culturel-olivier.fr',
            'login_url' => ($_ENV['PLATFORM_URL'] ?? 'https://centre-culturel-olivier.fr') . '/login'
        ];

        return $this->sendTemplateEmail(
            $recipient['email'],
            'Nouveau message: ' . $message['subject'],
            $template,
            $variables
        );
    }

    /**
     * Envoyer un email de progression
     */
    public function sendProgressNotification($parent, $child, $progressData)
    {
        $template = $this->getProgressNotificationTemplate();
        
        $variables = [
            'parent_name' => $parent['firstName'] . ' ' . $parent['lastName'],
            'child_name' => $child['firstName'] . ' ' . $child['lastName'],
            'course_name' => $progressData['course_name'] ?? 'Cours',
            'study_time' => $progressData['study_time'] ?? '0 minutes',
            'lessons_completed' => $progressData['lessons_completed'] ?? 0,
            'average_score' => $progressData['average_score'] ?? 0,
            'platform_url' => $_ENV['PLATFORM_URL'] ?? 'https://centre-culturel-olivier.fr'
        ];

        return $this->sendTemplateEmail(
            $parent['email'],
            'Progression de ' . $child['firstName'],
            $template,
            $variables
        );
    }

    /**
     * Envoyer un email de rappel de paiement
     */
    public function sendPaymentReminder($parent, $paymentData)
    {
        $template = $this->getPaymentReminderTemplate();
        
        $variables = [
            'parent_name' => $parent['firstName'] . ' ' . $parent['lastName'],
            'course_name' => $paymentData['course_name'] ?? 'Cours',
            'amount' => $paymentData['amount'] ?? 0,
            'due_date' => $paymentData['due_date'] ?? date('d/m/Y'),
            'payment_url' => ($_ENV['PLATFORM_URL'] ?? 'https://centre-culturel-olivier.fr') . '/payment',
            'platform_url' => $_ENV['PLATFORM_URL'] ?? 'https://centre-culturel-olivier.fr'
        ];

        return $this->sendTemplateEmail(
            $parent['email'],
            'Rappel de paiement - ' . $paymentData['course_name'],
            $template,
            $variables
        );
    }

    /**
     * Envoyer un email de réinitialisation de mot de passe
     */
    public function sendPasswordResetEmail($email, $token, $firstName)
    {
        $template = $this->getPasswordResetTemplate();
        
        $variables = [
            'first_name' => $firstName,
            'reset_url' => ($_ENV['PLATFORM_URL'] ?? 'https://centre-culturel-olivier.fr') . '/reset-password?token=' . $token,
            'platform_url' => $_ENV['PLATFORM_URL'] ?? 'https://centre-culturel-olivier.fr',
            'token' => $token
        ];

        return $this->sendTemplateEmail(
            $email,
            'Réinitialisation de votre mot de passe',
            $template,
            $variables
        );
    }

    /**
     * Traiter un template avec des variables
     */
    private function processTemplate($template, $variables)
    {
        $content = $template;
        
        foreach ($variables as $key => $value) {
            $placeholder = '{' . $key . '}';
            $content = str_replace($placeholder, $value, $content);
        }
        
        return $content;
    }

    /**
     * Template de notification de message
     */
    private function getMessageNotificationTemplate()
    {
        return '
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Nouveau message</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #4f46e5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                .message-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4f46e5; }
                .button { display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>📧 Nouveau message reçu</h1>
                </div>
                <div class="content">
                    <p>Bonjour <strong>{recipient_name}</strong>,</p>
                    
                    <p>Vous avez reçu un nouveau message de <strong>{sender_name}</strong> :</p>
                    
                    <div class="message-box">
                        <h3>{message_subject}</h3>
                        <p>{message_content}</p>
                        <small>Envoyé le {message_date}</small>
                    </div>
                    
                    <p>
                        <a href="{login_url}" class="button">Voir le message</a>
                    </p>
                    
                    <p>Connectez-vous à votre espace pour répondre à ce message.</p>
                </div>
                <div class="footer">
                    <p>Cet email a été envoyé automatiquement par {platform_url}</p>
                </div>
            </div>
        </body>
        </html>';
    }

    /**
     * Template de notification de progression
     */
    private function getProgressNotificationTemplate()
    {
        return '
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Progression de votre enfant</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                .stats { display: flex; justify-content: space-around; margin: 20px 0; }
                .stat { text-align: center; background: white; padding: 15px; border-radius: 8px; }
                .stat-number { font-size: 24px; font-weight: bold; color: #10b981; }
                .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎉 Progression de {child_name}</h1>
                </div>
                <div class="content">
                    <p>Bonjour <strong>{parent_name}</strong>,</p>
                    
                    <p>Votre enfant <strong>{child_name}</strong> a fait des progrès dans le cours <strong>{course_name}</strong> !</p>
                    
                    <div class="stats">
                        <div class="stat">
                            <div class="stat-number">{study_time}</div>
                            <div>Temps d\'étude</div>
                        </div>
                        <div class="stat">
                            <div class="stat-number">{lessons_completed}</div>
                            <div>Leçons terminées</div>
                        </div>
                        <div class="stat">
                            <div class="stat-number">{average_score}%</div>
                            <div>Score moyen</div>
                        </div>
                    </div>
                    
                    <p>
                        <a href="{platform_url}" class="button">Voir la progression détaillée</a>
                    </p>
                    
                    <p>Continuez à encourager votre enfant dans son apprentissage !</p>
                </div>
                <div class="footer">
                    <p>Cet email a été envoyé automatiquement par {platform_url}</p>
                </div>
            </div>
        </body>
        </html>';
    }

    /**
     * Template de rappel de paiement
     */
    private function getPaymentReminderTemplate()
    {
        return '
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Rappel de paiement</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #f59e0b; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                .payment-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
                .amount { font-size: 24px; font-weight: bold; color: #f59e0b; }
                .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>💳 Rappel de paiement</h1>
                </div>
                <div class="content">
                    <p>Bonjour <strong>{parent_name}</strong>,</p>
                    
                    <p>Nous vous rappelons que votre paiement pour le cours <strong>{course_name}</strong> est en attente.</p>
                    
                    <div class="payment-box">
                        <h3>Détails du paiement</h3>
                        <p><strong>Montant :</strong> <span class="amount">{amount}€</span></p>
                        <p><strong>Date limite :</strong> {due_date}</p>
                    </div>
                    
                    <p>
                        <a href="{payment_url}" class="button">Effectuer le paiement</a>
                    </p>
                    
                    <p>Merci de régulariser votre situation pour continuer à profiter de nos services.</p>
                </div>
                <div class="footer">
                    <p>Cet email a été envoyé automatiquement par {platform_url}</p>
                </div>
            </div>
        </body>
        </html>';
    }

    /**
     * Template pour l'email de réinitialisation de mot de passe
     */
    private function getPasswordResetTemplate()
    {
        return '
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Réinitialisation de mot de passe</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                .reset-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6; }
                .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
                .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔐 Réinitialisation de mot de passe</h1>
                </div>
                
                <div class="content">
                    <p>Bonjour <strong>{first_name}</strong>,</p>
                    
                    <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte sur notre plateforme éducative.</p>
                    
                    <div class="reset-box">
                        <h3>Pour réinitialiser votre mot de passe :</h3>
                        <p>Cliquez sur le bouton ci-dessous pour accéder à la page de réinitialisation :</p>
                        
                        <a href="{reset_url}" class="button">Réinitialiser mon mot de passe</a>
                        
                        <p><small>Ou copiez ce lien dans votre navigateur :<br>{reset_url}</small></p>
                    </div>
                    
                    <div class="warning">
                        <p><strong>⚠️ Important :</strong></p>
                        <ul>
                            <li>Ce lien est valide pendant 1 heure seulement</li>
                            <li>Si vous n\'avez pas demandé cette réinitialisation, ignorez cet email</li>
                            <li>Votre mot de passe actuel reste valide jusqu\'à ce que vous le changiez</li>
                        </ul>
                    </div>
                    
                    <p>Si vous rencontrez des difficultés, n\'hésitez pas à nous contacter.</p>
                    
                    <div class="footer">
                        <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
                        <p>© 2024 Centre Culturel Olivier - Plateforme Éducative</p>
                    </div>
                </div>
            </div>
        </body>
        </html>';
    }
}