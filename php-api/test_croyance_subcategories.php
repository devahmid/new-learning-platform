<?php
/**
 * Script de test pour vérifier les sous-catégories de Croyance
 */

require_once 'config/database.php';

try {
    $pdo = Database::getConnection();
    
    echo "🔍 Test des sous-catégories de Croyance\n";
    echo "=====================================\n\n";
    
    // 1. Vérifier que la catégorie Croyance existe
    $stmt = $pdo->prepare("SELECT * FROM categories WHERE name = 'Croyance'");
    $stmt->execute();
    $category = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($category) {
        echo "✅ Catégorie 'Croyance' trouvée (ID: {$category['id']})\n";
    } else {
        echo "❌ Catégorie 'Croyance' non trouvée\n";
        exit(1);
    }
    
    // 2. Lister toutes les sous-catégories de Croyance
    $stmt = $pdo->prepare("
        SELECT 
            s.id,
            s.name,
            s.description,
            s.`order`,
            s.isActive,
            s.createdAt
        FROM subcategories s
        WHERE s.categoryId = ?
        ORDER BY s.`order`
    ");
    
    $stmt->execute([$category['id']]);
    $subcategories = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "\n📚 Sous-catégories de Croyance (" . count($subcategories) . " trouvées) :\n";
    echo "--------------------------------------------------------------------\n";
    
    foreach ($subcategories as $subcategory) {
        $status = $subcategory['isActive'] ? '✅ Actif' : '❌ Inactif';
        echo sprintf(
            "ID %2d | Ordre %2d | %s | %s\n",
            $subcategory['id'],
            $subcategory['order'],
            $status,
            $subcategory['name']
        );
    }
    
    // 3. Vérifier les sous-catégories attendues
    $expectedSubcategories = [
        'Les 3 fondements',
        'Connaître mon seigneur Allah ﷻ',
        'Connaître ma religion, l\'islam',
        'Connaître mon prophète ﷺ',
        'Les piliers de la foi',
        'Le Poème Lamiyyah d\'Ibn Taymiyyah',
        'Introduction à la croyance musulmane',
        'Les spécificités de la croyance musulmane',
        'La foi en Allah',
        'La foi aux anges',
        'La foi au jour dernier',
        'La foi aux livres',
        'La foi aux messagers',
        'La foi au destin'
    ];
    
    echo "\n🔍 Vérification des sous-catégories attendues :\n";
    echo "--------------------------------------------\n";
    
    $foundCount = 0;
    foreach ($expectedSubcategories as $expectedName) {
        $found = false;
        foreach ($subcategories as $subcategory) {
            if ($subcategory['name'] === $expectedName) {
                $found = true;
                $foundCount++;
                break;
            }
        }
        
        $status = $found ? '✅' : '❌';
        echo "$status $expectedName\n";
    }
    
    echo "\n📊 Résumé :\n";
    echo "----------\n";
    echo "Sous-catégories attendues : " . count($expectedSubcategories) . "\n";
    echo "Sous-catégories trouvées : $foundCount\n";
    echo "Sous-catégories manquantes : " . (count($expectedSubcategories) - $foundCount) . "\n";
    
    if ($foundCount === count($expectedSubcategories)) {
        echo "\n🎉 Toutes les sous-catégories de Croyance sont présentes !\n";
    } else {
        echo "\n⚠️  Certaines sous-catégories sont manquantes.\n";
    }
    
    // 4. Test de l'API
    echo "\n🌐 Test de l'API :\n";
    echo "----------------\n";
    
    $stmt = $pdo->prepare("
        SELECT 
            s.id,
            s.name,
            s.description,
            s.categoryId,
            c.name as categoryName
        FROM subcategories s
        JOIN categories c ON s.categoryId = c.id
        WHERE c.name = 'Croyance' AND s.isActive = 1
        ORDER BY s.`order`
    ");
    
    $stmt->execute();
    $apiData = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Données pour l'API (JSON) :\n";
    echo json_encode($apiData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";
    
} catch (Exception $e) {
    echo "❌ Erreur lors du test : " . $e->getMessage() . "\n";
    exit(1);
}
?>
