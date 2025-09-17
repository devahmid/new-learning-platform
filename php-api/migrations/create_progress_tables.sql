-- Création des tables de progression des quiz et exercices
-- Version finale avec vraie sauvegarde

-- Table de progression des quiz
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

-- Table de progression des exercices
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

-- Insérer quelques données de test
INSERT INTO quiz_progress (quizId, userId, lessonId, score, answers, totalQuestions, completedAt) VALUES
(1, 1, 1, 85, '{"1": 2, "2": 1}', 2, NOW()),
(1, 1, 2, 90, '{"1": 1, "2": 2}', 2, NOW());

INSERT INTO exercise_progress (exerciseId, userId, lessonId, exerciseType, score, answers, totalQuestions, completedAt) VALUES
(1, 1, 1, 'flashcard', 90, '{"1": "correct", "2": "incorrect"}', 2, NOW()),
(2, 1, 1, 'translation', 75, '{"1": "correct", "2": "incorrect"}', 2, NOW());