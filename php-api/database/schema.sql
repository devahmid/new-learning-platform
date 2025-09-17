-- =====================================================
-- SCHÉMA DE BASE DE DONNÉES - API PHP EDU
-- Équivalent des entités NestJS TypeORM
-- =====================================================

-- Désactiver les contraintes de clés étrangères temporairement
SET FOREIGN_KEY_CHECKS = 0;

-- Supprimer les tables existantes (dans l'ordre inverse des dépendances)
DROP TABLE IF EXISTS exercise_answers;
DROP TABLE IF EXISTS exercise_questions;
DROP TABLE IF EXISTS exercises;
DROP TABLE IF EXISTS quiz_results;
DROP TABLE IF EXISTS answers;
DROP TABLE IF EXISTS questions;
DROP TABLE IF EXISTS quizzes;
DROP TABLE IF EXISTS lesson_progress;
DROP TABLE IF EXISTS enrollments;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS games;
DROP TABLE IF EXISTS lessons;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS subcategories;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS child_profiles;
DROP TABLE IF EXISTS parent_profiles;
DROP TABLE IF EXISTS schedules;
DROP TABLE IF EXISTS classes;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS levels;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS parent_registrations;

-- =====================================================
-- TABLE: levels
-- =====================================================
CREATE TABLE levels (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    `order` INT DEFAULT 0,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLE: categories
-- =====================================================
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    imageUrl VARCHAR(500),
    isActive BOOLEAN DEFAULT TRUE,
    `order` INT DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLE: subcategories
-- =====================================================
CREATE TABLE subcategories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    imageUrl VARCHAR(500),
    isActive BOOLEAN DEFAULT TRUE,
    `order` INT DEFAULT 0,
    categoryId INT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE SET NULL
);

-- =====================================================
-- TABLE: classes
-- =====================================================
CREATE TABLE classes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    capacity INT DEFAULT 20,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLE: users
-- =====================================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    phoneNumber VARCHAR(20),
    password VARCHAR(255),
    firstName VARCHAR(100),
    lastName VARCHAR(100),
    dateOfBirth DATE,
    type ENUM('parent', 'child') DEFAULT 'parent',
    role VARCHAR(50) DEFAULT 'user',
    levelId INT,
    parentId INT,
    classeId INT,
    resetToken VARCHAR(255),
    resetTokenExpiration DATETIME,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (levelId) REFERENCES levels(id) ON DELETE SET NULL,
    FOREIGN KEY (parentId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (classeId) REFERENCES classes(id) ON DELETE SET NULL
);

-- =====================================================
-- TABLE: parent_profiles
-- =====================================================
CREATE TABLE parent_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL UNIQUE,
    secondaryPhone VARCHAR(20),
    platforms JSON,
    preferredGroups JSON,
    emailOnly BOOLEAN DEFAULT FALSE,
    address TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- TABLE: child_profiles
-- =====================================================
CREATE TABLE child_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL UNIQUE,
    gender ENUM('masculin', 'féminin', 'autre'),
    isAvailableWednesdayMorning BOOLEAN DEFAULT FALSE,
    hasExtracurricularActivity BOOLEAN DEFAULT FALSE,
    extracurricularDetails TEXT,
    preferredTimeSlots JSON,
    priorArabicExperience TEXT,
    arabicLevel VARCHAR(50),
    hasLearningDisability BOOLEAN DEFAULT FALSE,
    disabilities TEXT,
    supportDetails TEXT,
    allowRecording BOOLEAN,
    extraNotes TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- TABLE: courses
-- =====================================================
CREATE TABLE courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    imageUrl VARCHAR(500),
    videoUrl VARCHAR(500),
    pdfUrl VARCHAR(500),
    duration INT, -- en minutes
    difficulty ENUM('débutant', 'intermédiaire', 'avancé') DEFAULT 'débutant',
    isActive BOOLEAN DEFAULT TRUE,
    categoryId INT,
    subcategoryId INT,
    levelId INT,
    instructorId INT,
    price DECIMAL(10, 2) DEFAULT 0.00,
    discountPrice DECIMAL(10, 2),
    tags JSON,
    `order` INT DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (subcategoryId) REFERENCES subcategories(id) ON DELETE SET NULL,
    FOREIGN KEY (levelId) REFERENCES levels(id) ON DELETE SET NULL,
    FOREIGN KEY (instructorId) REFERENCES users(id) ON DELETE SET NULL
);

-- =====================================================
-- TABLE: lessons
-- =====================================================
CREATE TABLE lessons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    content TEXT,
    videoUrl VARCHAR(500),
    fileUrl VARCHAR(500),
    duration INT, -- en minutes
    `order` INT DEFAULT 0,
    isActive BOOLEAN DEFAULT TRUE,
    courseId INT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE
);

