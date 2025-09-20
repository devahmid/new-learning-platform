<?php
/**
 * Script pour modifier le statut d'un cours spécifique
 * Usage: GET ?course_id=1&status=draft
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$result = [
    'timestamp' => date('Y-m-d H:i:s'),
    'action' => 'update_course_status'
];

try {
    $courseId = $_GET['course_id'] ?? null;
    $newStatus = $_GET['status'] ?? null;
    
    if (!$courseId || !$newStatus) {
        throw new Exception('Paramètres manquants: course_id et status requis');
    }
    
    if (!in_array($newStatus, ['draft', 'published', 'archived'])) {
        throw new Exception('Status invalide. Doit être: draft, published ou archived');
    }
    
    require_once __DIR__ . '/config/database.php';
    $db = DatabaseConfig::getInstance()->getConnection();
    
    // Vérifier que le cours existe
    $stmt = $db->prepare("SELECT id, title, status FROM courses WHERE id = ?");
    $stmt->execute([$courseId]);
    $course = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$course) {
        throw new Exception("Cours ID $courseId non trouvé");
    }
    
    $result['before'] = $course;
    
    // Mettre à jour le statut
    $stmt = $db->prepare("UPDATE courses SET status = ? WHERE id = ?");
    $stmt->execute([$newStatus, $courseId]);
    
    // Vérifier la mise à jour
    $stmt = $db->prepare("SELECT id, title, status FROM courses WHERE id = ?");
    $stmt->execute([$courseId]);
    $updatedCourse = $stmt->fetch(PDO::FETCH_ASSOC);
    
    $result['after'] = $updatedCourse;
    $result['success'] = true;
    $result['message'] = "Cours '{$course['title']}' mis à jour de '{$course['status']}' vers '{$newStatus}'";
    
} catch (Exception $e) {
    $result['success'] = false;
    $result['error'] = $e->getMessage();
}

echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
?>
