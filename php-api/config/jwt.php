<?php
/**
 * Configuration JWT
 */

class JWTConfig {
    // Clé secrète pour signer les tokens (CHANGEZ CETTE CLÉ EN PRODUCTION!)
    const SECRET_KEY = 'your-super-secret-jwt-key-change-this-in-production';
    
    // Durée d'expiration du token (24 heures)
    const EXPIRATION_TIME = 24 * 60 * 60; // 24h en secondes
    
    // Algorithme de signature
    const ALGORITHM = 'HS256';
    
    // Issuer du token
    const ISSUER = 'edu-api-php';
}
