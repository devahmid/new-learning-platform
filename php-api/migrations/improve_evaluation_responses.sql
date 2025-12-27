-- =====================================================
-- AMÉLIORATION DE LA TABLE evaluation_responses
-- =====================================================

-- Ajouter les champs pour stocker les informations de l'enfant et le score
ALTER TABLE evaluation_responses 
ADD COLUMN childId INT NULL AFTER userId,
ADD COLUMN classeId INT NULL AFTER childId,
ADD COLUMN childName VARCHAR(255) NULL AFTER classeId,
ADD COLUMN classeName VARCHAR(255) NULL AFTER childName,
ADD COLUMN score DECIMAL(5,2) NULL AFTER classeName,
ADD COLUMN totalQuestions INT NULL AFTER score,
ADD COLUMN correctAnswers INT NULL AFTER totalQuestions,
ADD COLUMN percentage DECIMAL(5,2) NULL AFTER correctAnswers;

-- Ajouter les index pour améliorer les performances
CREATE INDEX idx_child ON evaluation_responses(childId);
CREATE INDEX idx_classe ON evaluation_responses(classeId);
CREATE INDEX idx_score ON evaluation_responses(score);
CREATE INDEX idx_evaluation_child ON evaluation_responses(evaluationId, childId);

-- Ajouter les clés étrangères si nécessaire
-- ALTER TABLE evaluation_responses ADD FOREIGN KEY (childId) REFERENCES users(id) ON DELETE SET NULL;
-- ALTER TABLE evaluation_responses ADD FOREIGN KEY (classeId) REFERENCES classes(id) ON DELETE SET NULL;

