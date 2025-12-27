-- =====================================================
-- TABLES POUR LE SYSTÈME D'ÉVALUATIONS
-- =====================================================

-- Table principale des évaluations
CREATE TABLE IF NOT EXISTS evaluations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructions TEXT NULL,
    specialInstructions TEXT NULL,
    courseId INT NULL,
    lessonId INT NULL,
    isActive BOOLEAN DEFAULT TRUE,
    allowMultipleSubmissions BOOLEAN DEFAULT FALSE,
    showResults BOOLEAN DEFAULT TRUE,
    startDate DATETIME NULL,
    endDate DATETIME NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE SET NULL,
    FOREIGN KEY (lessonId) REFERENCES lessons(id) ON DELETE SET NULL,
    INDEX idx_course (courseId),
    INDEX idx_lesson (lessonId),
    INDEX idx_active (isActive),
    INDEX idx_dates (startDate, endDate)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des sections d'évaluation
CREATE TABLE IF NOT EXISTS evaluation_sections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    evaluationId INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    `order` INT DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (evaluationId) REFERENCES evaluations(id) ON DELETE CASCADE,
    INDEX idx_evaluation (evaluationId),
    INDEX idx_order (evaluationId, `order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des questions d'évaluation
CREATE TABLE IF NOT EXISTS evaluation_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    evaluationId INT NOT NULL,
    sectionId INT NULL,
    text TEXT NOT NULL,
    type ENUM('multiple_choice', 'text', 'checkbox', 'radio', 'textarea', 'rating') NOT NULL DEFAULT 'text',
    required BOOLEAN DEFAULT FALSE,
    `order` INT DEFAULT 0,
    placeholder VARCHAR(255) NULL,
    minLength INT NULL,
    maxLength INT NULL,
    minRating INT DEFAULT 1,
    maxRating INT DEFAULT 5,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (evaluationId) REFERENCES evaluations(id) ON DELETE CASCADE,
    FOREIGN KEY (sectionId) REFERENCES evaluation_sections(id) ON DELETE SET NULL,
    INDEX idx_evaluation (evaluationId),
    INDEX idx_section (sectionId),
    INDEX idx_order (evaluationId, `order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des options pour les questions à choix multiples
CREATE TABLE IF NOT EXISTS evaluation_question_options (
    id INT AUTO_INCREMENT PRIMARY KEY,
    questionId INT NOT NULL,
    text VARCHAR(500) NOT NULL,
    `order` INT DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (questionId) REFERENCES evaluation_questions(id) ON DELETE CASCADE,
    INDEX idx_question (questionId),
    INDEX idx_order (questionId, `order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des réponses aux évaluations
CREATE TABLE IF NOT EXISTS evaluation_responses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    evaluationId INT NOT NULL,
    userId INT NULL,
    submittedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (evaluationId) REFERENCES evaluations(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_evaluation (evaluationId),
    INDEX idx_user (userId),
    INDEX idx_submitted (submittedAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des réponses individuelles aux questions
CREATE TABLE IF NOT EXISTS evaluation_question_responses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    responseId INT NOT NULL,
    questionId INT NOT NULL,
    value TEXT NOT NULL,
    textValue TEXT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (responseId) REFERENCES evaluation_responses(id) ON DELETE CASCADE,
    FOREIGN KEY (questionId) REFERENCES evaluation_questions(id) ON DELETE CASCADE,
    INDEX idx_response (responseId),
    INDEX idx_question (questionId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

