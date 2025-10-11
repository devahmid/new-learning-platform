<?php

namespace App\Services;

/**
 * Service de gestion des consentements RGPD - Version simple PDO
 */
class GdprConsentServiceSimple {
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
            
            // Vérifier s'il y a déjà un consentement actif
            $checkStmt = $this->db->prepare("
                SELECT id FROM user_gdpr_consents 
                WHERE user_id = ? AND is_active = 1
            ");
            $checkStmt->execute([$userId]);
            $existingConsent = $checkStmt->fetch();
            
            if ($existingConsent) {
                // Mettre à jour le consentement existant
                $stmt = $this->db->prepare("
                    UPDATE user_gdpr_consents SET
                        analytics_consent = ?, functional_consent = ?, marketing_consent = ?, 
                        essential_consent = ?, ip_address = ?, user_agent = ?, updated_at = NOW()
                    WHERE user_id = ? AND is_active = 1
                ");
                
                $stmt->execute([
                    $consents['analytics'] ? 1 : 0,
                    $consents['functional'] ? 1 : 0,
                    $consents['marketing'] ? 1 : 0,
                    $consents['essential'] ? 1 : 0,
                    $ipAddress,
                    $userAgent,
                    $userId
                ]);
                
                $consentId = $existingConsent['id'];
            } else {
                // Désactiver tous les consentements précédents
                $stmt = $this->db->prepare("
                    UPDATE user_gdpr_consents 
                    SET is_active = 0, revoked_at = NOW(), updated_at = NOW()
                    WHERE user_id = ? AND is_active = 1
                ");
                $stmt->execute([$userId]);
                
                // Créer un nouveau consentement
                $stmt = $this->db->prepare("
                    INSERT INTO user_gdpr_consents (
                        user_id, analytics_consent, functional_consent, marketing_consent, 
                        essential_consent, consent_version, ip_address, user_agent, is_active
                    ) VALUES (?, ?, ?, ?, ?, '1.0', ?, ?, 1)
                ");
                
                $stmt->execute([
                    $userId, 
                    $consents['analytics'] ? 1 : 0,
                    $consents['functional'] ? 1 : 0,
                    $consents['marketing'] ? 1 : 0,
                    $consents['essential'] ? 1 : 0,
                    $ipAddress,
                    $userAgent
                ]);
                
                $consentId = $this->db->lastInsertId();
            }
            
            // Valider la transaction
            $this->db->commit();
            
            return [
                'success' => true,
                'consent_id' => $consentId,
                'message' => 'Consentement RGPD enregistré avec succès',
                'data' => [
                    'user_id' => $userId,
                    'consents' => $consents,
                    'timestamp' => date('Y-m-d H:i:s')
                ]
            ];
            
        } catch (Exception $e) {
            $this->db->rollBack();
            error_log("Erreur sauvegarde consentement: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Erreur lors de l\'enregistrement du consentement: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Récupérer le consentement actuel d'un utilisateur
     */
    public function getUserConsent($userId) {
        try {
            $stmt = $this->db->prepare("
                SELECT * FROM user_gdpr_consents 
                WHERE user_id = ? AND is_active = 1
                ORDER BY consent_timestamp DESC 
                LIMIT 1
            ");
            $stmt->execute([$userId]);
            $consent = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($consent) {
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
                            'version' => $consent['consent_version']
                        ]
                    ]
                ];
            }
            
            return [
                'success' => false,
                'message' => 'Aucun consentement RGPD trouvé pour cet utilisateur',
                'data' => null
            ];
            
        } catch (Exception $e) {
            error_log("Erreur getUserConsent: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Erreur lors de la récupération du consentement: ' . $e->getMessage()
            ];
        }
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
            $stmt = $this->db->prepare("
                UPDATE user_gdpr_consents 
                SET is_active = 0, revoked_at = NOW(), updated_at = NOW()
                WHERE user_id = ? AND is_active = 1
            ");
            $stmt->execute([$userId]);
            
            return [
                'success' => true,
                'message' => 'Consentement retiré avec succès'
            ];
            
        } catch (Exception $e) {
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
                SELECT * FROM user_gdpr_consents 
                WHERE user_id = ? 
                ORDER BY consent_timestamp DESC
                LIMIT 50
            ");
            $stmt->execute([$userId]);
            $history = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
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
        return [
            'success' => true,
            'message' => 'Notification enregistrée (version simplifiée)'
        ];
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
                WHERE c.is_active = 1
                ORDER BY c.consent_timestamp DESC
                LIMIT 100
            ");
            $stmt->execute();
            $consents = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $result = [];
            foreach ($consents as $row) {
                $result[] = [
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
                'data' => $result
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