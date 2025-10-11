<?php
/**
 * Migration Base de Données - Tables RGPD
 * 
 * Exécuter avec: php create_gdpr_tables.php
 */

require_once __DIR__ . '/../config/database.php';

echo "🛡️  Création des tables RGPD...\n\n";

try {
    // Activer le mode transaction
    $db->autocommit(FALSE);
    
    echo "1. Création de la table user_gdpr_consents...\n";
    
    $createConsentsTable = "
        CREATE TABLE IF NOT EXISTS user_gdpr_consents (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            
            -- Types de consentements
            analytics_consent BOOLEAN DEFAULT FALSE,
            functional_consent BOOLEAN DEFAULT FALSE,
            marketing_consent BOOLEAN DEFAULT FALSE,
            essential_consent BOOLEAN DEFAULT TRUE,
            
            -- Métadonnées légales
            consent_version VARCHAR(10) DEFAULT '1.0',
            ip_address VARCHAR(45),
            user_agent TEXT,
            consent_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            
            -- Statut
            is_active BOOLEAN DEFAULT TRUE,
            revoked_at TIMESTAMP NULL,
            
            -- Traçabilité
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            
            -- Contraintes
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE KEY unique_active_consent (user_id, is_active)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    
    if ($db->query($createConsentsTable)) {
        echo "   ✅ Table user_gdpr_consents créée\n";
    } else {
        throw new Exception("Erreur création table user_gdpr_consents: " . $db->error);
    }
    
    echo "2. Création des index pour user_gdpr_consents...\n";
    
    $indexes = [
        "CREATE INDEX idx_user_gdpr_consents_user_id ON user_gdpr_consents(user_id)",
        "CREATE INDEX idx_user_gdpr_consents_timestamp ON user_gdpr_consents(consent_timestamp)",
        "CREATE INDEX idx_user_gdpr_consents_active ON user_gdpr_consents(is_active)"
    ];
    
    foreach ($indexes as $index) {
        if ($db->query($index)) {
            echo "   ✅ Index créé\n";
        } else {
            // Ignorer si l'index existe déjà
            if (strpos($db->error, 'Duplicate key name') === false) {
                throw new Exception("Erreur création index: " . $db->error);
            }
        }
    }
    
    echo "3. Création de la table user_gdpr_consent_history...\n";
    
    $createHistoryTable = "
        CREATE TABLE IF NOT EXISTS user_gdpr_consent_history (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            consent_id INT NULL,
            
            -- Snapshot des consentements au moment de l'action
            action_type VARCHAR(50) NOT NULL,
            previous_state JSON,
            new_state JSON,
            
            -- Context légal
            ip_address VARCHAR(45),
            user_agent TEXT,
            reason VARCHAR(255),
            
            -- Timestamp immuable
            action_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            
            -- Métadonnées additionnelles
            metadata JSON,
            
            -- Contraintes
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (consent_id) REFERENCES user_gdpr_consents(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    
    if ($db->query($createHistoryTable)) {
        echo "   ✅ Table user_gdpr_consent_history créée\n";
    } else {
        throw new Exception("Erreur création table user_gdpr_consent_history: " . $db->error);
    }
    
    echo "4. Création des index pour user_gdpr_consent_history...\n";
    
    $historyIndexes = [
        "CREATE INDEX idx_gdpr_history_user_id ON user_gdpr_consent_history(user_id)",
        "CREATE INDEX idx_gdpr_history_timestamp ON user_gdpr_consent_history(action_timestamp)"
    ];
    
    foreach ($historyIndexes as $index) {
        if ($db->query($index)) {
            echo "   ✅ Index créé\n";
        } else {
            if (strpos($db->error, 'Duplicate key name') === false) {
                throw new Exception("Erreur création index: " . $db->error);
            }
        }
    }
    
    echo "5. Création de la table user_gdpr_notifications...\n";
    
    $createNotificationsTable = "
        CREATE TABLE IF NOT EXISTS user_gdpr_notifications (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            
            notification_type VARCHAR(50) NOT NULL,
            sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            
            -- Contenu de la notification
            email_subject TEXT,
            email_template_version VARCHAR(10),
            
            -- Tracking
            email_opened_at TIMESTAMP NULL,
            link_clicked_at TIMESTAMP NULL,
            response_received_at TIMESTAMP NULL,
            
            -- Statut
            delivery_status VARCHAR(20) DEFAULT 'pending',
            error_message TEXT,
            
            -- Métadonnées
            metadata JSON,
            
            -- Contraintes
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    
    if ($db->query($createNotificationsTable)) {
        echo "   ✅ Table user_gdpr_notifications créée\n";
    } else {
        throw new Exception("Erreur création table user_gdpr_notifications: " . $db->error);
    }
    
    echo "6. Création des index pour user_gdpr_notifications...\n";
    
    $notifIndexes = [
        "CREATE INDEX idx_gdpr_notifications_user_id ON user_gdpr_notifications(user_id)",
        "CREATE INDEX idx_gdpr_notifications_type ON user_gdpr_notifications(notification_type)",
        "CREATE INDEX idx_gdpr_notifications_sent_at ON user_gdpr_notifications(sent_at)"
    ];
    
    foreach ($notifIndexes as $index) {
        if ($db->query($index)) {
            echo "   ✅ Index créé\n";
        } else {
            if (strpos($db->error, 'Duplicate key name') === false) {
                throw new Exception("Erreur création index: " . $db->error);
            }
        }
    }
    
    echo "7. Création des vues pour le reporting...\n";
    
    // Vue pour le dashboard admin
    $createOverviewView = "
        CREATE OR REPLACE VIEW v_gdpr_compliance_overview AS
        SELECT 
            COUNT(*) as total_users,
            COUNT(CASE WHEN ugc.id IS NOT NULL THEN 1 END) as compliant_users,
            COUNT(CASE WHEN ugc.id IS NULL THEN 1 END) as non_compliant_users,
            ROUND(
                COUNT(CASE WHEN ugc.id IS NOT NULL THEN 1 END) * 100.0 / COUNT(*), 
                2
            ) as compliance_percentage
        FROM users u 
        LEFT JOIN user_gdpr_consents ugc ON u.id = ugc.user_id AND ugc.is_active = TRUE
        WHERE u.status = 'active';
    ";
    
    if ($db->query($createOverviewView)) {
        echo "   ✅ Vue v_gdpr_compliance_overview créée\n";
    } else {
        echo "   ⚠️  Vue v_gdpr_compliance_overview: " . $db->error . "\n";
    }
    
    // Vue pour les utilisateurs non conformes
    $createNonCompliantView = "
        CREATE OR REPLACE VIEW v_gdpr_non_compliant_users AS
        SELECT 
            u.id,
            u.email,
            u.full_name,
            u.created_at as registration_date,
            u.last_login_at,
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
        AND u.status = 'active';
    ";
    
    if ($db->query($createNonCompliantView)) {
        echo "   ✅ Vue v_gdpr_non_compliant_users créée\n";
    } else {
        echo "   ⚠️  Vue v_gdpr_non_compliant_users: " . $db->error . "\n";
    }
    
    // Valider toutes les modifications
    $db->commit();
    echo "\n🎉 Migration RGPD terminée avec succès !\n\n";
    
    // Afficher un résumé
    echo "📊 Résumé des tables créées:\n";
    echo "   - user_gdpr_consents (stockage des consentements)\n";
    echo "   - user_gdpr_consent_history (historique et audit)\n";
    echo "   - user_gdpr_notifications (tracking des emails)\n";
    echo "   - v_gdpr_compliance_overview (vue statistiques)\n";
    echo "   - v_gdpr_non_compliant_users (vue utilisateurs non conformes)\n\n";
    
    echo "🔗 Endpoints API disponibles:\n";
    echo "   POST /api/gdpr/consent - Enregistrer consentement\n";
    echo "   GET  /api/gdpr/consent/{userId} - Récupérer consentement\n";
    echo "   GET  /api/gdpr/compliance/{userId} - Vérifier conformité\n";
    echo "   GET  /api/gdpr/compliance-stats - Statistiques\n";
    echo "   GET  /api/gdpr/non-compliant-users - Utilisateurs non conformes\n";
    echo "   POST /api/gdpr/send-bulk-notifications - Envoi en masse\n";
    echo "   GET  /api/gdpr/export/{userId} - Export données utilisateur\n";
    echo "   DELETE /api/gdpr/user-data/{userId} - Droit à l'oubli\n\n";
    
    echo "✅ Votre API RGPD est prête !\n";
    
} catch (Exception $e) {
    // Annuler en cas d'erreur
    $db->rollback();
    echo "\n❌ Erreur lors de la migration: " . $e->getMessage() . "\n";
    exit(1);
} finally {
    // Restaurer l'autocommit
    $db->autocommit(TRUE);
}
?>