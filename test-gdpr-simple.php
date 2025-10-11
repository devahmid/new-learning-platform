<?php
/**
 * Test temporaire pour l'endpoint GDPR
 * À placer dans le dossier racine de l'API : /api/test-gdpr.php
 */

// Headers CORS
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://centre-culturel-olivier.fr');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

// Gérer les requêtes OPTIONS (CORS preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Réponse de test
$response = [
    'success' => true,
    'message' => 'Endpoint GDPR temporaire fonctionne',
    'data' => [
        'received_data' => json_decode(file_get_contents('php://input'), true),
        'method' => $_SERVER['REQUEST_METHOD'],
        'timestamp' => date('Y-m-d H:i:s')
    ]
];

echo json_encode($response);
?>