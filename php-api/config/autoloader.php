<?php
/**
 * Autoloader simple pour charger automatiquement les classes
 */

spl_autoload_register(function ($className) {
    // Remplacer les namespace par des chemins de fichiers
    $className = str_replace('App\\', '', $className);
    $className = str_replace('\\', '/', $className);
    
    $file = __DIR__ . '/../src/' . $className . '.php';
    
    if (file_exists($file)) {
        require_once $file;
        return true;
    }
    
    return false;
});

// Chargement des utilitaires
require_once __DIR__ . '/../src/Utils/Response.php';
require_once __DIR__ . '/../src/Utils/Validator.php';
require_once __DIR__ . '/../src/Utils/JWT.php';

// Chargement des configurations
require_once __DIR__ . '/database.php';
require_once __DIR__ . '/email.php';
require_once __DIR__ . '/stripe.php';