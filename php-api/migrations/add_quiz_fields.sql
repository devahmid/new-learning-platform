-- Ajouter les colonnes manquantes à la table quizzes
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS timeLimit INT NULL;
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS passingScore INT DEFAULT 70;
