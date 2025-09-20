<?php
/**
 * Script pour exécuter la migration add_status_to_courses.sql
 */

require_once __DIR__ . '/config/database.php';

try {
    // Récupérer la connexion à la base de données
    $db = DatabaseConfig::getInstance()->getConnection();
    
    // Lire le fichier de migration
    $migrationFile = __DIR__ . '/migrations/add_status_to_courses.sql';
    
    if (!file_exists($migrationFile)) {
        throw new Exception("Fichier de migration non trouvé: $migrationFile");
    }
    
    $sql = file_get_contents($migrationFile);
    
    if ($sql === false) {
        throw new Exception("Impossible de lire le fichier de migration");
    }
    
    echo "🔄 Exécution de la migration add_status_to_courses...\n";
    
    // Diviser le SQL en requêtes individuelles
    $queries = array_filter(array_map('trim', explode(';', $sql)));
    
    foreach ($queries as $query) {
        if (empty($query) || strpos($query, '--') === 0) {
            continue; // Ignorer les commentaires et requêtes vides
        }
        
        echo "🔍 Exécution: " . substr($query, 0, 50) . "...\n";
        $stmt = $db->prepare($query);
        $stmt->execute();
    }
    
    echo "✅ Migration add_status_to_courses exécutée avec succès!\n";
    
    // Vérifier que la colonne a été ajoutée
    $checkQuery = "SHOW COLUMNS FROM courses LIKE 'status'";
    $stmt = $db->prepare($checkQuery);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($result) {
        echo "✅ Colonne 'status' confirmée dans la table courses\n";
        echo "📋 Type: " . $result['Type'] . "\n";
        echo "📋 Défaut: " . $result['Default'] . "\n";
    } else {
        echo "❌ Erreur: Colonne 'status' non trouvée après la migration\n";
    }
    
    // Afficher quelques exemples
    echo "\n📊 Exemples de cours avec status:\n";
    $exampleQuery = "SELECT id, title, status, isActive FROM courses LIMIT 5";
    $stmt = $db->prepare($exampleQuery);
    $stmt->execute();
    $examples = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($examples as $course) {
        echo "- ID {$course['id']}: {$course['title']} | Status: {$course['status']} | Active: {$course['isActive']}\n";
    }
    
} catch (Exception $e) {
    echo "❌ Erreur lors de la migration: " . $e->getMessage() . "\n";
    exit(1);
}
