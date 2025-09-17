<?php
// Script de test pour la création de quiz
require_once 'config/autoloader.php';

use App\Controllers\AdminCourseController;

// Données de test pour un quiz
$testData = [
    'title' => 'Test Quiz Creation',
    'description' => 'Test de création de quiz',
    'categoryId' => '1',
    'subcategoryId' => '2', 
    'levelId' => '1',
    'videoUrl' => '',
    'pdfUrl' => '',
    'lessons' => [
        [
            'title' => 'Leçon de test',
            'content' => 'Contenu de test',
            'videoUrl' => '',
            'fileUrl' => '',
            'order' => 1,
            'duration' => 30
        ]
    ],
    'quizzes' => [
        [
            'title' => 'Quiz de test',
            'description' => 'Description du quiz de test',
            'timeLimit' => 15,
            'passingScore' => 70,
            'questions' => [
                [
                    'text' => 'Question de test 1 ?',
                    'options' => [
                        ['text' => 'Réponse A', 'isCorrect' => false],
                        ['text' => 'Réponse B', 'isCorrect' => true],
                        ['text' => 'Réponse C', 'isCorrect' => false],
                        ['text' => 'Réponse D', 'isCorrect' => false]
                    ]
                ],
                [
                    'text' => 'Question de test 2 ?',
                    'options' => [
                        ['text' => 'Réponse A', 'isCorrect' => true],
                        ['text' => 'Réponse B', 'isCorrect' => false],
                        ['text' => 'Réponse C', 'isCorrect' => false]
                    ]
                ]
            ]
        ]
    ],
    'exercises' => []
];

try {
    echo "=== TEST DE CRÉATION DE QUIZ ===\n";
    
    // Vérifier la connexion à la base de données
    $db = \DatabaseConfig::getInstance()->getConnection();
    echo "✅ Connexion à la base de données OK\n";
    
    // Vérifier que les tables existent
    $tables = ['quizzes', 'quiz_questions', 'quiz_question_options'];
    foreach ($tables as $table) {
        $stmt = $db->prepare("SHOW TABLES LIKE ?");
        $stmt->execute([$table]);
        if ($stmt->fetch()) {
            echo "✅ Table '$table' existe\n";
        } else {
            echo "❌ Table '$table' n'existe pas\n";
        }
    }
    
    // Tester la création du cours avec quiz
    $controller = new AdminCourseController();
    $result = $controller->createCourse($testData);
    
    if ($result['success']) {
        echo "✅ Création du cours avec quiz réussie\n";
        echo "ID du cours créé: " . $result['data']['id'] . "\n";
        
        // Vérifier que le quiz a été créé
        $courseId = $result['data']['id'];
        $quizStmt = $db->prepare("SELECT * FROM quizzes WHERE courseId = ?");
        $quizStmt->execute([$courseId]);
        $quiz = $quizStmt->fetch();
        
        if ($quiz) {
            echo "✅ Quiz créé avec ID: " . $quiz['id'] . "\n";
            
            // Vérifier les questions
            $questionsStmt = $db->prepare("SELECT * FROM quiz_questions WHERE quizId = ? ORDER BY order_index");
            $questionsStmt->execute([$quiz['id']]);
            $questions = $questionsStmt->fetchAll();
            
            echo "✅ Questions créées: " . count($questions) . "\n";
            
            // Vérifier les options
            foreach ($questions as $question) {
                $optionsStmt = $db->prepare("SELECT * FROM quiz_question_options WHERE questionId = ? ORDER BY order_index");
                $optionsStmt->execute([$question['id']]);
                $options = $optionsStmt->fetchAll();
                echo "  - Question '{$question['text']}': " . count($options) . " options\n";
            }
        } else {
            echo "❌ Aucun quiz trouvé pour le cours\n";
        }
    } else {
        echo "❌ Erreur lors de la création: " . $result['message'] . "\n";
    }
    
} catch (Exception $e) {
    echo "❌ Erreur: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}
