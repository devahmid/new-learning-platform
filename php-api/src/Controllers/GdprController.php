<?php

namespace App\Controllers;

use App\Services\GdprConsentServiceSimple;
use App\Utils\Response;
use App\Utils\JWT;
use App\Utils\Validator;

/**
 * Contrôleur GDPR - Gestion des consentements et conformité RGPD
 */
class GdprController {
    
    /**
     * Sauvegarder le consentement d'un utilisateur
     * POST /api/gdpr/consent
     */
    public function saveConsent() {
        try {
            // Récupérer la connexion à la base de données
            $db = \DatabaseConfig::getInstance()->getConnection();
            $gdprService = new \App\Services\GdprConsentServiceSimple($db);
            
            // Récupérer les données de la requête
            $input = json_decode(file_get_contents('php://input'), true);
            
            // Validation des données requises
            $validator = new Validator($input, [
                'userId' => 'required|integer',
                'analytics' => 'required|boolean',
                'functional' => 'required|boolean',
                'marketing' => 'required|boolean',
                'essential' => 'boolean'
            ]);
            $errors = $validator->validate();
            
            if (!empty($errors)) {
                Response::badRequest('Données invalides', $errors);
                return;
            }
            
            // Préparer les données de consentement
            $consentData = [
                'analytics' => $input['analytics'],
                'functional' => $input['functional'], 
                'marketing' => $input['marketing'],
                'essential' => $input['essential'] ?? true
            ];
            
            // Sauvegarder via le service
            $result = $gdprService->saveUserConsent(
                $input['userId'],
                $consentData,
                $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1',
                $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown',
                'user_consent_update'
            );

            if ($result['success']) {
                Response::json([
                    'success' => true,
                    'message' => 'Consentement sauvegardé avec succès',
                    'data' => $result['data']
                ], 200);
            } else {
                Response::error($result['message'], 500);
            }

        } catch (Exception $e) {
            error_log("Erreur saveConsent: " . $e->getMessage());
            Response::error('Erreur lors de la sauvegarde du consentement', 500);
        }
    }

    /**
     * Récupérer le consentement d'un utilisateur
     * GET /api/gdpr/consent/{userId}
     */
    public function getConsent($userId) {
        try {
            // Récupérer la connexion à la base de données
            $db = \DatabaseConfig::getInstance()->getConnection();
            $gdprService = new \App\Services\GdprConsentServiceSimple($db);
            
            // Vérifier que l'utilisateur peut accéder à ces données
            $currentUser = JWT::requireAuth();            // Seul l'utilisateur lui-même ou un admin peut consulter les consentements
            if ($currentUser['id'] != $userId && $currentUser['role'] !== 'admin') {
                Response::forbidden('Accès non autorisé');
                return;
            }
            
            $result = $gdprService->getUserConsent($userId);

            if ($result['success']) {
                Response::json([
                    'success' => true,
                    'data' => $result['data']
                ], 200);
            } else {
                Response::notFound($result['message']);
            }

        } catch (Exception $e) {
            error_log("Erreur getConsent: " . $e->getMessage());
            Response::error('Erreur lors de la récupération du consentement', 500);
        }
    }

