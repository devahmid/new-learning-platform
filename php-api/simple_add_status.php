<?php
/**
 * Script simple pour ajouter la colonne status si elle n'existe pas
 */

header('Content-Type: text/plain; charset=utf-8');

echo "=== AJOUT COLONNE STATUS ===\n\n";

try {
    require_once __DIR__ . '/config/database.php';
    
    $db = DatabaseConfig::getInstance()->getConnection();
    
    // Vérifier si la colonne existe déjà
    echo "🔍 Vérification de la colonne status...\n";
    $stmt = $db->query("SHOW COLUMNS FROM courses LIKE 'status'");
    $exists = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($exists) {
        echo "✅ La colonne status existe déjà: {$exists['Type']}\n\n";
    } else {
        echo "➕ Ajout de la colonne status...\n";
        
        // Ajouter la colonne
        $sql = "ALTER TABLE courses ADD COLUMN status ENUM('draft', 'published', 'archived') DEFAULT 'draft' AFTER isActive";
        $stmt = $db->prepare($sql);
        $stmt->execute();
        echo "✅ Colonne status ajoutée!\n\n";
        
        // Mettre à jour les données existantes
        echo "🔄 Mise à jour des cours existants...\n";
        $updateSql = "UPDATE courses SET status = CASE WHEN isActive = 1 THEN 'published' ELSE 'draft' END";
        $stmt = $db->prepare($updateSql);
        $stmt->execute();
        $affectedRows = $stmt->rowCount();
        echo "✅ {$affectedRows} cours mis à jour!\n\n";
        
        // Ajouter l'index
        echo "📊 Ajout de l'index...\n";
        try {
            $indexSql = "CREATE INDEX idx_courses_status ON courses(status)";
            $stmt = $db->prepare($indexSql);
            $stmt->execute();
            echo "✅ Index ajouté!\n\n";
        } catch (Exception $e) {
            if (strpos($e->getMessage(), 'Duplicate key name') !== false) {
                echo "ℹ️ Index existe déjà\n\n";
            } else {
                throw $e;
            }
        }
    }
    
    // Afficher le résultat
    echo "📊 Résultat final:\n";
    $stmt = $db->query("SELECT status, COUNT(*) as count FROM courses GROUP BY status");
    $stats = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($stats as $stat) {
        echo "   {$stat['status']}: {$stat['count']} cours\n";
    }
    
    echo "\n✅ TERMINÉ!\n";
    
} catch (Exception $e) {
    echo "❌ ERREUR: " . $e->getMessage() . "\n";
    echo "Stack: " . $e->getTraceAsString() . "\n";
}
?>
