<?php

require_once 'config/autoloader.php';

try {
    $db = \DatabaseConfig::getInstance()->getConnection();
    
    echo "=== AJOUT DE LA SOUS-CATÉGORIE 'ÉCRITURE' ===\n";
    
    // Vérifier si la catégorie "Arabe" existe
    $stmt = $db->prepare("SELECT id, name FROM categories WHERE name = 'Arabe'");
    $stmt->execute();
    $arabeCategory = $stmt->fetch(\PDO::FETCH_ASSOC);
    
    if (!$arabeCategory) {
        echo "ERREUR: La catégorie 'Arabe' n'existe pas!\n";
        exit;
    }
    
    echo "Catégorie 'Arabe' trouvée avec ID: {$arabeCategory['id']}\n";
    
    // Vérifier si la sous-catégorie "Écriture" existe déjà
    $stmt = $db->prepare("SELECT id FROM subcategories WHERE name = 'Écriture' AND categoryId = ?");
    $stmt->execute([$arabeCategory['id']]);
    $existing = $stmt->fetch();
    
    if ($existing) {
        echo "La sous-catégorie 'Écriture' existe déjà avec ID: {$existing['id']}\n";
    } else {
        // Créer la sous-catégorie "Écriture"
        $stmt = $db->prepare("INSERT INTO subcategories (name, description, categoryId, isActive, `order`) VALUES (?, ?, ?, 1, 2)");
        $stmt->execute([
            'Écriture',
            'Apprentissage de l\'écriture arabe',
            $arabeCategory['id']
        ]);
        
        $ecritureId = $db->lastInsertId();
        echo "Sous-catégorie 'Écriture' créée avec ID: $ecritureId\n";
    }
    
    // Vérifier les sous-catégories existantes pour Arabe
    $stmt = $db->prepare("SELECT id, name, `order` FROM subcategories WHERE categoryId = ? ORDER BY `order`");
    $stmt->execute([$arabeCategory['id']]);
    $subcategories = $stmt->fetchAll(\PDO::FETCH_ASSOC);
    
    echo "\nSous-catégories pour 'Arabe':\n";
    foreach ($subcategories as $sub) {
        echo "- ID: {$sub['id']} - Nom: {$sub['name']} - Ordre: {$sub['order']}\n";
    }
    
} catch (Exception $e) {
    echo "Erreur: " . $e->getMessage() . "\n";
}
