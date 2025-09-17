<?php

namespace App\Utils;

/**
 * Classe utilitaire pour gérer les tokens JWT
 * Implémentation simple sans bibliothèque externe
 */
class JWT {
    
    /**
     * Génère un token JWT
     */
    public static function encode($payload) {
        $header = [
            'typ' => 'JWT',
            'alg' => \JWTConfig::ALGORITHM
        ];
        
        // Ajouter l'expiration au payload
        $payload['iat'] = time();
        $payload['exp'] = time() + \JWTConfig::EXPIRATION_TIME;
        $payload['iss'] = \JWTConfig::ISSUER;
        
        $headerEncoded = self::base64UrlEncode(json_encode($header));
        $payloadEncoded = self::base64UrlEncode(json_encode($payload));
        
        $signature = hash_hmac('sha256', $headerEncoded . '.' . $payloadEncoded, \JWTConfig::SECRET_KEY, true);
        $signatureEncoded = self::base64UrlEncode($signature);
        
        return $headerEncoded . '.' . $payloadEncoded . '.' . $signatureEncoded;
    }
    
    /**
     * Décode et vérifie un token JWT
     */
    public static function decode($token) {
        $parts = explode('.', $token);
        
        if (count($parts) !== 3) {
            throw new \Exception('Invalid token format');
        }
        
        list($headerEncoded, $payloadEncoded, $signatureEncoded) = $parts;
        
        // Vérifier la signature
        $signature = hash_hmac('sha256', $headerEncoded . '.' . $payloadEncoded, \JWTConfig::SECRET_KEY, true);
        $expectedSignature = self::base64UrlEncode($signature);
        
        if (!hash_equals($expectedSignature, $signatureEncoded)) {
            throw new \Exception('Invalid token signature');
        }
        
        // Décoder le payload
        $payload = json_decode(self::base64UrlDecode($payloadEncoded), true);
        
        if (!$payload) {
            throw new \Exception('Invalid token payload');
        }
        
        // Vérifier l'expiration
        if (isset($payload['exp']) && $payload['exp'] < time()) {
            throw new \Exception('Token expired');
        }
        
        return $payload;
    }
    
    /**
     * Récupère le token depuis les headers HTTP
     */
    public static function getTokenFromHeaders() {
        $headers = getallheaders();
        
        if (isset($headers['Authorization'])) {
            $authHeader = $headers['Authorization'];
            if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
                return $matches[1];
            }
        }
        
        return null;
    }
    
    /**
     * Vérifie et récupère l'utilisateur depuis le token
     */
    public static function getCurrentUser() {
        try {
            $token = self::getTokenFromHeaders();
            
            if (!$token) {
                return null;
            }
            
            $payload = self::decode($token);
            
            return [
                'id' => $payload['sub'] ?? null,
                'email' => $payload['email'] ?? null,
                'role' => $payload['role'] ?? null,
                'type' => $payload['type'] ?? null
            ];
        } catch (\Exception $e) {
            return null;
        }
    }
    
    /**
     * Middleware pour vérifier l'authentification
     */
    public static function requireAuth() {
        $user = self::getCurrentUser();
        
        if (!$user) {
            Response::unauthorized('Token required');
        }
        
        return $user;
    }
    
    /**
     * Middleware pour vérifier les rôles
     */
    public static function requireRole($requiredRoles) {
        $user = self::requireAuth();
        
        if (!in_array($user['role'], (array)$requiredRoles)) {
            Response::forbidden('Insufficient permissions');
        }
        
        return $user;
    }
    
    /**
     * Encodage Base64 URL-safe
     */
    private static function base64UrlEncode($data) {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
    
    /**
     * Décodage Base64 URL-safe
     */
    private static function base64UrlDecode($data) {
        return base64_decode(str_pad(strtr($data, '-_', '+/'), strlen($data) % 4, '=', STR_PAD_RIGHT));
    }
}
