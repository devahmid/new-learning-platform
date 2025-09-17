-- Création de la table quiz_questions
CREATE TABLE IF NOT EXISTS quiz_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quizId INT NOT NULL,
    text TEXT NOT NULL,
    order_index INT DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_quiz_id (quizId),
    INDEX idx_order (order_index)
);

-- Création de la table quiz_question_options
CREATE TABLE IF NOT EXISTS quiz_question_options (
    id INT AUTO_INCREMENT PRIMARY KEY,
    questionId INT NOT NULL,
    text TEXT NOT NULL,
    isCorrect BOOLEAN DEFAULT FALSE,
    order_index INT DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_question_id (questionId),
    INDEX idx_order (order_index)
);

-- Insérer des questions de test pour le quiz ID 1
INSERT INTO quiz_questions (quizId, text, order_index) VALUES
(1, "Comment dit-on 'Bonjour' en arabe ?", 1),
(1, "Quelle est la traduction de 'Merci' ?", 2),
(1, "Comment dit-on 'Au revoir' ?", 3);

-- Insérer les options pour la première question
INSERT INTO quiz_question_options (questionId, text, isCorrect, order_index) VALUES
(1, 'مرحبا', TRUE, 1),
(1, 'شكرا', FALSE, 2),
(1, 'مع السلامة', FALSE, 3),
(1, 'أهلا وسهلا', FALSE, 4);

-- Insérer les options pour la deuxième question
INSERT INTO quiz_question_options (questionId, text, isCorrect, order_index) VALUES
(2, 'مرحبا', FALSE, 1),
(2, 'شكرا', TRUE, 2),
(2, 'عفوا', FALSE, 3),
(2, 'أهلا وسهلا', FALSE, 4);

-- Insérer les options pour la troisième question
INSERT INTO quiz_question_options (questionId, text, isCorrect, order_index) VALUES
(3, 'مرحبا', FALSE, 1),
(3, 'شكرا', FALSE, 2),
(3, 'مع السلامة', TRUE, 3),
(3, 'أهلا وسهلا', FALSE, 4);
