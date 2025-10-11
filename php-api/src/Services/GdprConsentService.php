<?php

namespace App\Services;

/**
 * Service de gestion des consentements RGPD
 * 
 * Gère les consentements utilisateurs en base de données pour la conformité RGPD
 */
class GdprConsentService {
    private $db;
    
    public function __construct($database) {
        $this->db = $database;
    }

    /**
     * Enregistrer ou mettre à jour le consentement d'un utilisateur
     */
    public function saveUserConsent($userId, $consents, $ipAddress, $userAgent, $reason = 'user_action') {
        try {
            // Commencer une transaction
            $this->db->beginTransaction();
            
            // Désactiver l'ancien consentement s'il existe
            $stmt = $this->db->prepare("
                UPDATE user_gdpr_consents 
                SET is_active = 0, revoked_at = NOW(), updated_at = NOW()
                WHERE user_id = ? AND is_active = 1
            ");
            $stmt->execute([$userId]);
            
            // Créer le nouveau consentement
            $stmt = $this->db->prepare("
                INSERT INTO user_gdpr_consents (
                    user_id, analytics_consent, functional_consent, marketing_consent, 
                    essential_consent, consent_version, ip_address, user_agent, 
                    consent_timestamp, is_active, created_at, updated_at
                ) VALUES (?, ?, ?, ?, 1, '1.0', ?, ?, NOW(), 1, NOW(), NOW())
            ");
            
            $stmt->execute([
                $userId, 
                $consents['analytics'] ? 1 : 0,
                $consents['functional'] ? 1 : 0,
                $consents['marketing'] ? 1 : 0,
                $ipAddress,
                $userAgent
            ]);
            
            $consentId = $this->db->lastInsertId();
            
            // Enregistrer l'historique
            $this->saveConsentHistory($userId, 'granted', null, $consents, [
                'ip_address' => $ipAddress,
                'user_agent' => $userAgent,
                'reason' => $reason
            ]);
            
            // Valider la transaction
            $this->db->commit();
            
            return [
                'success' => true,
                'consent_id' => $consentId,
                'message' => 'Consentement RGPD enregistré avec succès'
            ];
            
        } catch (Exception $e) {
            $this->db->rollback();
            error_log("Erreur sauvegarde consentement: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Erreur lors de l\'enregistrement du consentement'
            ];
        }
    }

    /**
     * Récupérer le consentement actuel d'un utilisateur
     */
    public function getUserConsent($userId) {
        $stmt = $this->db->prepare("
            SELECT * FROM user_gdpr_consents 
            WHERE user_id = ? AND is_active = 1
            ORDER BY consent_timestamp DESC 
            LIMIT 1
        ");
        $stmt->execute([$userId]);
        $consent = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($consent) {
            // Vérifier la validité du consentement
            $validation = $this->validateConsentCompliance($consent);
            
            return [
                'success' => true,
                'data' => [
                    'consent' => [
                        'analytics' => (bool)$consent['analytics_consent'],
                        'functional' => (bool)$consent['functional_consent'],
                        'marketing' => (bool)$consent['marketing_consent'],
                        'essential' => (bool)$consent['essential_consent']
                    ],
                    'metadata' => [
                        'consent_date' => $consent['consent_timestamp'],
                        'version' => $consent['consent_version'],
                        'is_valid' => $validation['is_valid'],
                        'issues' => $validation['issues']
                    ]
                ]
            ];
        }
        
        return [
            'success' => false,
            'message' => 'Aucun consentement RGPD trouvé pour cet utilisateur',
            'data' => null
        ];
    }

    /**
     * Vérifier si un utilisateur est conforme RGPD
     */
    public function isUserCompliant($userId) {
        $stmt = $this->db->prepare("
            SELECT COUNT(*) as count FROM user_gdpr_consents 
            WHERE user_id = ? AND is_active = TRUE
        ");
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        
        $isCompliant = $row['count'] > 0;
        
        return [
            'success' => true,
            'data' => [
                'user_id' => $userId,
                'is_compliant' => $isCompliant,
                'message' => $isCompliant 
                    ? 'Utilisateur conforme RGPD' 
                    : 'Utilisateur non conforme - consentement requis'
            ]
        ];
    }

    /**
     * Obtenir les statistiques de conformité
     */
    public function getComplianceStats() {
        $stmt = $this->db->prepare("
            SELECT 
                COUNT(*) as total_users,
                COUNT(CASE WHEN ugc.id IS NOT NULL THEN 1 END) as compliant_users,
                COUNT(CASE WHEN ugc.id IS NULL THEN 1 END) as non_compliant_users,
                ROUND(
                    COUNT(CASE WHEN ugc.id IS NOT NULL THEN 1 END) * 100.0 / COUNT(*), 
                    2
                ) as compliance_rate
            FROM users u 
            LEFT JOIN user_gdpr_consents ugc ON u.id = ugc.user_id AND ugc.is_active = TRUE
            WHERE u.status = 'active'
        ");
        $stmt->execute();
        $result = $stmt->get_result();
        $stats = $result->fetch_assoc();
        
        // Compter les notifications envoyées
        $notifStmt = $this->db->prepare("
            SELECT 
                notification_type,
                COUNT(*) as count
            FROM user_gdpr_notifications 
            GROUP BY notification_type
        ");
        $notifStmt->execute();
        $notifResult = $notifStmt->get_result();
        
        $notifications = ['initial' => 0, 'reminder' => 0, 'final' => 0];
        while ($row = $notifResult->fetch_assoc()) {
            if (isset($notifications[$row['notification_type']])) {
                $notifications[$row['notification_type']] = (int)$row['count'];
            }
        }
        
        return [
            'success' => true,
            'data' => [
                'total_users' => (int)$stats['total_users'],
                'compliant_users' => (int)$stats['compliant_users'],
                'non_compliant_users' => (int)$stats['non_compliant_users'],
                'compliance_rate' => (float)$stats['compliance_rate'],
                'notifications_sent' => $notifications
            ]
        ];
    }

    /**
     * Obtenir la liste des utilisateurs non conformes
     */
    public function getNonCompliantUsers($page = 1, $limit = 50) {
        $offset = ($page - 1) * $limit;
        
        $stmt = $this->db->prepare("
            SELECT 
                u.id,
                u.email,
                u.full_name as full_name,
                u.created_at as registration_date,
                u.last_login_at as last_login,
                COALESCE(notif_count.count, 0) as notifications_sent,
                CASE 
                    WHEN u.last_login_at > DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 'high'
                    WHEN u.last_login_at > DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 'medium'
                    ELSE 'low'
                END as risk_level
            FROM users u
            LEFT JOIN user_gdpr_consents ugc ON u.id = ugc.user_id AND ugc.is_active = TRUE
            LEFT JOIN (
                SELECT user_id, COUNT(*) as count 
                FROM user_gdpr_notifications 
                GROUP BY user_id
            ) notif_count ON u.id = notif_count.user_id
            WHERE ugc.id IS NULL
            AND u.status = 'active'
            ORDER BY u.last_login_at DESC
            LIMIT ? OFFSET ?
        ");
        
        $stmt->bind_param("ii", $limit, $offset);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $users = [];
        while ($row = $result->fetch_assoc()) {
            $users[] = $row;
        }
        
        // Compter le total pour la pagination
        $countStmt = $this->db->prepare("
            SELECT COUNT(*) as total
            FROM users u
            LEFT JOIN user_gdpr_consents ugc ON u.id = ugc.user_id AND ugc.is_active = TRUE
            WHERE ugc.id IS NULL AND u.status = 'active'
        ");
        $countStmt->execute();
        $countResult = $countStmt->get_result();
        $totalCount = $countResult->fetch_assoc()['total'];
        
        return [
            'success' => true,
            'data' => [
                'users' => $users,
                'pagination' => [
                    'current_page' => $page,
                    'total_users' => (int)$totalCount,
                    'total_pages' => ceil($totalCount / $limit),
                    'has_next' => ($page * $limit) < $totalCount,
                    'has_prev' => $page > 1
                ]
            ]
        ];
    }

    /**
     * Enregistrer une notification RGPD envoyée
     */
    public function recordNotificationSent($userId, $notificationType, $emailSubject, $templateVersion = '1.0') {
        $stmt = $this->db->prepare("
            INSERT INTO user_gdpr_notifications (
                user_id, notification_type, email_subject, 
                email_template_version, sent_at, delivery_status
            ) VALUES (?, ?, ?, ?, NOW(), 'sent')
        ");
        
        $stmt->bind_param("isss", $userId, $notificationType, $emailSubject, $templateVersion);
        
        if ($stmt->execute()) {
            return [
                'success' => true,
                'message' => 'Notification RGPD enregistrée',
                'data' => [
                    'user_id' => $userId,
                    'notification_type' => $notificationType,
                    'sent_at' => date('Y-m-d H:i:s')
                ]
            ];
        }
        
        return [
            'success' => false,
            'message' => 'Erreur lors de l\'enregistrement de la notification'
        ];
    }

    /**
     * Exporter les données RGPD d'un utilisateur
     */
    public function exportUserGdprData($userId) {
        // Consentement actuel
        $consentResult = $this->getUserConsent($userId);
        $currentConsent = $consentResult['success'] ? $consentResult['data'] : null;
        
        // Historique des consentements
        $historyStmt = $this->db->prepare("
            SELECT * FROM user_gdpr_consent_history 
            WHERE user_id = ? 
            ORDER BY action_timestamp DESC
        ");
        $historyStmt->bind_param("i", $userId);
        $historyStmt->execute();
        $historyResult = $historyStmt->get_result();
        
        $history = [];
        while ($row = $historyResult->fetch_assoc()) {
            $history[] = $row;
        }
        
        // Notifications envoyées
        $notifStmt = $this->db->prepare("
            SELECT * FROM user_gdpr_notifications 
            WHERE user_id = ? 
            ORDER BY sent_at DESC
        ");
        $notifStmt->bind_param("i", $userId);
        $notifStmt->execute();
        $notifResult = $notifStmt->get_result();
        
        $notifications = [];
        while ($row = $notifResult->fetch_assoc()) {
            $notifications[] = $row;
        }
        
        return [
            'success' => true,
            'data' => [
                'current_consent' => $currentConsent,
                'consent_history' => $history,
                'notifications' => $notifications,
                'exported_at' => date('Y-m-d H:i:s'),
                'user_rights' => [
                    'access' => 'Vous avez le droit de consulter vos données',
                    'rectification' => 'Vous pouvez demander la correction de vos données',
                    'erasure' => 'Vous pouvez demander la suppression de vos données',
                    'portability' => 'Vous pouvez demander un export de vos données',
                    'objection' => 'Vous pouvez vous opposer au traitement',
                    'restriction' => 'Vous pouvez demander la limitation du traitement'
                ]
            ]
        ];
    }

    /**
     * Valider la conformité d'un consentement
     */
    private function validateConsentCompliance($consent) {
        $issues = [];
        
        // Vérifier l'âge du consentement (max 13 mois)
        $consentDate = new DateTime($consent['consent_timestamp']);
        $thirteenMonthsAgo = new DateTime();
        $thirteenMonthsAgo->modify('-13 months');
        
        if ($consentDate < $thirteenMonthsAgo) {
            $issues[] = 'Consentement expiré (plus de 13 mois)';
        }
        
        // Vérifier les informations essentielles
        if (empty($consent['ip_address'])) {
            $issues[] = 'Adresse IP manquante pour la traçabilité';
        }
        
        if (empty($consent['user_agent'])) {
            $issues[] = 'User Agent manquant pour la traçabilité';
        }
        
        if (empty($consent['consent_version'])) {
            $issues[] = 'Version du consentement manquante';
        }
        
        return [
            'is_valid' => empty($issues),
            'issues' => $issues
        ];
    }

    /**
     * Enregistrer l'historique des consentements
     */
    private function saveConsentHistory($userId, $actionType, $previousState, $newState, $metadata) {
        $stmt = $this->db->prepare("
            INSERT INTO user_gdpr_consent_history (
                user_id, action_type, previous_state, new_state, 
                ip_address, user_agent, reason, metadata, action_timestamp
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
        ");
        
        $previousStateJson = $previousState ? json_encode($previousState) : null;
        $newStateJson = $newState ? json_encode($newState) : null;
        $metadataJson = json_encode($metadata);
        
        $stmt->bind_param(
            "isssssss", 
            $userId, 
            $actionType, 
            $previousStateJson, 
            $newStateJson,
            $metadata['ip_address'] ?? null,
            $metadata['user_agent'] ?? null,
            $metadata['reason'] ?? 'unknown',
            $metadataJson
        );
        
        $stmt->execute();
    }

    /**
     * Mettre à jour le consentement d'un utilisateur
     */
    public function updateUserConsent($userId, $consents) {
        return $this->saveUserConsent(
            $userId,
            $consents,
            $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1',
            $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown',
            'user_consent_update'
        );
    }

    /**
     * Supprimer le consentement d'un utilisateur (retrait)
     */
    public function deleteUserConsent($userId) {
        try {
            $this->db->begin_transaction();
            
            // Marquer tous les consentements comme inactifs
            $stmt = $this->db->prepare("
                UPDATE user_gdpr_consents 
                SET is_active = FALSE, revoked_at = NOW(), updated_at = NOW()
                WHERE user_id = ? AND is_active = TRUE
            ");
            $stmt->bind_param("i", $userId);
            $stmt->execute();
            
            // Enregistrer l'historique
            $this->logConsentAction($userId, 'consent_withdrawn', null, null, [
                'ip_address' => $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1',
                'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown',
                'reason' => 'user_requested_withdrawal'
            ]);
            
            $this->db->commit();
            
            return [
                'success' => true,
                'message' => 'Consentement retiré avec succès'
            ];
            
        } catch (Exception $e) {
            $this->db->rollback();
            error_log("Erreur deleteUserConsent: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Erreur lors du retrait du consentement: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Récupérer l'historique des consentements d'un utilisateur
     */
    public function getConsentHistory($userId) {
        try {
            $stmt = $this->db->prepare("
                SELECT action_type, previous_state, new_state, ip_address, 
                       user_agent, reason, action_timestamp
                FROM user_gdpr_consent_history 
                WHERE user_id = ? 
                ORDER BY action_timestamp DESC
                LIMIT 100
            ");
            $stmt->bind_param("i", $userId);
            $stmt->execute();
            $result = $stmt->get_result();
            
            $history = [];
            while ($row = $result->fetch_assoc()) {
                $history[] = [
                    'action' => $row['action_type'],
                    'previous_state' => json_decode($row['previous_state'], true),
                    'new_state' => json_decode($row['new_state'], true),
                    'ip_address' => $row['ip_address'],
                    'user_agent' => $row['user_agent'],
                    'reason' => $row['reason'],
                    'timestamp' => $row['action_timestamp']
                ];
            }
            
            return [
                'success' => true,
                'data' => $history
            ];
            
        } catch (Exception $e) {
            error_log("Erreur getConsentHistory: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Erreur lors de la récupération de l\'historique: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Envoyer une notification GDPR (enregistrement seulement)
     */
    public function sendGdprNotification($userId, $type, $message) {
        return $this->recordNotificationSent($userId, $type, $message);
    }

    /**
     * Récupérer tous les consentements (admin)
     */
    public function getAllConsents() {
        try {
            $stmt = $this->db->prepare("
                SELECT c.*, u.email, u.firstName, u.lastName
                FROM user_gdpr_consents c
                JOIN users u ON c.user_id = u.id
                WHERE c.is_active = TRUE
                ORDER BY c.consent_timestamp DESC
            ");
            $stmt->execute();
            $result = $stmt->get_result();
            
            $consents = [];
            while ($row = $result->fetch_assoc()) {
                $consents[] = [
                    'user' => [
                        'id' => $row['user_id'],
                        'email' => $row['email'],
                        'firstName' => $row['firstName'],
                        'lastName' => $row['lastName']
                    ],
                    'consent' => [
                        'analytics' => (bool)$row['analytics_consent'],
                        'functional' => (bool)$row['functional_consent'],
                        'marketing' => (bool)$row['marketing_consent'],
                        'essential' => (bool)$row['essential_consent']
                    ],
                    'metadata' => [
                        'consent_date' => $row['consent_timestamp'],
                        'version' => $row['consent_version'],
                        'ip_address' => $row['ip_address']
                    ]
                ];
            }
            
            return [
                'success' => true,
                'data' => $consents
            ];
            
        } catch (Exception $e) {
            error_log("Erreur getAllConsents: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Erreur lors de la récupération des consentements: ' . $e->getMessage()
            ];
        }
    }
}