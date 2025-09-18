<?php

require_once 'config/autoloader.php';

try {
    $db = \DatabaseConfig::getInstance()->getConnection();
    
    echo "=== VÉRIFICATION DE LA TABLE classe_categories ===\n";
    
    // Vérifier si la table existe
    $stmt = $db->prepare("SHOW TABLES LIKE 'classe_categories'");
    $stmt->execute();
    $tableExists = $stmt->fetch();
    
    if (!$tableExists) {
        echo "La table classe_categories n'existe pas. Création...\n";
        
        $createTable = "
        CREATE TABLE classe_categories (
            id INT AUTO_INCREMENT PRIMARY KEY,
            classeId INT NOT NULL,
            categoryId INT NOT NULL,
            isActive BOOLEAN DEFAULT TRUE,
            `order` INT DEFAULT 0,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (classeId) REFERENCES classes(id) ON DELETE CASCADE,
            FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE CASCADE,
            UNIQUE KEY unique_classe_category (classeId, categoryId)
        )";
        
        $db->exec($createTable);
        echo "Table classe_categories créée avec succès.\n";
    } else {
        echo "La table classe_categories existe.\n";
    }
    
    // Vérifier les données existantes
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM classe_categories");
    $stmt->execute();
    $count = $stmt->fetch(\PDO::FETCH_ASSOC)['count'];
    echo "Nombre d'associations existantes: $count\n";
    
    if ($count == 0) {
        echo "\n=== PEUPLEMENT DE LA TABLE ===\n";
        
        // Récupérer toutes les classes
        $stmt = $db->prepare("SELECT id, name FROM classes ORDER BY id");
        $stmt->execute();
        $classes = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        
        // Récupérer toutes les catégories
        $stmt = $db->prepare("SELECT id, name FROM categories ORDER BY id");
        $stmt->execute();
        $categories = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        
        echo "Classes trouvées: " . count($classes) . "\n";
        echo "Catégories trouvées: " . count($categories) . "\n";
        
        // Créer des associations pour chaque classe avec toutes les catégories
        $inserted = 0;
        foreach ($classes as $classe) {
            foreach ($categories as $index => $category) {
                $stmt = $db->prepare("INSERT INTO classe_categories (classeId, categoryId, isActive, `order`) VALUES (?, ?, 1, ?)");
                $stmt->execute([$classe['id'], $category['id'], $index + 1]);
                $inserted++;
            }
        }
        
        echo "Associations créées: $inserted\n";
    }
    
    // Vérifier les associations pour la classe 9 (Classe A)
    echo "\n=== VÉRIFICATION CLASSE 9 ===\n";
    $stmt = $db->prepare("
        SELECT cc.*, c.name as classe_name, cat.name as category_name 
        FROM classe_categories cc
        JOIN classes c ON cc.classeId = c.id
        JOIN categories cat ON cc.categoryId = cat.id
        WHERE cc.classeId = 9
        ORDER BY cc.order
    ");
    $stmt->execute();
    $associations = $stmt->fetchAll(\PDO::FETCH_ASSOC);
    
    echo "Associations pour la classe 9:\n";
    foreach ($associations as $assoc) {
        echo "- {$assoc['classe_name']} -> {$assoc['category_name']} (ordre: {$assoc['order']})\n";
    }
    
} catch (Exception $e) {
    echo "Erreur: " . $e->getMessage() . "\n";
}
