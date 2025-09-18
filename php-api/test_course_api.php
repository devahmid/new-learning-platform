<?php
require_once __DIR__ . '/src/Core/DatabaseConfig.php';
require_once __DIR__ . '/src/Models/Course.php';

use App\Models\Course;

try {
    $db = \DatabaseConfig::getInstance()->getConnection();
    echo "Connexion à la base de données réussie.\n";

    // 1. Récupérer le cours avec ID 38 (celui des leçons de test)
    echo "\n=== COURS ID 38 ===\n";
    $course = Course::find(38);
    if ($course) {
        echo "Cours trouvé: {$course->title}\n";
        
        // 2. Tester la méthode toArray()
        echo "\n=== TEST toArray() ===\n";
        $courseArray = $course->toArray();
        
        echo "Nombre de leçons: " . count($courseArray['lessons']) . "\n";
        
        foreach ($courseArray['lessons'] as $index => $lesson) {
            echo "\nLeçon " . ($index + 1) . ":\n";
            echo "  - ID: {$lesson['id']}\n";
            echo "  - Titre: {$lesson['title']}\n";
            echo "  - subcategoryId: " . ($lesson['subcategoryId'] ?? 'NULL') . "\n";
            echo "  - subcategory: " . (isset($lesson['subcategory']) ? json_encode($lesson['subcategory']) : 'Non définie') . "\n";
        }
        
        // 3. Tester directement les leçons
        echo "\n=== TEST DIRECT DES LEÇONS ===\n";
        $lessons = $course->lessons();
        foreach ($lessons as $lesson) {
            echo "Leçon: {$lesson->title}\n";
            echo "  - subcategoryId: {$lesson->subcategoryId}\n";
            $subcategory = $lesson->subcategory();
            if ($subcategory) {
                echo "  - Sous-catégorie: {$subcategory->name}\n";
            } else {
                echo "  - Sous-catégorie: Non trouvée\n";
            }
        }
        
    } else {
        echo "Cours ID 38 non trouvé\n";
    }

    echo "\nTest terminé.\n";

} catch (\PDOException $e) {
    echo "Erreur de base de données: " . $e->getMessage() . "\n";
} catch (\Exception $e) {
    echo "Erreur: " . $e->getMessage() . "\n";
}
?>
