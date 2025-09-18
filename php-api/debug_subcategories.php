<?php
require_once __DIR__ . '/src/Core/DatabaseConfig.php';
require_once __DIR__ . '/src/Models/Subcategory.php';
require_once __DIR__ . '/src/Models/Lesson.php';

use App\Models\Subcategory;
use App\Models\Lesson;

try {
    $db = \DatabaseConfig::getInstance()->getConnection();
    echo "Connexion à la base de données réussie.\n";

    // 1. Vérifier les sous-catégories avec ID 3 et 48
    echo "\n=== SOUS-CATÉGORIES ID 3 et 48 ===\n";
    $subcategory3 = Subcategory::find(3);
    $subcategory48 = Subcategory::find(48);
    
    if ($subcategory3) {
        echo "ID 3: {$subcategory3->name} (Catégorie: {$subcategory3->categoryId})\n";
    } else {
        echo "ID 3: Non trouvée\n";
    }
    
    if ($subcategory48) {
        echo "ID 48: {$subcategory48->name} (Catégorie: {$subcategory48->categoryId})\n";
    } else {
        echo "ID 48: Non trouvée\n";
    }

    // 2. Vérifier toutes les sous-catégories
    echo "\n=== TOUTES LES SOUS-CATÉGORIES ===\n";
    $allSubcategories = Subcategory::all();
    foreach ($allSubcategories as $sub) {
        echo "ID: {$sub->id}, Nom: {$sub->name}, Catégorie: {$sub->categoryId}\n";
    }

    // 3. Tester la méthode subcategory() sur une leçon
    echo "\n=== TEST MÉTHODE SUBCATEGORY() ===\n";
    $lesson = Lesson::find(59); // La leçon "teste lesson ecriture"
    if ($lesson) {
        echo "Leçon: {$lesson->title}\n";
        echo "subcategoryId: {$lesson->subcategoryId}\n";
        $subcategory = $lesson->subcategory();
        if ($subcategory) {
            echo "Sous-catégorie trouvée: {$subcategory->name}\n";
        } else {
            echo "Sous-catégorie non trouvée\n";
        }
    }

    echo "\nDebug terminé.\n";

} catch (\PDOException $e) {
    echo "Erreur de base de données: " . $e->getMessage() . "\n";
} catch (\Exception $e) {
    echo "Erreur: " . $e->getMessage() . "\n";
}
?>
