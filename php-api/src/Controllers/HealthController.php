<?php

namespace App\Controllers;

use App\Utils\Response;

/**
 * Contrôleur de santé de l'API
 */
class HealthController {
    
    /**
     * Vérifie l'état de l'API
     */
    public function check() {
        $status = [
            'status' => 'OK',
            'timestamp' => date('Y-m-d H:i:s'),
            'version' => '1.0.0',
            'php_version' => PHP_VERSION,
            'memory_usage' => memory_get_usage(true),
            'database' => 'connected'
        ];
        
        try {
            // Test de connexion à la base de données
            $db = \DatabaseConfig::getInstance()->getConnection();
            $db->query('SELECT 1');
        } catch (Exception $e) {
            $status['database'] = 'disconnected';
            $status['database_error'] = $e->getMessage();
        }
        
        Response::success($status, 'API is running');
    }
}
