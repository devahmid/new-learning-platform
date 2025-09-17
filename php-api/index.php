<?php
/**
 * API PHP - Point d'entrée principal
 * Inspirée de l'API NestJS existante
 */

// Configuration des erreurs
error_reporting(E_ALL);
ini_set('display_errors', 0); // Désactiver l'affichage des erreurs pour éviter la pollution JSON
ini_set('log_errors', 1); // Activer les logs d'erreurs

// Configuration CORS centralisée
require_once __DIR__ . '/config/cors.php';

// Headers CORS
setCorsHeaders();
header("Content-Type: application/json; charset=UTF-8");

// Gestion des requêtes OPTIONS (preflight CORS)
handleCorsPreflight();

// Autoloader
require_once __DIR__ . '/config/autoloader.php';
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/jwt.php';

// Initialisation de l'application
$app = new App\Core\Application();

try {
    // Routage des requêtes
    $app->handleRequest();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Internal Server Error',
        'message' => $e->getMessage(),
        'statusCode' => 500
    ]);
}
