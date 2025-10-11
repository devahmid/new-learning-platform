<?php
/**
 * API Endpoints pour la gestion RGPD
 * 
 * Routes: /api/gdpr/*
 */

require_once __DIR__ . '/../services/GdprConsentServiceSimple.php';
require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Gérer les requêtes OPTIONS (CORS preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Initialiser le service RGPD
$gdprService = new \App\Services\GdprConsentServiceSimple($db);

// Router simple
$requestUri = $_SERVER['REQUEST_URI'];
$method = $_SERVER['REQUEST_METHOD'];

// Extraire le chemin après /api/gdpr/
$basePath = '/api/gdpr/';
$path = str_replace($basePath, '', parse_url($requestUri, PHP_URL_PATH));

// Utilitaires
function getJsonInput() {
    return json_decode(file_get_contents('php://input'), true);
}

function getClientIp() {
    $ipKeys = ['HTTP_X_FORWARDED_FOR', 'HTTP_X_REAL_IP', 'REMOTE_ADDR'];
    foreach ($ipKeys as $key) {
        if (!empty($_SERVER[$key])) {
            $ip = $_SERVER[$key];
            if (strpos($ip, ',') !== false) {
                $ip = trim(explode(',', $ip)[0]);
            }
            return $ip;
        }
    }
    return '127.0.0.1';
}

function getUserAgent() {
    return $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';
}

function sendResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit();
}

