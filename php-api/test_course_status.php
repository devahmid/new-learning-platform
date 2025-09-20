<?php
/**
 * Script de test pour vérifier le champ status des cours
 */

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/src/Controllers/CourseController.php';

use App\Controllers\CourseController;

try {
    echo "🔍 Test du champ status dans les cours...\n\n";
    
    // 1. Vérifier la structure de la table
    echo "1️⃣ Vérification de la structure de la table courses:\n";
    $db = DatabaseConfig::getInstance()->getConnection();
    
    $stmt = $db->query("DESCRIBE courses");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $statusFound = false;
    foreach ($columns as $column) {
        if ($column['Field'] === 'status') {
            $statusFound = true;
            echo "✅ Colonne status trouvée: {$column['Type']}, défaut: {$column['Default']}\n";
            break;
        }
    }
    
    if (!$statusFound) {
        echo "❌ Colonne status non trouvée! Exécutez d'abord la migration.\n";
        exit(1);
    }
    
    // 2. Vérifier les données actuelles
    echo "\n2️⃣ Vérification des données actuelles:\n";
    $stmt = $db->query("SELECT id, title, status, isActive FROM courses LIMIT 5");
    $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($courses)) {
        echo "⚠️ Aucun cours trouvé dans la base de données.\n";
    } else {
        foreach ($courses as $course) {
            echo "- ID {$course['id']}: {$course['title']} | Status: {$course['status']} | Active: {$course['isActive']}\n";
        }
    }
    
    // 3. Tester l'API
    echo "\n3️⃣ Test de l'API CourseController::findAll():\n";
    
    // Capturer la sortie de l'API
    ob_start();
    $controller = new CourseController();
    $controller->findAll();
    $apiOutput = ob_get_clean();
    
    // Décoder la réponse JSON
    $response = json_decode($apiOutput, true);
    
    if ($response && isset($response['success']) && $response['success']) {
        echo "✅ API répond avec succès\n";
        if (!empty($response['data'])) {
            $firstCourse = $response['data'][0];
            if (isset($firstCourse['status'])) {
                echo "✅ Champ status présent dans la réponse: {$firstCourse['status']}\n";
                echo "📋 Premier cours: {$firstCourse['title']} (Status: {$firstCourse['status']})\n";
            } else {
                echo "❌ Champ status manquant dans la réponse API\n";
                echo "📋 Champs disponibles: " . implode(', ', array_keys($firstCourse)) . "\n";
            }
        } else {
            echo "⚠️ Aucune donnée dans la réponse API\n";
        }
    } else {
        echo "❌ Erreur API ou réponse non valide\n";
        echo "📋 Réponse brute: " . $apiOutput . "\n";
    }
    
    // 4. Statistiques des statuts
    echo "\n4️⃣ Statistiques des statuts:\n";
    $stmt = $db->query("SELECT status, COUNT(*) as count FROM courses GROUP BY status");
    $stats = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($stats as $stat) {
        echo "- {$stat['status']}: {$stat['count']} cours\n";
    }
    
    echo "\n✅ Test terminé avec succès!\n";
    
} catch (Exception $e) {
    echo "❌ Erreur lors du test: " . $e->getMessage() . "\n";
    echo "📋 Stack trace: " . $e->getTraceAsString() . "\n";
    exit(1);
}
