-- Script de déploiement complet pour les tables de quiz
-- À exécuter dans l'ordre sur la base de données

-- 1. Ajouter les colonnes timeLimit et passingScore à la table quizzes
ALTER TABLE quizzes
ADD COLUMN IF NOT EXISTS timeLimit INT NULL DEFAULT NULL;

ALTER TABLE quizzes
ADD COLUMN IF NOT EXISTS passingScore INT NULL DEFAULT 70;

-- 2. Créer la table quiz_questions
CREATE TABLE IF NOT EXISTS quiz_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quizId INT NOT NULL,
    text TEXT NOT NULL,
    order_index INT NOT NULL DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_quiz_id (quizId)
);

-- 3. Créer la table quiz_question_options
CREATE TABLE IF NOT EXISTS quiz_question_options (
    id INT AUTO_INCREMENT PRIMARY KEY,
    questionId INT NOT NULL,
    text VARCHAR(255) NOT NULL,
    isCorrect BOOLEAN NOT NULL DEFAULT FALSE,
    order_index INT NOT NULL DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_question_id (questionId)
);

-- 4. Créer les tables de progression (si elles n'existent pas)
CREATE TABLE IF NOT EXISTS quiz_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quizId INT NOT NULL,
    userId INT NOT NULL,
    lessonId INT NOT NULL,
    score INT NOT NULL,
    answers JSON NOT NULL,
    totalQuestions INT NOT NULL,
    completedAt DATETIME NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_quiz_user (quizId, userId),
    INDEX idx_user_lesson (userId, lessonId),
    INDEX idx_completed_at (completedAt)
);

CREATE TABLE IF NOT EXISTS exercise_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    exerciseId INT NOT NULL,
    userId INT NOT NULL,
    lessonId INT NOT NULL,
    exerciseType ENUM('flashcard', 'translation', 'listening') NOT NULL,
    score INT NOT NULL,
    answers JSON NOT NULL,
    totalQuestions INT NOT NULL,
    completedAt DATETIME NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_exercise_user (exerciseId, userId),
    INDEX idx_user_lesson (userId, lessonId),
    INDEX idx_exercise_type (exerciseType),
    INDEX idx_completed_at (completedAt)
);

-- Vérifier que les tables ont été créées
SHOW TABLES LIKE 'quiz_%';
SHOW TABLES LIKE '%_progress';
