-- Migration: Créer la table de liaison evaluation_classes pour relation many-to-many
-- Date: 2025-01-XX
-- Description: Permet qu'une évaluation générale soit affectée à plusieurs classes

-- 1. Créer la table de liaison evaluation_classes
CREATE TABLE IF NOT EXISTS evaluation_classes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    evaluationId INT NOT NULL,
    classeId INT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_evaluation_classe (evaluationId, classeId),
    FOREIGN KEY (evaluationId) REFERENCES evaluations(id) ON DELETE CASCADE,
    FOREIGN KEY (classeId) REFERENCES classes(id) ON DELETE CASCADE
);

-- 2. Ajouter des index pour optimiser les requêtes
CREATE INDEX idx_evaluation_classes_evaluation ON evaluation_classes(evaluationId);
CREATE INDEX idx_evaluation_classes_classe ON evaluation_classes(classeId);

