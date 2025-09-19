<?php
/**
 * Script pour ajouter les sous-catégories de Croyance
 * Exécute le fichier SQL add_croyance_subcategories.sql
 */

require_once 'config/database.php';

try {
    // Lire le fichier SQL
    $sqlFile = __DIR__ . '/add_croyance_subcategories.sql';
    
    if (!file_exists($sqlFile)) {
        throw new Exception("Fichier SQL non trouvé : $sqlFile");
    }
    
    $sql = file_get_contents($sqlFile);
    
    if ($sql === false) {
        throw new Exception("Impossible de lire le fichier SQL");
    }
    
    // Diviser les requêtes par ';' et les exécuter une par une
    $queries = array_filter(array_map('trim', explode(';', $sql)));
    
    $pdo = Database::getConnection();
    $pdo->beginTransaction();
    
    $successCount = 0;
    $errorCount = 0;
    
    foreach ($queries as $query) {
        if (empty($query) || strpos($query, '--') === 0) {
            continue; // Ignorer les commentaires et lignes vides
        }
        
        try {
            $pdo->exec($query);
            $successCount++;
            echo "✅ Requête exécutée avec succès\n";
        } catch (PDOException $e) {
            $errorCount++;
            echo "❌ Erreur lors de l'exécution de la requête : " . $e->getMessage() . "\n";
            echo "Requête : " . substr($query, 0, 100) . "...\n";
        }
    }
    
    // Vérifier les résultats
    $stmt = $pdo->prepare("
        SELECT 
            s.id,
            s.name,
            s.description,
            s.categoryId,
            c.name as categoryName,
            s.`order`,
            s.isActive
        FROM subcategories s
        JOIN categories c ON s.categoryId = c.id
        WHERE c.name = 'Croyance'
        ORDER BY s.`order`
    ");
    
    $stmt->execute();
    $subcategories = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "\n📊 Résultats :\n";
    echo "✅ Requêtes exécutées avec succès : $successCount\n";
    echo "❌ Requêtes en erreur : $errorCount\n";
    echo "📚 Sous-catégories de Croyance trouvées : " . count($subcategories) . "\n\n";
    
    if (count($subcategories) > 0) {
        echo "📋 Liste des sous-catégories ajoutées :\n";
        foreach ($subcategories as $subcategory) {
            echo "  - ID {$subcategory['id']} : {$subcategory['name']} (Ordre: {$subcategory['order']})\n";
        }
    }
    
    $pdo->commit();
    echo "\n🎉 Migration terminée avec succès !\n";
    
} catch (Exception $e) {
    if (isset($pdo)) {
        $pdo->rollBack();
    }
    echo "❌ Erreur lors de la migration : " . $e->getMessage() . "\n";
    exit(1);
}
?>
