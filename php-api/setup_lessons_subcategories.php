<?php

require_once 'config/autoloader.php';

try {
    $db = \DatabaseConfig::getInstance()->getConnection();
    
    echo "=== MIGRATION ET CONFIGURATION DES SOUS-CATÉGORIES POUR LES LEÇONS ===\n";
    
    // 1. Vérifier si la colonne subcategoryId existe déjà
    $stmt = $db->prepare("SHOW COLUMNS FROM lessons LIKE 'subcategoryId'");
    $stmt->execute();
    $columnExists = $stmt->fetch();
    
    if (!$columnExists) {
        echo "Ajout de la colonne subcategoryId à la table lessons...\n";
        
        // Ajouter la colonne subcategoryId
        $db->exec("ALTER TABLE lessons ADD COLUMN subcategoryId INT NULL AFTER courseId");
        
        // Ajouter la clé étrangère
        $db->exec("ALTER TABLE lessons ADD FOREIGN KEY (subcategoryId) REFERENCES subcategories(id) ON DELETE SET NULL");
        
        echo "Colonne subcategoryId ajoutée avec succès.\n";
    } else {
        echo "La colonne subcategoryId existe déjà.\n";
    }
    
    // 2. Vérifier et créer la sous-catégorie "Écriture" pour Arabe
    echo "\n=== GESTION DE LA SOUS-CATÉGORIE 'ÉCRITURE' ===\n";
    
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
    
    // 3. Afficher toutes les sous-catégories pour Arabe
    $stmt = $db->prepare("SELECT id, name, description, `order` FROM subcategories WHERE categoryId = ? ORDER BY `order`");
    $stmt->execute([$arabeCategory['id']]);
    $subcategories = $stmt->fetchAll(\PDO::FETCH_ASSOC);
    
    echo "\nSous-catégories pour 'Arabe':\n";
    foreach ($subcategories as $sub) {
        echo "- ID: {$sub['id']} - Nom: {$sub['name']} - Description: {$sub['description']} - Ordre: {$sub['order']}\n";
    }
    
    // 4. Vérifier la structure de la table lessons
    echo "\n=== VÉRIFICATION DE LA TABLE LESSONS ===\n";
    $stmt = $db->prepare("DESCRIBE lessons");
    $stmt->execute();
    $columns = $stmt->fetchAll(\PDO::FETCH_ASSOC);
    
    echo "Colonnes de la table lessons:\n";
    foreach ($columns as $col) {
        echo "- {$col['Field']} ({$col['Type']}) - Null: {$col['Null']} - Key: {$col['Key']}\n";
    }
    
} catch (Exception $e) {
    echo "Erreur: " . $e->getMessage() . "\n";
}