try {
    switch ($method) {
        case 'POST':
            if ($path === 'test') {
                // POST /api/gdpr/test - Endpoint de test pour le développement
                $input = getJsonInput();
                
                sendResponse([
                    'success' => true,
                    'message' => 'Endpoint de test RGPD fonctionnel',
                    'data' => [
                        'received' => $input,
                        'timestamp' => date('Y-m-d H:i:s'),
                        'status' => 'test_successful'
                    ]
                ]);
                
            } elseif ($path === 'consent') {
                // POST /api/gdpr/consent - Enregistrer le consentement
                $input = getJsonInput();
                
                if (!isset($input['userId']) || !isset($input['consents'])) {
                    sendResponse([
                        'success' => false,
                        'message' => 'userId et consents sont requis'
                    ], 400);
                }
                
                $result = $gdprService->saveUserConsent(
                    $input['userId'],
                    $input['consents'],
                    getClientIp(),
                    getUserAgent(),
                    $input['reason'] ?? 'user_consent_update'
                );
                
                sendResponse($result, $result['success'] ? 201 : 400);
                
            } elseif ($path === 'notification') {
                // POST /api/gdpr/notification - Enregistrer notification envoyée
                $input = getJsonInput();
                
                if (!isset($input['userId']) || !isset($input['notificationType'])) {
                    sendResponse([
                        'success' => false,
                        'message' => 'userId et notificationType sont requis'
                    ], 400);
                }
                
                $result = $gdprService->recordNotificationSent(
                    $input['userId'],
                    $input['notificationType'],
                    $input['emailSubject'] ?? "Notification RGPD - {$input['notificationType']}",
                    $input['templateVersion'] ?? '1.0'
                );
                
                sendResponse($result, $result['success'] ? 201 : 400);
                
            } elseif ($path === 'send-bulk-notifications') {
                // POST /api/gdpr/send-bulk-notifications - Envoi en masse
                $input = getJsonInput();
                
                if (!isset($input['notificationType'])) {
                    sendResponse([
                        'success' => false,
                        'message' => 'notificationType est requis'
                    ], 400);
                }
                
                // Récupérer les utilisateurs non conformes
                $usersResult = $gdprService->getNonCompliantUsers(1, 1000); // Max 1000 par batch
                
                if (!$usersResult['success']) {
                    sendResponse($usersResult, 500);
                }
                
                $users = $usersResult['data']['users'];
                $results = [
                    'total' => count($users),
                    'sent' => 0,
                    'failed' => 0,
                    'errors' => []
                ];
                
                foreach ($users as $user) {
                    $notifResult = $gdprService->recordNotificationSent(
                        $user['id'],
                        $input['notificationType'],
                        "Notification RGPD - {$input['notificationType']}",
                        '1.0'
                    );
                    
                    if ($notifResult['success']) {
                        $results['sent']++;
                        
                        // TODO: Ici vous pouvez ajouter l'envoi réel d'email
                        // $emailService->sendGdprNotification($user, $input['notificationType']);
                    } else {
                        $results['failed']++;
                        $results['errors'][] = [
                            'user_id' => $user['id'],
                            'email' => $user['email'],
                            'error' => 'Erreur enregistrement notification'
                        ];
                    }
                }
                
                sendResponse([
                    'success' => true,
                    'message' => "Notifications {$input['notificationType']} traitées",
                    'data' => $results
                ]);
                
            } else {
                sendResponse(['success' => false, 'message' => 'Endpoint POST non trouvé'], 404);
            }
            break;

        case 'GET':
            if (preg_match('/^consent\/(\d+)$/', $path, $matches)) {
                // GET /api/gdpr/consent/{userId} - Récupérer consentement utilisateur
                $userId = (int)$matches[1];
                $result = $gdprService->getUserConsent($userId);
                sendResponse($result);
                
            } elseif (preg_match('/^compliance\/(\d+)$/', $path, $matches)) {
                // GET /api/gdpr/compliance/{userId} - Vérifier conformité
                $userId = (int)$matches[1];
                $result = $gdprService->isUserCompliant($userId);
                sendResponse($result);
                
            } elseif ($path === 'compliance-stats') {
                // GET /api/gdpr/compliance-stats - Statistiques conformité
                $result = $gdprService->getComplianceStats();
                sendResponse($result);
                
            } elseif ($path === 'non-compliant-users') {
                // GET /api/gdpr/non-compliant-users - Liste utilisateurs non conformes
                $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
                $limit = isset($_GET['limit']) ? min(100, max(10, (int)$_GET['limit'])) : 50;
                
                $result = $gdprService->getNonCompliantUsers($page, $limit);
                sendResponse($result);
                
            } elseif (preg_match('/^export\/(\d+)$/', $path, $matches)) {
                // GET /api/gdpr/export/{userId} - Export données RGPD
                $userId = (int)$matches[1];
                $result = $gdprService->exportUserGdprData($userId);
                sendResponse($result);
                
            } elseif ($path === 'health') {
                // GET /api/gdpr/health - Santé du système
                $stats = $gdprService->getComplianceStats();
                
                $health = [
                    'status' => 'healthy',
                    'timestamp' => date('Y-m-d H:i:s'),
                    'compliance' => [
                        'total_users' => $stats['data']['total_users'],
                        'compliance_rate' => $stats['data']['compliance_rate'],
                        'status' => $stats['data']['compliance_rate'] > 80 ? 'good' : 'warning'
                    ],
                    'system' => [
                        'database' => 'connected',
                        'gdpr_compliance' => 'active',
                        'version' => '1.0'
                    ]
                ];
                
                sendResponse(['success' => true, 'data' => $health]);
                
            } else {
                sendResponse(['success' => false, 'message' => 'Endpoint GET non trouvé'], 404);
            }
            break;

        case 'DELETE':
            if (preg_match('/^consent\/(\d+)$/', $path, $matches)) {
                // DELETE /api/gdpr/consent/{userId} - Révoquer consentement
                $userId = (int)$matches[1];
                $input = getJsonInput();
                $reason = $input['reason'] ?? 'user_request';
                
                // Pour l'instant, on ne supprime pas vraiment, on désactive
                $stmt = $db->prepare("
                    UPDATE user_gdpr_consents 
                    SET is_active = FALSE, revoked_at = NOW(), updated_at = NOW()
                    WHERE user_id = ? AND is_active = TRUE
                ");
                $stmt->bind_param("i", $userId);
                
                if ($stmt->execute()) {
                    sendResponse([
                        'success' => true,
                        'message' => 'Consentement RGPD révoqué avec succès',
                        'data' => [
                            'user_id' => $userId,
                            'revoked_at' => date('Y-m-d H:i:s'),
                            'reason' => $reason
                        ]
                    ]);
                } else {
                    sendResponse([
                        'success' => false,
                        'message' => 'Erreur lors de la révocation du consentement'
                    ], 500);
                }
                
            } elseif (preg_match('/^user-data\/(\d+)$/', $path, $matches)) {
                // DELETE /api/gdpr/user-data/{userId} - Droit à l'oubli
                $userId = (int)$matches[1];
                $input = getJsonInput();
                $reason = $input['reason'] ?? 'user_erasure_request';
                
                // Anonymiser les données plutôt que les supprimer
                $db->begin_transaction();
                
                try {
                    // Anonymiser les consentements
                    $stmt1 = $db->prepare("
                        UPDATE user_gdpr_consents 
                        SET user_id = 0, ip_address = '0.0.0.0', user_agent = 'ANONYMIZED'
                        WHERE user_id = ?
                    ");
                    $stmt1->bind_param("i", $userId);
                    $stmt1->execute();
                    
                    // Anonymiser l'historique
                    $stmt2 = $db->prepare("
                        UPDATE user_gdpr_consent_history 
                        SET user_id = 0, ip_address = '0.0.0.0', user_agent = 'ANONYMIZED'
                        WHERE user_id = ?
                    ");
                    $stmt2->bind_param("i", $userId);
                    $stmt2->execute();
                    
                    // Anonymiser les notifications
                    $stmt3 = $db->prepare("
                        UPDATE user_gdpr_notifications 
                        SET user_id = 0
                        WHERE user_id = ?
                    ");
                    $stmt3->bind_param("i", $userId);
                    $stmt3->execute();
                    
                    $db->commit();
                    
                    sendResponse([
                        'success' => true,
                        'message' => 'Données RGPD supprimées (anonymisées)',
                        'data' => [
                            'user_id' => $userId,
                            'deleted_at' => date('Y-m-d H:i:s'),
                            'reason' => $reason
                        ]
                    ]);
                    
                } catch (Exception $e) {
                    $db->rollback();
                    sendResponse([
                        'success' => false,
                        'message' => 'Erreur lors de la suppression des données'
                    ], 500);
                }
                
            } else {
                sendResponse(['success' => false, 'message' => 'Endpoint DELETE non trouvé'], 404);
            }
            break;

        default:
            sendResponse(['success' => false, 'message' => 'Méthode non autorisée'], 405);
            break;
    }

} catch (Exception $e) {
    error_log("Erreur API RGPD: " . $e->getMessage());
    sendResponse([
        'success' => false,
        'message' => 'Erreur interne du serveur'
    ], 500);
}
?>