    /**
     * Mettre à jour le consentement d'un utilisateur
     * PUT /api/gdpr/consent/{userId}
     */
    public function updateConsent($userId) {
        try {
            // Récupérer la connexion à la base de données
            $db = \DatabaseConfig::getInstance()->getConnection();
            $gdprService = new \App\Services\GdprConsentServiceSimple($db);
            
            // Vérifier l'authentification
            $currentUser = JWT::requireAuth();            // Seul l'utilisateur lui-même peut modifier ses consentements
            if ($currentUser['id'] != $userId) {
                Response::forbidden('Vous ne pouvez modifier que vos propres consentements');
                return;
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            
            // Validation
            $validator = new Validator();
            $errors = $validator->validate($input, [
                'analytics' => 'boolean',
                'functional' => 'boolean',
                'marketing' => 'boolean'
            ]);
            
            if (!empty($errors)) {
                Response::badRequest('Données invalides', $errors);
                return;
            }
            
            $result = $gdprService->updateUserConsent($userId, $input);

            if ($result['success']) {
                Response::json([
                    'success' => true,
                    'message' => 'Consentement mis à jour avec succès',
                    'data' => $result['data']
                ], 200);
            } else {
                Response::error($result['message'], 500);
            }

        } catch (Exception $e) {
            error_log("Erreur updateConsent: " . $e->getMessage());
            Response::error('Erreur lors de la mise à jour du consentement', 500);
        }
    }

    /**
     * Supprimer le consentement d'un utilisateur (retrait du consentement)
     * DELETE /api/gdpr/consent/{userId}
     */
    public function deleteConsent($userId) {
        try {
            // Récupérer la connexion à la base de données
            $db = \DatabaseConfig::getInstance()->getConnection();
            $gdprService = new \App\Services\GdprConsentServiceSimple($db);
            
            // Vérifier l'authentification
            $currentUser = JWT::requireAuth();            // Seul l'utilisateur lui-même peut supprimer ses consentements
            if ($currentUser['id'] != $userId) {
                Response::forbidden('Vous ne pouvez supprimer que vos propres consentements');
                return;
            }
            
            $result = $gdprService->deleteUserConsent($userId);

            if ($result['success']) {
                Response::json([
                    'success' => true,
                    'message' => 'Consentement supprimé avec succès'
                ], 200);
            } else {
                Response::error($result['message'], 500);
            }

        } catch (Exception $e) {
            error_log("Erreur deleteConsent: " . $e->getMessage());
            Response::error('Erreur lors de la suppression du consentement', 500);
        }
    }

    /**
     * Récupérer l'historique des consentements d'un utilisateur
     * GET /api/gdpr/history/{userId}
     */
    public function getConsentHistory($userId) {
        try {
            // Récupérer la connexion à la base de données
            $db = \DatabaseConfig::getInstance()->getConnection();
            $gdprService = new \App\Services\GdprConsentServiceSimple($db);
            
            // Vérifier l'authentification
            $currentUser = JWT::requireAuth();            // Seul l'utilisateur lui-même ou un admin peut consulter l'historique
            if ($currentUser['id'] != $userId && $currentUser['role'] !== 'admin') {
                Response::forbidden('Accès non autorisé');
                return;
            }
            
            $result = $this->gdprService->getConsentHistory($userId);
            
            if ($result['success']) {
                Response::json([
                    'success' => true,
                    'data' => $result['data']
                ], 200);
            } else {
                Response::error($result['message'], 500);
            }
            
        } catch (Exception $e) {
            error_log("Erreur getConsentHistory: " . $e->getMessage());
            Response::error('Erreur lors de la récupération de l\'historique', 500);
        }
    }
    
    /**
     * Envoyer une notification GDPR à un utilisateur
     * POST /api/gdpr/notification
     */
    public function sendNotification() {
        try {
            // Vérifier l'authentification admin
            $currentUser = JWT::requireRole(['admin']);
            
            $input = json_decode(file_get_contents('php://input'), true);
            
            // Validation
            $validator = new Validator();
            $errors = $validator->validate($input, [
                'userId' => 'required|integer',
                'type' => 'required|string',
                'message' => 'required|string'
            ]);
            
            if (!empty($errors)) {
                Response::badRequest('Données invalides', $errors);
                return;
            }
            
            $result = $this->gdprService->sendGdprNotification(
                $input['userId'],
                $input['type'],
                $input['message']
            );
            
            if ($result['success']) {
                Response::json([
                    'success' => true,
                    'message' => 'Notification envoyée avec succès'
                ], 200);
            } else {
                Response::error($result['message'], 500);
            }
            
        } catch (Exception $e) {
            error_log("Erreur sendNotification: " . $e->getMessage());
            Response::error('Erreur lors de l\'envoi de la notification', 500);
        }
    }
    
    /**
     * Récupérer tous les consentements (admin)
     * GET /api/admin/gdpr/consents
     */
    public function getAllConsents() {
        try {
            // Vérifier l'authentification admin
            $currentUser = JWT::requireRole(['admin']);
            
            $result = $this->gdprService->getAllConsents();
            
            if ($result['success']) {
                Response::json([
                    'success' => true,
                    'data' => $result['data']
                ], 200);
            } else {
                Response::error($result['message'], 500);
            }
            
        } catch (Exception $e) {
            error_log("Erreur getAllConsents: " . $e->getMessage());
            Response::error('Erreur lors de la récupération des consentements', 500);
        }
    }
    
    /**
     * Récupérer les statistiques de conformité RGPD
     * GET /api/gdpr/compliance-stats
     */
    public function getComplianceStats() {
        try {
            // Récupérer la connexion à la base de données
            $db = \DatabaseConfig::getInstance()->getConnection();
            $gdprService = new \App\Services\GdprConsentServiceSimple($db);
            
            // Statistiques générales
            $totalUsers = $this->getTotalUsers($db);
            $totalConsents = $this->getTotalConsents($db);
            $activeConsents = $this->getActiveConsents($db);
            $consentRate = $totalUsers > 0 ? round(($activeConsents / $totalUsers) * 100, 2) : 0;
            
            // Répartition par type de consentement
            $consentBreakdown = $this->getConsentBreakdown($db);
            
            // Utilisateurs non conformes
            $nonCompliantUsers = $this->getNonCompliantUsersPrivate($db);
            
            Response::json([
                'success' => true,
                'data' => [
                    'overview' => [
                        'total_users' => $totalUsers,
                        'total_consents' => $totalConsents,
                        'active_consents' => $activeConsents,
                        'consent_rate' => $consentRate
                    ],
                    'consent_breakdown' => $consentBreakdown,
                    'non_compliant_users' => $nonCompliantUsers,
                    'last_updated' => date('Y-m-d H:i:s')
                ]
            ], 200);
            
        } catch (Exception $e) {
            error_log("Erreur getComplianceStats: " . $e->getMessage());
            Response::error('Erreur lors de la récupération des statistiques', 500);
        }
    }
    
    /**
     * Récupérer le nombre total d'utilisateurs
     */
    private function getTotalUsers($db) {
        $stmt = $db->prepare("SELECT COUNT(*) as total FROM users");
        $stmt->execute();
        $result = $stmt->fetch();
        return (int)$result['total'];
    }
    
    /**
     * Récupérer le nombre total de consentements
     */
    private function getTotalConsents($db) {
        $stmt = $db->prepare("SELECT COUNT(*) as total FROM user_gdpr_consents");
        $stmt->execute();
        $result = $stmt->fetch();
        return (int)$result['total'];
    }
    
    /**
     * Récupérer le nombre de consentements actifs
     */
    private function getActiveConsents($db) {
        $stmt = $db->prepare("SELECT COUNT(*) as total FROM user_gdpr_consents WHERE is_active = 1");
        $stmt->execute();
        $result = $stmt->fetch();
        return (int)$result['total'];
    }
    
    /**
     * Récupérer la répartition par type de consentement
     */
    private function getConsentBreakdown($db) {
        $stmt = $db->prepare("
            SELECT 
                SUM(analytics_consent) as analytics,
                SUM(functional_consent) as functional,
                SUM(marketing_consent) as marketing,
                SUM(essential_consent) as essential
            FROM user_gdpr_consents 
            WHERE is_active = 1
        ");
        $stmt->execute();
        $result = $stmt->fetch();
        
        return [
            'analytics' => (int)$result['analytics'],
            'functional' => (int)$result['functional'],
            'marketing' => (int)$result['marketing'],
            'essential' => (int)$result['essential']
        ];
    }
    
    /**
     * Récupérer les utilisateurs non conformes (endpoint public)
     * GET /api/gdpr/non-compliant-users
     */
    public function getNonCompliantUsers() {
        try {
            // Récupérer la connexion à la base de données
            $db = \DatabaseConfig::getInstance()->getConnection();
            
            // Récupérer les paramètres de pagination
            $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
            $limit = isset($_GET['limit']) ? min(100, max(1, (int)$_GET['limit'])) : 50;
            $offset = ($page - 1) * $limit;
            
            // Compter le total
            $countStmt = $db->prepare("
                SELECT COUNT(*) as total
                FROM users u
                LEFT JOIN user_gdpr_consents c ON u.id = c.user_id AND c.is_active = 1
                WHERE c.id IS NULL
            ");
            $countStmt->execute();
            $total = (int)$countStmt->fetch()['total'];
            
            // Récupérer les utilisateurs non conformes avec les données disponibles
            $stmt = $db->prepare("
                SELECT 
                    u.id, 
                    u.email, 
                    u.firstName, 
                    u.lastName, 
                    u.createdAt,
                    u.phoneNumber,
                    u.type,
                    u.role,
                    -- Calculer le niveau de risque basé sur l'ancienneté
                    CASE 
                        WHEN DATEDIFF(NOW(), u.createdAt) > 30 THEN 'high'
                        WHEN DATEDIFF(NOW(), u.createdAt) > 7 THEN 'medium'
                        ELSE 'low'
                    END as riskLevel,
                    -- Compter les notifications envoyées (si la table existe)
                    COALESCE(notif_count.count, 0) as notificationsSent,
                    -- Données par défaut pour les champs manquants
                    NULL as lastLogin,
                    'pending' as status
                FROM users u
                LEFT JOIN user_gdpr_consents c ON u.id = c.user_id AND c.is_active = 1
                LEFT JOIN (
                    SELECT user_id, COUNT(*) as count 
                    FROM user_gdpr_notifications 
                    GROUP BY user_id
                ) notif_count ON u.id = notif_count.user_id
                WHERE c.id IS NULL
                ORDER BY u.createdAt DESC
                LIMIT ? OFFSET ?
            ");
            $stmt->execute([$limit, $offset]);
            $users = $stmt->fetchAll();
            
            Response::json([
                'success' => true,
                'data' => [
                    'users' => $users,
                    'pagination' => [
                        'page' => $page,
                        'limit' => $limit,
                        'total' => $total,
                        'total_pages' => ceil($total / $limit)
                    ]
                ]
            ], 200);
            
        } catch (Exception $e) {
            error_log("Erreur getNonCompliantUsers: " . $e->getMessage());
            Response::error('Erreur lors de la récupération des utilisateurs non conformes', 500);
        }
    }
    
    /**
     * Récupérer TOUS les utilisateurs avec leur statut RGPD
     * GET /api/gdpr/all-users
     */
    public function getAllUsers() {
        try {
            // Récupérer la connexion à la base de données
            $db = \DatabaseConfig::getInstance()->getConnection();
            
            // Récupérer les paramètres de pagination
            $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
            $limit = isset($_GET['limit']) ? min(100, max(1, (int)$_GET['limit'])) : 50;
            $offset = ($page - 1) * $limit;
            
            // Compter le total
            $countStmt = $db->prepare("SELECT COUNT(*) as total FROM users");
            $countStmt->execute();
            $total = (int)$countStmt->fetch()['total'];
            
            // Récupérer TOUS les utilisateurs avec leur statut RGPD
            $stmt = $db->prepare("
                SELECT 
                    u.id, 
                    u.email, 
                    u.firstName, 
                    u.lastName, 
                    u.createdAt,
                    u.phoneNumber,
                    u.type,
                    u.role,
                    -- Calculer le niveau de risque basé sur l'ancienneté
                    CASE 
                        WHEN DATEDIFF(NOW(), u.createdAt) > 30 THEN 'high'
                        WHEN DATEDIFF(NOW(), u.createdAt) > 7 THEN 'medium'
                        ELSE 'low'
                    END as riskLevel,
                    -- Vérifier si l'utilisateur a un consentement actif
                    CASE 
                        WHEN c.id IS NOT NULL THEN 'compliant'
                        ELSE 'non-compliant'
                    END as gdprStatus,
                    -- Compter les notifications envoyées
                    COALESCE(notif_count.count, 0) as notificationsSent,
                    -- Données par défaut
                    NULL as lastLogin,
                    'active' as status,
                    c.consent_timestamp as lastConsentDate,
                    c.analytics_consent,
                    c.functional_consent,
                    c.marketing_consent,
                    c.essential_consent
                FROM users u
                LEFT JOIN user_gdpr_consents c ON u.id = c.user_id AND c.is_active = 1
                LEFT JOIN (
                    SELECT user_id, COUNT(*) as count 
                    FROM user_gdpr_notifications 
                    GROUP BY user_id
                ) notif_count ON u.id = notif_count.user_id
                ORDER BY u.createdAt DESC
                LIMIT ? OFFSET ?
            ");
            $stmt->execute([$limit, $offset]);
            $users = $stmt->fetchAll();
            
            Response::json([
                'success' => true,
                'data' => [
                    'users' => $users,
                    'pagination' => [
                        'page' => $page,
                        'limit' => $limit,
                        'total' => $total,
                        'total_pages' => ceil($total / $limit)
                    ]
                ]
            ], 200);
            
        } catch (Exception $e) {
            error_log("Erreur getAllUsers: " . $e->getMessage());
            Response::error('Erreur lors de la récupération des utilisateurs', 500);
        }
    }
    
    /**
     * Récupérer les utilisateurs non conformes (méthode privée pour les stats)
     */
    private function getNonCompliantUsersPrivate($db) {
        $stmt = $db->prepare("
            SELECT u.id, u.email, u.firstName, u.lastName, u.createdAt
            FROM users u
            LEFT JOIN user_gdpr_consents c ON u.id = c.user_id AND c.is_active = 1
            WHERE c.id IS NULL
            ORDER BY u.createdAt DESC
            LIMIT 50
        ");
        $stmt->execute();
        return $stmt->fetchAll();
    }
}