-- =====================================================
-- TABLE: exercises
-- =====================================================
CREATE TABLE exercises (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    type ENUM('flashcard', 'translation', 'listening', 'multiple_choice') NOT NULL,
    `order` INT DEFAULT 0,
    isActive BOOLEAN DEFAULT TRUE,
    lessonId INT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (lessonId) REFERENCES lessons(id) ON DELETE CASCADE
);

-- =====================================================
-- TABLE: exercise_questions
-- =====================================================
CREATE TABLE exercise_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    text TEXT NOT NULL,
    audioUrl VARCHAR(500),
    imageUrl VARCHAR(500),
    `order` INT DEFAULT 0,
    metadata JSON,
    exerciseId INT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (exerciseId) REFERENCES exercises(id) ON DELETE CASCADE
);

-- =====================================================
-- TABLE: exercise_answers
-- =====================================================
CREATE TABLE exercise_answers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    text TEXT NOT NULL,
    isCorrect BOOLEAN DEFAULT FALSE,
    `order` INT DEFAULT 0,
    metadata JSON,
    questionId INT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (questionId) REFERENCES exercise_questions(id) ON DELETE CASCADE
);

-- =====================================================
-- TABLE: quizzes
-- =====================================================
CREATE TABLE quizzes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    timeLimit INT, -- en minutes
    passingScore INT DEFAULT 70, -- pourcentage
    isActive BOOLEAN DEFAULT TRUE,
    courseId INT,
    lessonId INT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (lessonId) REFERENCES lessons(id) ON DELETE CASCADE
);

-- =====================================================
-- TABLE: questions
-- =====================================================
CREATE TABLE questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    text TEXT NOT NULL,
    type ENUM('multiple_choice', 'true_false', 'short_answer') DEFAULT 'multiple_choice',
    points INT DEFAULT 1,
    `order` INT DEFAULT 0,
    quizId INT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (quizId) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- =====================================================
-- TABLE: answers
-- =====================================================
CREATE TABLE answers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    text TEXT NOT NULL,
    isCorrect BOOLEAN DEFAULT FALSE,
    `order` INT DEFAULT 0,
    questionId INT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (questionId) REFERENCES questions(id) ON DELETE CASCADE
);

-- =====================================================
-- TABLE: enrollments
-- =====================================================
CREATE TABLE enrollments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    courseId INT NOT NULL,
    enrolledAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completedAt TIMESTAMP NULL,
    progress DECIMAL(5, 2) DEFAULT 0.00, -- pourcentage
    status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_enrollment (userId, courseId),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE
);

-- =====================================================
-- TABLE: lesson_progress
-- =====================================================
CREATE TABLE lesson_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    lessonId INT NOT NULL,
    isCompleted BOOLEAN DEFAULT FALSE,
    completedAt TIMESTAMP NULL,
    timeSpent INT DEFAULT 0, -- en secondes
    progress DECIMAL(5, 2) DEFAULT 0.00, -- pourcentage
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_lesson_progress (userId, lessonId),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (lessonId) REFERENCES lessons(id) ON DELETE CASCADE
);

-- =====================================================
-- TABLE: quiz_results
-- =====================================================
CREATE TABLE quiz_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    quizId INT NOT NULL,
    score DECIMAL(5, 2), -- pourcentage
    totalQuestions INT,
    correctAnswers INT,
    timeSpent INT, -- en secondes
    isPassed BOOLEAN DEFAULT FALSE,
    answers JSON, -- réponses données
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (quizId) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- =====================================================
-- TABLE: games
-- =====================================================
CREATE TABLE games (
    id INT AUTO_INCREMENT PRIMARY KEY,
    playerId INT NOT NULL,
    gameType VARCHAR(50) NOT NULL,
    score INT DEFAULT 0,
    level INT DEFAULT 1,
    duration INT, -- en secondes
    isCompleted BOOLEAN DEFAULT FALSE,
    gameData JSON, -- données spécifiques au jeu
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (playerId) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- TABLE: payments
-- =====================================================
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    paymentMethod VARCHAR(50),
    transactionId VARCHAR(255),
    description TEXT,
    metadata JSON,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- TABLE: schedules
-- =====================================================
CREATE TABLE schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    startTime DATETIME NOT NULL,
    endTime DATETIME NOT NULL,
    type ENUM('class', 'exam', 'event') DEFAULT 'class',
    classeId INT,
    instructorId INT,
    isRecurring BOOLEAN DEFAULT FALSE,
    recurrencePattern VARCHAR(50), -- 'weekly', 'daily', etc.
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (classeId) REFERENCES classes(id) ON DELETE SET NULL,
    FOREIGN KEY (instructorId) REFERENCES users(id) ON DELETE SET NULL
);

-- =====================================================
-- TABLE: messages
-- =====================================================
CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    senderId INT NOT NULL,
    receiverId INT NOT NULL,
    subject VARCHAR(200),
    content TEXT NOT NULL,
    isRead BOOLEAN DEFAULT FALSE,
    readAt TIMESTAMP NULL,
    type ENUM('message', 'notification', 'system') DEFAULT 'message',
    priority ENUM('low', 'normal', 'high') DEFAULT 'normal',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (senderId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiverId) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- TABLE: notifications
