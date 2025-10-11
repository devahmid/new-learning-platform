<?php

namespace App\Controllers;

use App\Utils\Response;

/**
 * Contrôleur GDPR - Version fonctionnelle simple
 */
class GdprControllerSimple {
    
    public function saveConsent() {
        // Récupérer les données envoyées
        $input = json_decode(file_get_contents('php://input'), true);
        
        // Simuler un succès pour tester le flux
        Response::json([
            'success' => true,
            'message' => 'Consentement sauvegardé avec succès (version test)',
            'data' => [
                'user_id' => $input['userId'] ?? 'unknown',
                'consents' => [
                    'analytics' => $input['analytics'] ?? false,
                    'functional' => $input['functional'] ?? false,
                    'marketing' => $input['marketing'] ?? false,
                    'essential' => true
                ],
                'timestamp' => date('Y-m-d H:i:s')
            ]
        ], 200);
    }
}