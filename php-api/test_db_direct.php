<?php
/**
 * Test direct en base de données
 */

// Configuration des erreurs pour affichage
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "🔍 Test direct base de données...\n\n";

try {
    require_once __DIR__ . '/config/database.php';
    $db = \DatabaseConfig::getInstance()->getConnection();
    
    echo "1. Connexion DB OK\n";
    
    // Test simple d'insertion
    echo "2. Test insertion simple...\n";
    
    $stmt = $db->prepare("
        INSERT INTO user_gdpr_consents (
            user_id, analytics_consent, functional_consent, marketing_consent, 
            essential_consent, consent_version, ip_address, user_agent, 
            is_active
        ) VALUES (?, ?, ?, ?, 1, '1.0', ?, ?, 1)
    ");
    
    $result = $stmt->execute([
        14, // userId 
        1,  // analytics
        1,  // functional
        0,  // marketing
        '127.0.0.1', // ip
        'Test-Agent'  // user_agent
    ]);
    
    if ($result) {
        $id = $db->lastInsertId();
        echo "   ✅ Insertion réussie, ID: $id\n";
        
        // Nettoyer le test
        $deleteStmt = $db->prepare("DELETE FROM user_gdpr_consents WHERE id = ?");
        $deleteStmt->execute([$id]);
        echo "   🧹 Test nettoyé\n";
    } else {
        echo "   ❌ Échec insertion\n";
    }
    
    echo "\n✅ Test terminé !\n";
    
} catch (Exception $e) {
    echo "\n❌ Erreur : " . $e->getMessage() . "\n";
    echo "📍 Fichier : " . $e->getFile() . "\n";
    echo "📍 Ligne : " . $e->getLine() . "\n";
}
?>