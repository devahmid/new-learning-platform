<?php
/**
 * Vérification déploiement feedback — ouvrir dans le navigateur :
 * https://centre-culturel-olivier.fr/api/check_feedback_deploy.php
 */

header('Content-Type: application/json; charset=UTF-8');

$checks = [];

// 1. Fichiers requis
$requiredFiles = [
    'src/Core/Application.php',
    'src/Controllers/FeedbackController.php',
    'src/Models/Feedback.php',
];

foreach ($requiredFiles as $file) {
    $path = __DIR__ . '/' . $file;
    $checks['files'][$file] = file_exists($path);
}

// 2. Route enregistrée dans Application.php
$applicationPath = __DIR__ . '/src/Core/Application.php';
$applicationContent = file_exists($applicationPath) ? file_get_contents($applicationPath) : '';
$checks['route_post_feedback'] = str_contains($applicationContent, "'/api/feedback'");
$checks['route_get_admin_feedback'] = str_contains($applicationContent, "'/api/admin/feedback'");

// 3. Table en base
$tableOk = false;
$tableError = null;
try {
    require_once __DIR__ . '/config/database.php';
    $db = DatabaseConfig::getInstance()->getConnection();
    $stmt = $db->query("SHOW TABLES LIKE 'feedback'");
    $tableOk = (bool) $stmt->fetch();
} catch (Throwable $e) {
    $tableError = $e->getMessage();
}
$checks['table_feedback'] = $tableOk;
if ($tableError) {
    $checks['table_feedback_error'] = $tableError;
}

// 4. Test autoloader controller
$controllerOk = false;
try {
    require_once __DIR__ . '/config/autoloader.php';
    $controllerOk = class_exists('App\\Controllers\\FeedbackController');
} catch (Throwable $e) {
    $checks['controller_error'] = $e->getMessage();
}
$checks['controller_class'] = $controllerOk;

$allOk =
    ($checks['files']['src/Core/Application.php'] ?? false) &&
    ($checks['files']['src/Controllers/FeedbackController.php'] ?? false) &&
    ($checks['files']['src/Models/Feedback.php'] ?? false) &&
    ($checks['route_post_feedback'] ?? false) &&
    ($checks['route_get_admin_feedback'] ?? false) &&
    ($checks['table_feedback'] ?? false) &&
    ($checks['controller_class'] ?? false);

echo json_encode([
    'ok' => $allOk,
    'message' => $allOk
        ? 'Feedback prêt : vous pouvez utiliser POST /api/feedback'
        : 'Déploiement incomplet — voir checks',
    'checks' => $checks,
    'how_other_routes_work' => 'Toutes les routes (/api/health, /api/reinscriptions, /api/feedback) passent par index.php → Application.php. Si feedback=404, Application.php sur le serveur est ancien.',
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
