<?php

namespace App\Utils;

/**
 * Classe utilitaire pour gérer les réponses HTTP
 */
class Response {
    
    public static function json($data, $statusCode = 200) {
        // Nettoyer la sortie pour éviter la pollution HTML
        if (ob_get_level()) {
            ob_clean();
        }
        
        // Assurer que les headers CORS sont toujours présents
        if (!headers_sent()) {
            // Autoriser les domaines spécifiques
            $allowedOrigins = [
                'http://localhost:4200',
                'https://centre-culturel-olivier.fr',
                'https://www.centre-culturel-olivier.fr'
            ];
            
            $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
            if (in_array($origin, $allowedOrigins)) {
                header("Access-Control-Allow-Origin: $origin");
            } else {
                // Fallback pour les requêtes sans origin - autoriser le domaine de production
                header("Access-Control-Allow-Origin: https://centre-culturel-olivier.fr");
            }
            
            header("Access-Control-Allow-Credentials: true");
            header("Content-Type: application/json; charset=UTF-8");
        }
        
        http_response_code($statusCode);
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }
    
    public static function success($data = null, $message = 'Success') {
        self::json([
            'success' => true,
            'message' => $message,
            'data' => $data
        ], 200);
    }
    
    public static function created($data = null, $message = 'Created successfully') {
        self::json([
            'success' => true,
            'message' => $message,
            'data' => $data
        ], 201);
    }
    
    public static function error($message, $statusCode = 400, $errors = null) {
        $response = [
            'success' => false,
            'message' => $message,
            'statusCode' => $statusCode
        ];
        
        if ($errors !== null) {
            $response['errors'] = $errors;
        }
        
        self::json($response, $statusCode);
    }
    
    public static function badRequest($message = 'Bad Request', $errors = null) {
        self::error($message, 400, $errors);
    }
    
    public static function unauthorized($message = 'Unauthorized') {
        self::error($message, 401);
    }
    
    public static function forbidden($message = 'Forbidden') {
        self::error($message, 403);
    }
    
    public static function notFound($message = 'Not Found') {
        self::error($message, 404);
    }
    
    public static function internalError($message = 'Internal Server Error') {
        self::error($message, 500);
    }
    
    public static function validationError($errors) {
        self::error('Validation failed', 422, $errors);
    }
}
