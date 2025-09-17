<?php

namespace App\Controllers;

use App\Utils\Response;
use App\Utils\JWT;
use App\Models\QuizProgress;

/**
 * Contrôleur pour la gestion de la progression des quiz
 */
class QuizProgressController {
    private $jwt;

    public function __construct() {
        $this->jwt = new JWT();
    }

    /**
     * S'assurer que les tables de progression existent
     */
    private function ensureTablesExist() {
        try {
            $db = \DatabaseConfig::getInstance()->getConnection();
            
            // Vérifier si la table quiz_progress existe
            $stmt = $db->prepare("SHOW TABLES LIKE 'quiz_progress'");
            $stmt->execute();
            $quizTableExists = $stmt->fetch();
            
            if (!$quizTableExists) {
                $sql = "CREATE TABLE quiz_progress (
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
                )";
                $db->exec($sql);
                error_log("Table quiz_progress créée");
            }
            
            // Vérifier si la table exercise_progress existe
            $stmt = $db->prepare("SHOW TABLES LIKE 'exercise_progress'");
            $stmt->execute();
            $exerciseTableExists = $stmt->fetch();
            
            if (!$exerciseTableExists) {
                $sql = "CREATE TABLE exercise_progress (
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
                )";
                $db->exec($sql);
                error_log("Table exercise_progress créée");
            }
            
        } catch (\Exception $e) {
            error_log("Erreur lors de la création des tables: " . $e->getMessage());
        }
    }

    /**
     * Sauvegarder la progression d'un quiz
     * POST /api/quiz/{id}/submit
     */
    public function submitQuiz($quizId) {
        try {
            error_log("QuizProgressController::submitQuiz appelé avec quizId: " . $quizId);
            
            // Vérifier l'authentification (temporairement désactivé pour debug)
            // $user = $this->jwt->validateToken();
            // if (!$user) {
            //     return Response::error('Non autorisé', 401);
            // }
            $user = ['id' => 42]; // Utilisateur de test temporaire

            // Créer les tables si elles n'existent pas
            $this->ensureTablesExist();

            // Récupérer les données de la requête
            $input = json_decode(file_get_contents('php://input'), true);
            error_log("Données reçues: " . json_encode($input));
            
            if (!$input) {
                return Response::error('Données invalides', 400);
            }

            // Valider les données requises
            $requiredFields = ['lessonId', 'score', 'answers', 'totalQuestions'];
            foreach ($requiredFields as $field) {
                if (!isset($input[$field])) {
                    return Response::error("Champ manquant: $field", 400);
                }
            }

            $lessonId = (int) $input['lessonId'];
            $score = (int) $input['score'];
            $answers = $input['answers'];
            $totalQuestions = (int) $input['totalQuestions'];
            $completedAt = $input['completedAt'] ?? date('Y-m-d H:i:s');

            // Préparer les données pour la sauvegarde
            $progressData = [
                'quizId' => (int) $quizId,
                'userId' => $user['id'],
                'lessonId' => $lessonId,
                'score' => $score,
                'answers' => $answers,
                'totalQuestions' => $totalQuestions,
                'completedAt' => $completedAt
            ];

            // Sauvegarder la progression
            $progressId = QuizProgress::create($progressData);
            
            if (!$progressId) {
                return Response::error('Erreur lors de la sauvegarde', 500);
            }

            // Récupérer la progression sauvegardée
            $savedProgress = QuizProgress::findById($progressId);
            
            // Décoder les réponses JSON
            $savedProgress['answers'] = json_decode($savedProgress['answers'], true);

            $response = [
                'progress' => $savedProgress,
                'quiz' => [
                    'id' => $quizId,
                    'title' => 'Quiz de test'
                ],
                'lesson' => [
                    'id' => $lessonId,
                    'title' => 'Leçon de test'
                ]
            ];

            // Retourner directement la réponse JSON
            header('Content-Type: application/json');
            echo json_encode([
                'success' => true,
                'message' => 'Progression du quiz sauvegardée avec succès',
                'data' => $response
            ]);
            exit;

        } catch (\Exception $e) {
            error_log("Erreur QuizProgressController::submitQuiz: " . $e->getMessage());
            return Response::error('Erreur interne du serveur', 500);
        }
    }

    /**
     * Récupérer la progression d'un quiz spécifique
     * GET /api/quiz/{id}/progress
     */
    public function getQuizProgress($quizId) {
        try {
            // Vérifier l'authentification
            $user = $this->jwt->validateToken();
            if (!$user) {
                return Response::error('Non autorisé', 401);
            }

            // Récupérer les progressions pour ce quiz et cet utilisateur
            $progress = QuizProgress::findByUser($user['id']);
            
            // Filtrer par quizId si nécessaire
            $quizProgress = array_filter($progress, function($p) use ($quizId) {
                return $p['quizId'] == $quizId;
            });

            return Response::success(array_values($quizProgress), 'Progression récupérée avec succès');

        } catch (\Exception $e) {
            error_log("Erreur QuizProgressController::getQuizProgress: " . $e->getMessage());
            return Response::error('Erreur interne du serveur', 500);
        }
    }

    /**
     * Récupérer toutes les progressions de quiz d'un utilisateur
     * GET /api/quiz/progress/user
     */
    public function getUserQuizProgress() {
        try {
            // Vérifier l'authentification (temporairement désactivé pour debug)
            // $user = $this->jwt->validateToken();
            // if (!$user) {
            //     return Response::error('Non autorisé', 401);
            // }
            $user = ['id' => 42]; // Utilisateur de test temporaire

            $progress = QuizProgress::findByUser($user['id']);
            
            // Décoder les réponses JSON
            foreach ($progress as &$p) {
                $p['answers'] = json_decode($p['answers'], true);
            }

            // Retourner directement la réponse JSON
            header('Content-Type: application/json');
            echo json_encode([
                'success' => true,
                'message' => 'Progressions récupérées avec succès',
                'data' => $progress
            ]);
            exit;

        } catch (\Exception $e) {
            error_log("Erreur QuizProgressController::getUserQuizProgress: " . $e->getMessage());
            return Response::error('Erreur interne du serveur', 500);
        }
    }

    /**
     * Récupérer les statistiques de progression des quiz
     * GET /api/quiz/progress/stats
     */
    public function getQuizProgressStats() {
        try {
            // Vérifier l'authentification (temporairement désactivé pour debug)
            // $user = $this->jwt->validateToken();
            // if (!$user) {
            //     return Response::error('Non autorisé', 401);
            // }
            $user = ['id' => 42]; // Utilisateur de test temporaire

            $stats = QuizProgress::getStats($user['id']);
            
            // Calculer la progression mensuelle
            $monthlyProgress = [
                [
                    'month' => date('Y-m'),
                    'quizCount' => $stats['totalQuizzes'],
                    'averageScore' => $stats['averageScore']
                ]
            ];

            $response = [
                'stats' => $stats,
                'monthlyProgress' => $monthlyProgress
            ];

            // Retourner directement la réponse JSON
            header('Content-Type: application/json');
            echo json_encode([
                'success' => true,
                'message' => 'Statistiques récupérées avec succès',
                'data' => $response
            ]);
            exit;

        } catch (\Exception $e) {
            error_log("Erreur QuizProgressController::getQuizProgressStats: " . $e->getMessage());
            // Retourner directement la réponse JSON même en cas d'erreur
            header('Content-Type: application/json');
            echo json_encode([
                'success' => false,
                'message' => 'Erreur interne du serveur: ' . $e->getMessage(),
                'data' => null
            ]);
            exit;
        }
    }
}