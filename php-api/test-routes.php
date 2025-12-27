<?php
/**
 * Script de test pour vérifier le routage des évaluations
 */

// Configuration CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Gestion des requêtes OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Informations de débogage
$debug = [
    'method' => $_SERVER['REQUEST_METHOD'],
    'uri' => $_SERVER['REQUEST_URI'],
    'path' => parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH),
    'script_name' => $_SERVER['SCRIPT_NAME'],
    'document_root' => $_SERVER['DOCUMENT_ROOT'],
    'file_exists' => file_exists(__DIR__ . '/index.php'),
    'routes_file' => file_exists(__DIR__ . '/src/Core/Application.php'),
    'controller_file' => file_exists(__DIR__ . '/src/Controllers/EvaluationController.php'),
];

// Test de chargement de l'application
try {
    require_once __DIR__ . '/config/autoloader.php';
    require_once __DIR__ . '/config/database.php';
    require_once __DIR__ . '/config/jwt.php';
    
    $app = new App\Core\Application();
    
    $debug['app_loaded'] = true;
    $debug['routes_loaded'] = true;
    
    // Vérifier si la route existe
    $method = $_SERVER['REQUEST_METHOD'];
    $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    
    $debug['checking_route'] = [
        'method' => $method,
        'uri' => $uri,
        'expected' => '/api/evaluations'
    ];
    
    // Test direct du contrôleur
    if (class_exists('App\Controllers\EvaluationController')) {
        $debug['controller_exists'] = true;
        $controller = new App\Controllers\EvaluationController();
        $debug['controller_methods'] = get_class_methods($controller);
    } else {
        $debug['controller_exists'] = false;
    }
    
} catch (Exception $e) {
    $debug['error'] = $e->getMessage();
    $debug['trace'] = $e->getTraceAsString();
}

echo json_encode([
    'status' => 'test',
    'debug' => $debug,
    'message' => 'Ce fichier teste la configuration du routage'
], JSON_PRETTY_PRINT);

