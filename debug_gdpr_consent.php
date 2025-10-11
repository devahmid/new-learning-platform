<?php
/**
 * Script de diagnostic pour l'endpoint GDPR /consent
 */

// Activer l'affichage des erreurs
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "🔍 Diagnostic de l'endpoint GDPR /consent...\n\n";

try {
    echo "1. Test de connexion à la base de données...\n";
    require_once __DIR__ . '/config/database.php';
    $db = \DatabaseConfig::getInstance()->getConnection();
    echo "   ✅ Connexion DB OK\n";
    
    echo "2. Test du service GdprConsentServiceSimple...\n";
    require_once __DIR__ . '/src/Services/GdprConsentServiceSimple.php';
    $service = new \App\Services\GdprConsentServiceSimple($db);
    echo "   ✅ Service instancié\n";
    
    echo "3. Test de la méthode saveUserConsent...\n";
    $testConsents = [
        'analytics' => true,
        'functional' => true,
        'marketing' => false,
        'essential' => true
    ];
    
    $result = $service->saveUserConsent(
        14, // ID de test - utilisateur existant
        $testConsents,
        '127.0.0.1',
        'Test-Agent',
        'test_consent'
    );
    
    if ($result['success']) {
        echo "   ✅ Sauvegarde réussie: " . $result['message'] . "\n";
        echo "   📊 Données sauvegardées: " . json_encode($result['data']) . "\n";
    } else {
        echo "   ❌ Échec sauvegarde: " . $result['message'] . "\n";
    }
    
    echo "4. Vérification en base de données...\n";
    $stmt = $db->prepare("SELECT * FROM user_gdpr_consents WHERE user_id = 999 ORDER BY created_at DESC LIMIT 1");
    $stmt->execute();
    $consent = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($consent) {
        echo "   ✅ Consentement trouvé en base:\n";
        echo "      - ID: " . $consent['id'] . "\n";
        echo "      - Analytics: " . ($consent['analytics_consent'] ? 'Oui' : 'Non') . "\n";
        echo "      - Functional: " . ($consent['functional_consent'] ? 'Oui' : 'Non') . "\n";
        echo "      - Marketing: " . ($consent['marketing_consent'] ? 'Oui' : 'Non') . "\n";
        echo "      - Essential: " . ($consent['essential_consent'] ? 'Oui' : 'Non') . "\n";
    } else {
        echo "   ❌ Aucun consentement trouvé en base\n";
    }
    
    echo "\n✅ Diagnostic terminé !\n";
    
} catch (Exception $e) {
    echo "\n❌ Erreur trouvée : " . $e->getMessage() . "\n";
    echo "📍 Fichier : " . $e->getFile() . "\n";
    echo "📍 Ligne : " . $e->getLine() . "\n";
    echo "\n🔧 Stack trace :\n" . $e->getTraceAsString() . "\n";
}
?>
