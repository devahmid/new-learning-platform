<?php
/**
 * Script de test pour créer les tables GDPR manquantes
 */

require_once __DIR__ . '/config/database.php';

echo "🛡️  Vérification et création des tables GDPR...\n\n";

try {
    // Table user_gdpr_consent_history
    echo "1. Vérification de la table user_gdpr_consent_history...\n";
    
    $createHistoryTable = "
        CREATE TABLE IF NOT EXISTS user_gdpr_consent_history (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            consent_id INT NULL,
            
            -- Snapshot des consentements
            action_type VARCHAR(50) NOT NULL,
            previous_state JSON,
            new_state JSON,
            
            -- Context légal
            ip_address VARCHAR(45),
            user_agent TEXT,
            reason TEXT,
            
            -- Timestamp
            action_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            
            -- Métadonnées
            metadata JSON DEFAULT '{}',
            
            -- Contraintes
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    
    if ($db->query($createHistoryTable)) {
        echo "   ✅ Table user_gdpr_consent_history OK\n";
    } else {
        echo "   ❌ Erreur : " . $db->error . "\n";
    }
    
    // Table user_gdpr_notifications
    echo "2. Vérification de la table user_gdpr_notifications...\n";
    
    $createNotificationsTable = "
        CREATE TABLE IF NOT EXISTS user_gdpr_notifications (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            
            notification_type VARCHAR(50) NOT NULL,
            sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            
            -- Contenu
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
            metadata JSON DEFAULT '{}',
            
            -- Contraintes
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    
    if ($db->query($createNotificationsTable)) {
        echo "   ✅ Table user_gdpr_notifications OK\n";
    } else {
        echo "   ❌ Erreur : " . $db->error . "\n";
    }
    
    echo "\n✅ Vérification terminée ! Tables GDPR prêtes.\n";
    
} catch (Exception $e) {
    echo "❌ Erreur : " . $e->getMessage() . "\n";
}
?>