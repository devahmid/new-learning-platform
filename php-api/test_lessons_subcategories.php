<?php
require_once __DIR__ . '/src/Core/DatabaseConfig.php';
require_once __DIR__ . '/src/Models/Course.php';
require_once __DIR__ . '/src/Models/Lesson.php';
require_once __DIR__ . '/src/Models/Subcategory.php';

use App\Models\Course;
use App\Models\Lesson;
use App\Models\Subcategory;

try {
    $db = \DatabaseConfig::getInstance()->getConnection();
    echo "Connexion à la base de données réussie.\n";

    // 1. Vérifier les sous-catégories existantes
    echo "\n=== SOUS-CATÉGORIES EXISTANTES ===\n";
    $subcategories = Subcategory::all();
    foreach ($subcategories as $sub) {
        echo "ID: {$sub->id}, Nom: {$sub->name}, Catégorie ID: {$sub->categoryId}\n";
    }

    // 2. Vérifier les leçons avec leurs sous-catégories
    echo "\n=== LEÇONS AVEC SOUS-CATÉGORIES ===\n";
    $lessons = Lesson::all();
    foreach ($lessons as $lesson) {
        $subcategory = $lesson->subcategory();
        echo "Leçon: {$lesson->title} (ID: {$lesson->id})\n";
        echo "  - subcategoryId: " . ($lesson->subcategoryId ?? 'NULL') . "\n";
        echo "  - Sous-catégorie: " . ($subcategory ? $subcategory->name : 'Aucune') . "\n";
        echo "  - Cours ID: {$lesson->courseId}\n";
        echo "---\n";
    }

    // 3. Tester la récupération d'un cours avec ses leçons
    echo "\n=== TEST COURS AVEC LEÇONS ===\n";
    $courses = Course::all();
    if (!empty($courses)) {
        $course = $courses[0];
        echo "Cours: {$course->title} (ID: {$course->id})\n";
        
        $courseArray = $course->toArray();
        echo "Leçons du cours:\n";
        foreach ($courseArray['lessons'] as $lesson) {
            echo "  - {$lesson['title']}\n";
            echo "    subcategoryId: " . ($lesson['subcategoryId'] ?? 'NULL') . "\n";
            echo "    subcategory: " . (isset($lesson['subcategory']) ? $lesson['subcategory']['name'] : 'Non définie') . "\n";
        }
    }

    echo "\nTest terminé avec succès.\n";

} catch (\PDOException $e) {
    echo "Erreur de base de données: " . $e->getMessage() . "\n";
} catch (\Exception $e) {
    echo "Erreur: " . $e->getMessage() . "\n";
}
?>
