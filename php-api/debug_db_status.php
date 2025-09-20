<?php
/**
 * Script de debug pour vérifier le statut des cours
 * À déployer et exécuter sur le serveur
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$result = [
    'timestamp' => date('Y-m-d H:i:s'),
    'debug' => []
];

try {
    // Test de connexion DB
    require_once __DIR__ . '/config/database.php';
    $db = DatabaseConfig::getInstance()->getConnection();
    $result['debug'][] = '✅ Connexion DB OK';
    
    // Vérifier la colonne status
    $stmt = $db->query("SHOW COLUMNS FROM courses LIKE 'status'");
    $statusColumn = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($statusColumn) {
        $result['debug'][] = '✅ Colonne status existe: ' . $statusColumn['Type'];
        $result['status_column'] = $statusColumn;
    } else {
        $result['debug'][] = '❌ Colonne status manquante!';
        $result['error'] = 'Colonne status non trouvée';
    }
    
    // Compter les cours par statut
    $stmt = $db->query("SELECT status, COUNT(*) as count FROM courses GROUP BY status");
    $stats = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $result['status_distribution'] = $stats;
    $result['debug'][] = '✅ Stats par statut récupérées: ' . count($stats) . ' groupes';
    
    // Premier cours avec détails
    $stmt = $db->query("SELECT id, title, status, isActive FROM courses LIMIT 1");
    $firstCourse = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($firstCourse) {
        $result['first_course'] = $firstCourse;
        $result['debug'][] = '✅ Premier cours: ' . $firstCourse['title'] . ' (status: ' . $firstCourse['status'] . ')';
    }
    
    $result['success'] = true;
    
} catch (Exception $e) {
    $result['success'] = false;
    $result['error'] = $e->getMessage();
    $result['debug'][] = '❌ Erreur: ' . $e->getMessage();
}

echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
?>
