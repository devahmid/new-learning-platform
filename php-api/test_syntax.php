<?php
// Test de syntaxe PHP
echo "PHP fonctionne correctement\n";

// Test de chargement des classes
try {
    require_once 'src/Core/Application.php';
    echo "Application.php chargé avec succès\n";
} catch (ParseError $e) {
    echo "ERREUR DE SYNTAXE dans Application.php: " . $e->getMessage() . "\n";
} catch (Error $e) {
    echo "ERREUR dans Application.php: " . $e->getMessage() . "\n";
}

// Test de chargement des contrôleurs
try {
    require_once 'src/Controllers/QuizProgressControllerSimple.php';
    echo "QuizProgressControllerSimple.php chargé avec succès\n";
} catch (ParseError $e) {
    echo "ERREUR DE SYNTAXE dans QuizProgressControllerSimple.php: " . $e->getMessage() . "\n";
} catch (Error $e) {
    echo "ERREUR dans QuizProgressControllerSimple.php: " . $e->getMessage() . "\n";
}

try {
    require_once 'src/Controllers/ExerciseProgressControllerSimple.php';
    echo "ExerciseProgressControllerSimple.php chargé avec succès\n";
} catch (ParseError $e) {
    echo "ERREUR DE SYNTAXE dans ExerciseProgressControllerSimple.php: " . $e->getMessage() . "\n";
} catch (Error $e) {
    echo "ERREUR dans ExerciseProgressControllerSimple.php: " . $e->getMessage() . "\n";
}

echo "Test terminé\n";
?>
