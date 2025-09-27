-- =====================================================
-- MIGRATION: Création de la table assignments
-- =====================================================

CREATE TABLE assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    classeId INT NOT NULL,
    dueDate DATETIME,
    createdBy INT NOT NULL,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (classeId) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE CASCADE
);

-- Index pour optimiser les requêtes
CREATE INDEX idx_assignments_classe ON assignments(classeId);
CREATE INDEX idx_assignments_created_by ON assignments(createdBy);
CREATE INDEX idx_assignments_due_date ON assignments(dueDate);
CREATE INDEX idx_assignments_active ON assignments(isActive);
