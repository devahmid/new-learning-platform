<?php

namespace App\Controllers;

use App\Utils\Response;

/**
 * Contrôleur de test pour GDPR
 */
class GdprTestController {
    
    public function test() {
        Response::json([
            'success' => true,
            'message' => 'Endpoint de test GDPR fonctionne',
            'timestamp' => date('Y-m-d H:i:s')
        ], 200);
    }
}