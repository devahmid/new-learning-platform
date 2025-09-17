-- Migration pour créer la table des notifications de validation
CREATE TABLE IF NOT EXISTS validation_notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    type ENUM('approval', 'rejection', 'pending') NOT NULL,
    message TEXT NOT NULL,
    reason TEXT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    isRead BOOLEAN DEFAULT FALSE,
    INDEX idx_user_id (userId),
    INDEX idx_type (type),
    INDEX idx_created_at (createdAt),
    INDEX idx_is_read (isRead),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Insérer des données de test (optionnel)
-- INSERT INTO validation_notifications (userId, type, message, reason, createdAt, isRead) VALUES
-- (1, 'approval', 'Votre compte a été approuvé !', NULL, NOW(), FALSE),
-- (2, 'rejection', 'Votre compte a été rejeté', 'Informations incomplètes', NOW(), FALSE),
-- (3, 'pending', 'Votre compte est en attente de validation', NULL, NOW(), FALSE);
