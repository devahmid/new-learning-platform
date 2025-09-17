<?php
// Script pour vérifier et créer les tables de progression

require_once 'config/database.php';

try {
    $db = DatabaseConfig::getInstance()->getConnection();
    echo "✅ Connexion à la base de données réussie\n";
    
    // Vérifier si les tables existent
    $tables = ['quiz_progress', 'exercise_progress'];
    
    foreach ($tables as $table) {
        $stmt = $db->prepare("SHOW TABLES LIKE ?");
        $stmt->execute([$table]);
        $exists = $stmt->fetch();
        
        if ($exists) {
            echo "✅ Table $table existe\n";
        } else {
            echo "❌ Table $table n'existe pas\n";
        }
    }
    
    // Créer les tables si elles n'existent pas
    $sql = "
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
    ";
    
    $db->exec($sql);
    echo "✅ Tables créées avec succès\n";
    
} catch (Exception $e) {
    echo "❌ Erreur: " . $e->getMessage() . "\n";
}
?>
