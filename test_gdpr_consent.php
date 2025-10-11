<?php
/**
 * Test simple de l'endpoint GDPR consent
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "🔍 Test de l'endpoint GDPR /consent...\n\n";

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
        echo "   ❌ Erreur: " . $result['message'] . "\n";
    }
    
    echo "4. Test du contrôleur GdprController...\n";
    require_once __DIR__ . '/src/Controllers/GdprController.php';
    $controller = new \App\Controllers\GdprController();
    echo "   ✅ Contrôleur instancié\n";
    
    echo "5. Test de la validation des données...\n";
    $testInput = [
        'userId' => 14,
        'analytics' => true,
        'functional' => true,
        'marketing' => false,
        'essential' => true
    ];
    
    require_once __DIR__ . '/src/Utils/Validator.php';
    $validator = new \App\Utils\Validator();
    $errors = $validator->validate($testInput, [
        'userId' => 'required|integer',
        'analytics' => 'required|boolean',
        'functional' => 'required|boolean',
        'marketing' => 'required|boolean',
        'essential' => 'boolean'
    ]);
    
    if (empty($errors)) {
        echo "   ✅ Validation OK\n";
    } else {
        echo "   ❌ Erreurs de validation: " . json_encode($errors) . "\n";
    }
    
    echo "\n✅ Test terminé avec succès !\n";
    
} catch (Exception $e) {
    echo "\n❌ Erreur trouvée : " . $e->getMessage() . "\n";
    echo "📍 Fichier : " . $e->getFile() . "\n";
    echo "📍 Ligne : " . $e->getLine() . "\n";
    echo "\n🔧 Stack trace :\n" . $e->getTraceAsString() . "\n";
}
?>
