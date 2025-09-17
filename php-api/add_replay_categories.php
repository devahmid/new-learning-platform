<?php
/**
 * Script pour ajouter les catégories Replay
 * Usage: php add_replay_categories.php
 */

require_once 'config/database.php';

try {
    $db = \DatabaseConfig::getInstance()->getConnection();
    
    echo "🎬 Ajout des catégories Replay...\n";
    
    // 1. Ajouter la catégorie principale "Replay"
    $stmt = $db->prepare("
        INSERT INTO categories (name, description, `order`, isActive, createdAt, updatedAt) 
        VALUES (?, ?, ?, ?, NOW(), NOW())
    ");
    $stmt->execute(['Replay', 'Cours enregistrés et sessions de replay', 9, 1]);
    $replayCategoryId = $db->lastInsertId();
    
    echo "✅ Catégorie 'Replay' créée avec l'ID: $replayCategoryId\n";
    
    // 2. Ajouter les sous-catégories Replay
    $subcategories = [
        // Replay Langue Arabe
        ['Replay Langue Arabe', 'Replay des cours de langue arabe', 1],
        ['Replay Vocabulaire', 'Replay des cours de vocabulaire arabe', 2],
        ['Replay Grammaire', 'Replay des cours de grammaire arabe', 3],
        ['Replay Lecture', 'Replay des cours de lecture et prononciation', 4],
        
        // Replay Croyance
        ['Replay Croyance', 'Replay des cours de croyance islamique', 5],
        ['Replay Les 6 piliers de la foi', 'Replay des cours sur les fondements de la foi', 6],
        ['Replay L\'unicité d\'Allah', 'Replay des cours sur le Tawhid', 7],
        
        // Replay At-Tafsir
        ['Replay At-Tafsir', 'Replay des cours d\'exégèse du Coran', 8],
        ['Replay Tafsir des sourates courtes', 'Replay des cours d\'exégèse des sourates courtes', 9],
        ['Replay Tafsir des sourates longues', 'Replay des cours d\'exégèse des sourates longues', 10],
        
        // Replay Fiqh
        ['Replay Fiqh', 'Replay des cours de jurisprudence islamique', 11],
        ['Replay Prière', 'Replay des cours sur les règles de la prière', 12],
        ['Replay Jeûne', 'Replay des cours sur les règles du jeûne', 13],
        ['Replay Zakat', 'Replay des cours sur l\'aumône légale', 14],
        
        // Replay Hadith
        ['Replay Hadith', 'Replay des cours de sciences du hadith', 15],
        ['Replay Les 40 hadiths', 'Replay des cours sur les 40 hadiths de Nawawi', 16],
        ['Replay Sahih Bukhari', 'Replay des cours sur le Sahih Bukhari', 17],
        
        // Replay As-Sirah
        ['Replay As-Sirah', 'Replay des cours de biographie du Prophète', 18],
        ['Replay Enfance du Prophète', 'Replay des cours sur la jeunesse du Prophète', 19],
        ['Replay Révélation', 'Replay des cours sur le début de la révélation', 20],
        ['Replay Hégire', 'Replay des cours sur l\'émigration à Médine', 21],
        
        // Replay Sirat as-sahabah
        ['Replay Sirat as-sahabah', 'Replay des cours de biographie des compagnons', 22],
        ['Replay Les 10 promis au Paradis', 'Replay des cours sur les 10 compagnons', 23],
        ['Replay Les femmes compagnons', 'Replay des cours sur les femmes compagnons', 24],
        
        // Replay Invocations
        ['Replay Invocations', 'Replay des cours sur les invocations', 25],
        ['Replay Invocations du matin et du soir', 'Replay des cours sur les adhkar quotidiens', 26],
        ['Replay Invocations de la prière', 'Replay des cours sur les invocations pendant la prière', 27]
    ];
    
    $stmt = $db->prepare("
        INSERT INTO subcategories (name, description, categoryId, `order`, isActive, createdAt, updatedAt) 
        VALUES (?, ?, ?, ?, 1, NOW(), NOW())
    ");
    
    $count = 0;
    foreach ($subcategories as $subcategory) {
        $stmt->execute([
            $subcategory[0], // name
            $subcategory[1], // description
            $replayCategoryId, // categoryId
            $subcategory[2]  // order
        ]);
        $count++;
    }
    
    echo "✅ $count sous-catégories Replay créées\n";
    echo "🎉 Migration terminée avec succès!\n";
    
    // Afficher un résumé
    echo "\n📊 Résumé:\n";
    echo "- Catégorie principale: Replay (ID: $replayCategoryId)\n";
    echo "- Sous-catégories: $count\n";
    echo "- Prêt pour l'intégration frontend!\n";
    
} catch (Exception $e) {
    echo "❌ Erreur lors de la migration: " . $e->getMessage() . "\n";
    exit(1);
}
?>
