<?php
/**
 * Configuration des emails
 */

// Configuration SMTP pour l'envoi d'emails
// À adapter selon votre hébergeur

// Pour Gmail
// define('SMTP_HOST', 'smtp.gmail.com');
// define('SMTP_PORT', 587);
// define('SMTP_USERNAME', 'votre-email@gmail.com');
// define('SMTP_PASSWORD', 'votre-mot-de-passe-app');

// Pour Hostinger (exemple)
// define('SMTP_HOST', 'smtp.hostinger.com');
// define('SMTP_PORT', 587);
// define('SMTP_USERNAME', 'noreply@centre-culturel-olivier.fr');
// define('SMTP_PASSWORD', 'votre-mot-de-passe');

// Configuration par défaut (utilise la fonction mail() de PHP)
define('SMTP_HOST', '');
define('SMTP_PORT', 587);
define('SMTP_USERNAME', '');
define('SMTP_PASSWORD', '');

// Email d'expéditeur
define('FROM_EMAIL', 'noreply@centre-culturel-olivier.fr');
define('FROM_NAME', 'Centre Culturel Olivier');

// URL de base pour les liens dans les emails
define('BASE_URL', 'https://centre-culturel-olivier.fr');
?>