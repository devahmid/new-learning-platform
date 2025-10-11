# Migration Base de Données - Consentements RGPD

## Table: user_gdpr_consents

```sql
CREATE TABLE user_gdpr_consents (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Types de consentements
    analytics_consent BOOLEAN DEFAULT FALSE,
    functional_consent BOOLEAN DEFAULT FALSE,
    marketing_consent BOOLEAN DEFAULT FALSE,
    essential_consent BOOLEAN DEFAULT TRUE, -- Toujours TRUE pour les essentiels
    
    -- Métadonnées légales
    consent_version VARCHAR(10) DEFAULT '1.0',
    ip_address INET,
    user_agent TEXT,
    consent_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Statut
    is_active BOOLEAN DEFAULT TRUE,
    revoked_at TIMESTAMP WITH TIME ZONE,
    
    -- Traçabilité
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Index pour performance
    UNIQUE(user_id, is_active) WHERE is_active = TRUE
);

-- Index pour recherches rapides
CREATE INDEX idx_user_gdpr_consents_user_id ON user_gdpr_consents(user_id);
CREATE INDEX idx_user_gdpr_consents_timestamp ON user_gdpr_consents(consent_timestamp);
CREATE INDEX idx_user_gdpr_consents_active ON user_gdpr_consents(is_active) WHERE is_active = TRUE;

-- Table d'historique pour audit complet
CREATE TABLE user_gdpr_consent_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    consent_id INTEGER REFERENCES user_gdpr_consents(id) ON DELETE SET NULL,
    
    -- Snapshot des consentements au moment de l'action
    action_type VARCHAR(50) NOT NULL, -- 'granted', 'revoked', 'updated'
    previous_state JSONB,
    new_state JSONB,
    
    -- Context légal
    ip_address INET,
    user_agent TEXT,
    reason TEXT, -- Raison du changement (ex: "user_request", "gdpr_compliance", "admin_action")
    
    -- Timestamp immuable
    action_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Métadonnées additionnelles
    metadata JSONB DEFAULT '{}'::JSONB
);

-- Index pour l'historique
CREATE INDEX idx_gdpr_history_user_id ON user_gdpr_consent_history(user_id);
CREATE INDEX idx_gdpr_history_timestamp ON user_gdpr_consent_history(action_timestamp);

-- Table pour notifications RGPD envoyées
CREATE TABLE user_gdpr_notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    notification_type VARCHAR(50) NOT NULL, -- 'initial_notice', 'reminder', 'final_notice'
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Contenu de la notification
    email_subject TEXT,
    email_template_version VARCHAR(10),
    
    -- Tracking
    email_opened_at TIMESTAMP WITH TIME ZONE,
    link_clicked_at TIMESTAMP WITH TIME ZONE,
    response_received_at TIMESTAMP WITH TIME ZONE,
    
    -- Statut
    delivery_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'failed'
    error_message TEXT,
    
    -- Métadonnées
    metadata JSONB DEFAULT '{}'::JSONB
);

-- Index pour les notifications
CREATE INDEX idx_gdpr_notifications_user_id ON user_gdpr_notifications(user_id);
CREATE INDEX idx_gdpr_notifications_type ON user_gdpr_notifications(notification_type);
CREATE INDEX idx_gdpr_notifications_sent_at ON user_gdpr_notifications(sent_at);
```

## Vues pour reporting

```sql
-- Vue pour le dashboard admin
CREATE VIEW v_gdpr_compliance_overview AS
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN ugc.id IS NOT NULL THEN 1 END) as compliant_users,
    COUNT(CASE WHEN ugc.id IS NULL THEN 1 END) as non_compliant_users,
    ROUND(
        COUNT(CASE WHEN ugc.id IS NOT NULL THEN 1 END) * 100.0 / COUNT(*), 
        2
    ) as compliance_percentage
FROM users u 
LEFT JOIN user_gdpr_consents ugc ON u.id = ugc.user_id AND ugc.is_active = TRUE;

-- Vue pour les utilisateurs non conformes
CREATE VIEW v_gdpr_non_compliant_users AS
SELECT 
    u.id,
    u.email,
    u.full_name,
    u.created_at as registration_date,
    u.last_login_at,
    COALESCE(notif_count.count, 0) as notifications_sent,
    CASE 
        WHEN u.last_login_at > NOW() - INTERVAL '7 days' THEN 'high'
        WHEN u.last_login_at > NOW() - INTERVAL '30 days' THEN 'medium'
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
```