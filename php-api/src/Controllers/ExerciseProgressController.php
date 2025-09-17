<?php

namespace App\Controllers;

use App\Utils\Response;
use App\Utils\JWT;
use App\Models\ExerciseProgress;

/**
 * Contrôleur pour la gestion de la progression des exercices
 */
class ExerciseProgressController {
    private $jwt;

    public function __construct() {
        $this->jwt = new JWT();
    }

    /**
     * Sauvegarder la progression d'un exercice
     * POST /api/exercise/{id}/submit
     */
    public function submitExercise($exerciseId) {
        try {
            error_log("ExerciseProgressController::submitExercise appelé avec exerciseId: " . $exerciseId);
            
            // Vérifier l'authentification (temporairement désactivé pour debug)
            // $user = $this->jwt->validateToken();
            // if (!$user) {
            //     return Response::error('Non autorisé', 401);
            // }
            $user = ['id' => 42]; // Utilisateur de test temporaire

            // Récupérer les données de la requête
            $input = json_decode(file_get_contents('php://input'), true);
            error_log("Données reçues: " . json_encode($input));
            
            if (!$input) {
                return Response::error('Données invalides', 400);
            }

            // Valider les données requises
            $requiredFields = ['lessonId', 'exerciseType', 'score', 'answers', 'totalQuestions'];
            foreach ($requiredFields as $field) {
                if (!isset($input[$field])) {
                    return Response::error("Champ manquant: $field", 400);
                }
            }

            $lessonId = (int) $input['lessonId'];
            $exerciseType = $input['exerciseType'];
            $score = (int) $input['score'];
            $answers = $input['answers'];
            $totalQuestions = (int) $input['totalQuestions'];
            $completedAt = $input['completedAt'] ?? date('Y-m-d H:i:s');

            // Valider le type d'exercice
            $allowedTypes = ['flashcard', 'translation', 'listening'];
            if (!in_array($exerciseType, $allowedTypes)) {
                return Response::error('Type d\'exercice invalide', 400);
            }

            // Préparer les données pour la sauvegarde
            $progressData = [
                'exerciseId' => (int) $exerciseId,
                'userId' => $user['id'],
                'lessonId' => $lessonId,
                'exerciseType' => $exerciseType,
                'score' => $score,
                'answers' => $answers,
                'totalQuestions' => $totalQuestions,
                'completedAt' => $completedAt
            ];

            // Sauvegarder la progression
            $progressId = ExerciseProgress::create($progressData);
            
            if (!$progressId) {
                return Response::error('Erreur lors de la sauvegarde', 500);
            }

            // Récupérer la progression sauvegardée
            $savedProgress = ExerciseProgress::findById($progressId);
            
            // Décoder les réponses JSON
            $savedProgress['answers'] = json_decode($savedProgress['answers'], true);

            $response = [
                'progress' => $savedProgress,
                'exercise' => [
                    'id' => $exerciseId,
                    'type' => $exerciseType
                ],
                'lesson' => [
                    'id' => $lessonId,
                    'title' => 'Leçon de test'
                ]
            ];

            return Response::success($response, 'Progression de l\'exercice sauvegardée avec succès');

        } catch (\Exception $e) {
            error_log("Erreur ExerciseProgressController::submitExercise: " . $e->getMessage());
            return Response::error('Erreur interne du serveur', 500);
        }
    }

    /**
     * Récupérer la progression d'un exercice spécifique
     * GET /api/exercise/{id}/progress
     */
    public function getExerciseProgress($exerciseId) {
        try {
            // Vérifier l'authentification
            $user = $this->jwt->validateToken();
            if (!$user) {
                return Response::error('Non autorisé', 401);
            }

            // Récupérer les progressions pour cet exercice et cet utilisateur
            $progress = ExerciseProgress::findByUser($user['id']);
            
            // Filtrer par exerciseId si nécessaire
            $exerciseProgress = array_filter($progress, function($p) use ($exerciseId) {
                return $p['exerciseId'] == $exerciseId;
            });

            return Response::success(array_values($exerciseProgress), 'Progression récupérée avec succès');

        } catch (\Exception $e) {
            error_log("Erreur ExerciseProgressController::getExerciseProgress: " . $e->getMessage());
            return Response::error('Erreur interne du serveur', 500);
        }
    }

    /**
     * Récupérer toutes les progressions d'exercices d'un utilisateur
     * GET /api/exercise/progress/user
     */
    public function getUserExerciseProgress() {
        try {
            // Vérifier l'authentification (temporairement désactivé pour debug)
            // $user = $this->jwt->validateToken();
            // if (!$user) {
            //     return Response::error('Non autorisé', 401);
            // }
            $user = ['id' => 42]; // Utilisateur de test temporaire

            $progress = ExerciseProgress::findByUser($user['id']);
            
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
            error_log("Erreur ExerciseProgressController::getUserExerciseProgress: " . $e->getMessage());
            return Response::error('Erreur interne du serveur', 500);
        }
    }

    /**
     * Récupérer les statistiques de progression des exercices
     * GET /api/exercise/progress/stats
     */
    public function getExerciseProgressStats() {
        try {
            // Vérifier l'authentification
            $user = $this->jwt->validateToken();
            if (!$user) {
                return Response::error('Non autorisé', 401);
            }

            $stats = ExerciseProgress::getStats($user['id']);
            
            // Calculer la progression mensuelle
            $monthlyProgress = [
                [
                    'month' => date('Y-m'),
                    'exerciseCount' => $stats['totalExercises'],
                    'averageScore' => $stats['averageScore']
                ]
            ];

            $response = [
                'stats' => $stats,
                'monthlyProgress' => $monthlyProgress
            ];

            return Response::success($response, 'Statistiques récupérées avec succès');

        } catch (\Exception $e) {
            error_log("Erreur ExerciseProgressController::getExerciseProgressStats: " . $e->getMessage());
            return Response::error('Erreur interne du serveur', 500);
        }
    }

    /**
     * Récupérer les progressions par type d'exercice
     * GET /api/exercise/progress/type/{type}
     */
    public function getProgressByType($type) {
        try {
            // Vérifier l'authentification
            $user = $this->jwt->validateToken();
            if (!$user) {
                return Response::error('Non autorisé', 401);
            }

            // Valider le type d'exercice
            $allowedTypes = ['flashcard', 'translation', 'listening'];
            if (!in_array($type, $allowedTypes)) {
                return Response::error('Type d\'exercice invalide', 400);
            }

            $progress = ExerciseProgress::findByType($user['id'], $type);
            
            // Décoder les réponses JSON
            foreach ($progress as &$p) {
                $p['answers'] = json_decode($p['answers'], true);
            }

            return Response::success($progress, 'Progressions récupérées avec succès');

        } catch (\Exception $e) {
            error_log("Erreur ExerciseProgressController::getProgressByType: " . $e->getMessage());
            return Response::error('Erreur interne du serveur', 500);
        }
    }
}