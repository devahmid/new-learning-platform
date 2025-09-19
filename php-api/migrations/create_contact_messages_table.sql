-- =====================================================
-- MIGRATION : Table des messages de contact
-- =====================================================

CREATE TABLE IF NOT EXISTS contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NULL,
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    ip_address VARCHAR(45) NULL,
    status ENUM('new', 'read', 'replied', 'archived') DEFAULT 'new',
    admin_notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Insérer quelques données de test (optionnel)
-- INSERT INTO contact_messages (first_name, last_name, email, subject, message, status) VALUES
-- ('Ahmed', 'Benali', 'ahmed@example.com', 'Inscription', 'Bonjour, je souhaite inscrire mon fils de 8 ans.', 'new'),
-- ('Fatima', 'Alami', 'fatima@example.com', 'Cours', 'Quels sont les horaires des cours pour adultes ?', 'read');
