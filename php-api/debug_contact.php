<?php
/**
 * Script de debug pour l'API de contact
 */

echo "=== Debug de l'API de contact ===\n";

// Test 1: Vérifier que les fichiers existent
echo "🔍 Vérification des fichiers...\n";

$files = [
    'src/Controllers/ContactController.php',
    'src/Core/Response.php',
    'src/Utils/Validator.php',
    'src/Utils/EmailSender.php',
    'src/Core/Database.php'
];

foreach ($files as $file) {
    if (file_exists($file)) {
        echo "✅ $file existe\n";
    } else {
        echo "❌ $file manquant\n";
    }
}

// Test 2: Vérifier la syntaxe PHP
echo "\n🔍 Vérification de la syntaxe PHP...\n";

$phpFiles = [
    'src/Controllers/ContactController.php',
    'src/Core/Response.php',
    'src/Utils/Validator.php',
    'src/Utils/EmailSender.php',
    'src/Core/Database.php'
];

foreach ($phpFiles as $file) {
    if (file_exists($file)) {
        $output = shell_exec("php -l $file 2>&1");
        if (strpos($output, 'No syntax errors') !== false) {
            echo "✅ $file - Syntaxe OK\n";
        } else {
            echo "❌ $file - Erreur de syntaxe:\n";
            echo "   $output\n";
        }
    }
}

// Test 3: Vérifier la table contact_messages
echo "\n🔍 Vérification de la table contact_messages...\n";

try {
    require_once 'config/database.php';
    $pdo = Database::getConnection();
    
    $stmt = $pdo->query("SHOW TABLES LIKE 'contact_messages'");
    if ($stmt->rowCount() > 0) {
        echo "✅ Table contact_messages existe\n";
        
        // Vérifier la structure
        $stmt = $pdo->query("DESCRIBE contact_messages");
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo "📋 Colonnes: " . count($columns) . "\n";
        
        foreach ($columns as $column) {
            echo "   - {$column['Field']} ({$column['Type']})\n";
        }
    } else {
        echo "❌ Table contact_messages n'existe pas\n";
    }
} catch (Exception $e) {
    echo "❌ Erreur de base de données: " . $e->getMessage() . "\n";
}

// Test 4: Test simple du ContactController
echo "\n🔍 Test du ContactController...\n";

try {
    // Simuler l'environnement
    $_SERVER['REQUEST_METHOD'] = 'POST';
    $_SERVER['REMOTE_ADDR'] = '127.0.0.1';
    
    // Simuler les données JSON
    $testData = [
        'firstName' => 'Test',
        'lastName' => 'User',
        'email' => 'test@example.com',
        'subject' => 'Test',
        'message' => 'Message de test'
    ];
    
    // Simuler l'input JSON
    file_put_contents('php://input', json_encode($testData));
    
    // Inclure le contrôleur
    require_once 'src/Controllers/ContactController.php';
    
    $controller = new ContactController();
    echo "✅ ContactController instancié avec succès\n";
    
    // Test de la méthode getContactInfo (plus simple)
    echo "🔍 Test de getContactInfo...\n";
    $result = $controller->getContactInfo();
    echo "📄 Résultat: " . $result . "\n";
    
} catch (Exception $e) {
    echo "❌ Erreur: " . $e->getMessage() . "\n";
    echo "📍 Fichier: " . $e->getFile() . ":" . $e->getLine() . "\n";
    echo "📚 Trace:\n" . $e->getTraceAsString() . "\n";
}

echo "\n🎉 Debug terminé!\n";