-- =====================================================
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    type VARCHAR(50) DEFAULT 'info',
    isRead BOOLEAN DEFAULT FALSE,
    readAt TIMESTAMP NULL,
    actionUrl VARCHAR(500),
    metadata JSON,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- TABLE: parent_registrations
-- =====================================================
CREATE TABLE parent_registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phoneNumber VARCHAR(20),
    address TEXT,
    childrenInfo JSON, -- informations sur les enfants
    preferredSchedule JSON,
    additionalNotes TEXT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    processedAt TIMESTAMP NULL,
    processedBy INT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (processedBy) REFERENCES users(id) ON DELETE SET NULL
);

-- Réactiver les contraintes de clés étrangères
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- INDEX POUR OPTIMISER LES PERFORMANCES
-- =====================================================

-- Index pour les recherches fréquentes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_type ON users(type);
CREATE INDEX idx_users_parent ON users(parentId);
CREATE INDEX idx_courses_category ON courses(categoryId);
CREATE INDEX idx_courses_level ON courses(levelId);
CREATE INDEX idx_courses_active ON courses(isActive);
CREATE INDEX idx_lessons_course ON lessons(courseId);
CREATE INDEX idx_exercises_lesson ON exercises(lessonId);
CREATE INDEX idx_exercises_type ON exercises(type);
CREATE INDEX idx_exercise_questions_exercise ON exercise_questions(exerciseId);
CREATE INDEX idx_exercise_answers_question ON exercise_answers(questionId);
CREATE INDEX idx_enrollments_user ON enrollments(userId);
CREATE INDEX idx_enrollments_course ON enrollments(courseId);
CREATE INDEX idx_lesson_progress_user ON lesson_progress(userId);
CREATE INDEX idx_lesson_progress_lesson ON lesson_progress(lessonId);
CREATE INDEX idx_quiz_results_user ON quiz_results(userId);
CREATE INDEX idx_quiz_results_quiz ON quiz_results(quizId);
CREATE INDEX idx_messages_sender ON messages(senderId);
CREATE INDEX idx_messages_receiver ON messages(receiverId);
CREATE INDEX idx_notifications_user ON notifications(userId);

-- =====================================================
-- DONNÉES DE TEST (OPTIONNEL)
-- =====================================================

-- Niveaux
INSERT INTO levels (name, description, `order`) VALUES
('Débutant', 'Niveau adapté aux débutants', 1),
('Intermédiaire', 'Niveau pour les étudiants avec des bases', 2),
('Avancé', 'Niveau pour les étudiants expérimentés', 3);

-- Catégories
INSERT INTO categories (name, description, `order`) VALUES
('Langue Arabe', 'Cours de langue arabe', 1),
('Culture', 'Cours sur la culture arabe', 2),
('Histoire', 'Histoire du monde arabe', 3);

-- Utilisateur admin de test
INSERT INTO users (email, password, firstName, lastName, type, role) VALUES
('admin@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'User', 'parent', 'admin');

-- Parent de test (ID 3 pour correspondre aux tests)
INSERT INTO users (id, email, password, firstName, lastName, type, role, phoneNumber) VALUES
(3, 'ahmid.aitouali@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'AHMID', 'AIT OUALI', 'parent', 'admin', '+33695421608');

-- Enfant de test (ID 12 pour correspondre aux tests)
INSERT INTO users (id, firstName, lastName, dateOfBirth, type, role, levelId, parentId) VALUES
(12, 'AA', 'AA', '2019-06-02', 'child', 'user', 1, 3);

-- Cours de test
INSERT INTO courses (title, description, categoryId, levelId, isActive) VALUES
('Les salutations en arabe', 'Apprenez les salutations de base en arabe', 1, 1, 1);

-- Leçon de test
INSERT INTO lessons (title, content, videoUrl, fileUrl, `order`, courseId) VALUES
('Les salutations en arabe', 'Apprenez les salutations de base en arabe', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 'https://example.com/lesson1.pdf', 1, 1);

-- Exercice de test
INSERT INTO exercises (title, description, type, `order`, lessonId) VALUES
('Flashcards - Vocabulaire de base', 'Mémorisez les mots arabes de base', 'flashcard', 1, 1);

-- Questions de test
INSERT INTO exercise_questions (text, `order`, metadata, exerciseId) VALUES
('Bonjour', 1, '{"pronunciation":"marhaban","difficulty":"easy"}', 1),
('Merci', 2, '{"pronunciation":"shukran","difficulty":"easy"}', 1),
('Au revoir', 3, '{"pronunciation":"ma\'a as-salama","difficulty":"easy"}', 1);

-- Réponses de test
INSERT INTO exercise_answers (text, isCorrect, `order`, questionId) VALUES
('مرحبا', 1, 1, 1),
('شكرا', 1, 1, 2),
('مع السلامة', 1, 1, 3);
