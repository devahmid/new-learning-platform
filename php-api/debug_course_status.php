<?php
/**
 * Script de debug simple pour vérifier le statut des cours
 * À exécuter directement sur le serveur web
 */

header('Content-Type: text/plain; charset=utf-8');

echo "=== DEBUG COURSE STATUS ===\n\n";

try {
    require_once __DIR__ . '/config/database.php';
    
    $db = DatabaseConfig::getInstance()->getConnection();
    
    // 1. Vérifier si la colonne status existe
    echo "1. Vérification de la colonne status:\n";
    $stmt = $db->query("SHOW COLUMNS FROM courses LIKE 'status'");
    $statusColumn = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($statusColumn) {
        echo "✅ Colonne status existe: {$statusColumn['Type']}\n";
        echo "   Défaut: {$statusColumn['Default']}\n\n";
    } else {
        echo "❌ Colonne status n'existe PAS!\n";
        echo "🔧 Exécutez cette requête SQL:\n";
        echo "ALTER TABLE courses ADD COLUMN status ENUM('draft', 'published', 'archived') DEFAULT 'draft' AFTER isActive;\n\n";
        exit;
    }
    
    // 2. Compter les cours par statut
    echo "2. Répartition des cours par statut:\n";
    $stmt = $db->query("SELECT status, COUNT(*) as count FROM courses GROUP BY status");
    $stats = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($stats)) {
        echo "❌ Aucun cours trouvé!\n\n";
    } else {
        foreach ($stats as $stat) {
            echo "   {$stat['status']}: {$stat['count']} cours\n";
        }
        echo "\n";
    }
    
    // 3. Afficher les 5 premiers cours avec tous les détails
    echo "3. Détails des premiers cours:\n";
    $stmt = $db->query("SELECT id, title, status, isActive, createdAt FROM courses ORDER BY id LIMIT 5");
    $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($courses)) {
        echo "❌ Aucun cours trouvé!\n\n";
    } else {
        foreach ($courses as $course) {
            echo "   ID {$course['id']}: {$course['title']}\n";
            echo "     Status: {$course['status']} | Active: {$course['isActive']} | Créé: {$course['createdAt']}\n\n";
        }
    }
    
    // 4. Test direct de l'API
    echo "4. Test de l'API CourseController:\n";
    
    require_once __DIR__ . '/src/Controllers/CourseController.php';
    require_once __DIR__ . '/config/cors.php';
    
    // Capturer la sortie de l'API
    ob_start();
    $controller = new App\Controllers\CourseController();
    $controller->findAll();
    $apiOutput = ob_get_clean();
    
    $response = json_decode($apiOutput, true);
    
    if ($response && isset($response['success']) && $response['success']) {
        echo "✅ API fonctionne\n";
        if (!empty($response['data'])) {
            $firstCourse = $response['data'][0];
            echo "   Premier cours API:\n";
            echo "     ID: {$firstCourse['id']}\n";
            echo "     Titre: {$firstCourse['title']}\n";
            echo "     Status: " . (isset($firstCourse['status']) ? $firstCourse['status'] : 'MANQUANT!') . "\n";
            echo "     IsActive: " . (isset($firstCourse['isActive']) ? $firstCourse['isActive'] : 'MANQUANT!') . "\n";
        } else {
            echo "❌ Aucune donnée dans l'API\n";
        }
    } else {
        echo "❌ Erreur API:\n";
        echo $apiOutput . "\n";
    }
    
    echo "\n=== FIN DEBUG ===\n";
    
} catch (Exception $e) {
    echo "❌ ERREUR: " . $e->getMessage() . "\n";
    echo "Stack: " . $e->getTraceAsString() . "\n";
}
?>
