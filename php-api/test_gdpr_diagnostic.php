<?php
/**
 * Script de test pour diagnostiquer l'erreur GDPR
 */

// Configuration des erreurs pour affichage
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "🔍 Test diagnostic GDPR...\n\n";

try {
    echo "1. Test autoloader...\n";
    require_once __DIR__ . '/config/autoloader.php';
    echo "   ✅ Autoloader OK\n";
    
    echo "2. Test connexion base de données...\n";
    $db = \DatabaseConfig::getInstance()->getConnection();
    echo "   ✅ Connexion DB OK\n";
    
    echo "3. Test service GDPR...\n";
    $gdprService = new \App\Services\GdprConsentService($db);
    echo "   ✅ Service GDPR instancié\n";
    
    echo "4. Test contrôleur GDPR...\n";
    $controller = new \App\Controllers\GdprController();
    echo "   ✅ Contrôleur GDPR instancié\n";
    
    echo "5. Test table user_gdpr_consents...\n";
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM user_gdpr_consents");
    $stmt->execute();
    $result = $stmt->get_result()->fetch_assoc();
    echo "   ✅ Table user_gdpr_consents existe (" . $result['count'] . " enregistrements)\n";
    
    echo "\n✅ Tous les tests passent ! Le problème est ailleurs.\n";
    
} catch (Exception $e) {
    echo "\n❌ Erreur trouvée : " . $e->getMessage() . "\n";
    echo "📍 Fichier : " . $e->getFile() . "\n";
    echo "📍 Ligne : " . $e->getLine() . "\n";
    echo "\n🔧 Stack trace :\n" . $e->getTraceAsString() . "\n";
}
?>