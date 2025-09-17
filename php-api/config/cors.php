<?php
/**
 * Configuration CORS centralisée
 */

// Domaines autorisés
const ALLOWED_ORIGINS = [
    'http://localhost:4200',    // Développement local
    'https://arrisala.fr',      // Production
    'https://www.arrisala.fr'   // Production avec www
];

/**
 * Configure les headers CORS
 */
function setCorsHeaders() {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    
    if (in_array($origin, ALLOWED_ORIGINS)) {
        header("Access-Control-Allow-Origin: $origin");
    } else {
        // Fallback pour les requêtes sans origin (ex: Postman, curl)
        header("Access-Control-Allow-Origin: http://localhost:4200");
    }
    
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin");
    header("Access-Control-Max-Age: 86400"); // Cache preflight pendant 24h
}

/**
 * Gère les requêtes OPTIONS (preflight CORS)
 */
function handleCorsPreflight() {
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        setCorsHeaders();
        header("Content-Type: application/json; charset=UTF-8");
        http_response_code(200);
        echo json_encode([
            'message' => 'CORS preflight successful',
            'method' => 'OPTIONS',
            'origin' => $_SERVER['HTTP_ORIGIN'] ?? 'No origin header',
            'timestamp' => date('Y-m-d H:i:s')
        ]);
        exit();
    }
}

/**
 * Vérifie si l'origine est autorisée
 */
function isOriginAllowed($origin = null) {
    if ($origin === null) {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    }
    return in_array($origin, ALLOWED_ORIGINS);
}

/**
 * Retourne la liste des domaines autorisés
 */
function getAllowedOrigins() {
    return ALLOWED_ORIGINS;
}
