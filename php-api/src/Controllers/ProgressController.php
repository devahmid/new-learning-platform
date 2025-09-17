<?php

namespace App\Controllers;

use App\Core\Response;
use App\Core\JWT;
use App\Models\StudentProgressAnalytics;
use App\Models\ProgressAchievement;
use App\Models\ProgressSession;
use App\Models\ProgressRecommendation;
use App\Models\ProgressReport;
use App\Models\ProgressNotification;
use App\Models\ProgressInsight;
use App\Models\User;
use App\Models\Course;
use App\Models\Lesson;
use Exception;

class ProgressController
{
    private $analyticsModel;
    private $achievementModel;
    private $sessionModel;
    private $recommendationModel;
    private $reportModel;
    private $notificationModel;
    private $insightModel;

    public function __construct()
    {
        $this->analyticsModel = new StudentProgressAnalytics();
        $this->achievementModel = new ProgressAchievement();
        $this->sessionModel = new ProgressSession();
        $this->recommendationModel = new ProgressRecommendation();
        $this->reportModel = new ProgressReport();
        $this->notificationModel = new ProgressNotification();
        $this->insightModel = new ProgressInsight();
    }

    /**
     * Récupérer la progression détaillée d'un enfant
     * GET /api/progress/child/{childId}/detailed
     */
    public function getChildDetailedProgress($childId)
    {
        try {
            $currentUser = JWT::requireAuth();
            
            // Vérifier que l'utilisateur est parent de cet enfant ou admin
            if (!$this->canAccessChildProgress($currentUser, $childId)) {
                Response::forbidden('Accès non autorisé à cette progression');
                return;
            }

            // Récupérer les analytics détaillées
            $analytics = $this->analyticsModel->getDetailedAnalytics($childId);
            
            // Récupérer les achievements
            $achievements = $this->achievementModel->getByUserId($childId);
            
            // Récupérer les statistiques globales
            $globalStats = $this->analyticsModel->getGlobalStats($childId);
            
            // Récupérer les sessions récentes
            $recentSessions = $this->sessionModel->getByUserId($childId, 10);
            
            // Récupérer les recommandations actives
            $recommendations = $this->recommendationModel->getActiveByUserId($childId);
            
            // Récupérer les insights
            $insights = $this->insightModel->getByUserId($childId);

            $response = [
                'childId' => $childId,
                'analytics' => $analytics,
                'achievements' => $achievements,
                'globalStats' => $globalStats,
                'recentSessions' => $recentSessions,
                'recommendations' => $recommendations,
                'insights' => $insights,
                'lastUpdated' => date('Y-m-d H:i:s')
            ];

            Response::json($response, 200);

        } catch (Exception $e) {
            error_log("GetChildDetailedProgress - Erreur: " . $e->getMessage());
            Response::error('Erreur lors de la récupération de la progression', 500);
        }
    }

    /**
     * Récupérer la vue d'ensemble pour les parents
     * GET /api/progress/parent/overview
     */
    public function getParentOverview()
    {
        try {
            $currentUser = JWT::requireAuth();
            
            if ($currentUser['role'] !== 'parent') {
                Response::forbidden('Accès réservé aux parents');
                return;
            }

            // Récupérer les enfants du parent
            $userModel = new User();
            $children = $userModel->getChildrenByParentId($currentUser['id']);

            $childrenOverview = [];
            foreach ($children as $child) {
                $globalStats = $this->analyticsModel->getGlobalStats($child['id']);
                $recentActivity = $this->sessionModel->getByUserId($child['id'], 1);
                
                $childrenOverview[] = [
                    'childId' => $child['id'],
                    'childName' => $child['firstName'] . ' ' . $child['lastName'],
                    'overallProgress' => $globalStats['totalLessons'] > 0 
                        ? round(($globalStats['totalLessonsCompleted'] / $globalStats['totalLessons']) * 100, 2)
                        : 0,
                    'coursesInProgress' => $globalStats['totalCourses'] ?? 0,
                    'lastActivity' => $recentActivity[0]['sessionStart'] ?? null,
                    'needsAttention' => $this->needsAttention($child['id']),
                    'globalAverageScore' => $globalStats['globalAverageScore'] ?? 0,
                    'studyStreak' => $globalStats['bestStreak'] ?? 0
                ];
            }

            Response::json([
                'childrenOverview' => $childrenOverview,
                'totalChildren' => count($children),
                'lastUpdated' => date('Y-m-d H:i:s')
            ], 200);

        } catch (Exception $e) {
            error_log("GetParentOverview - Erreur: " . $e->getMessage());
            Response::error('Erreur lors de la récupération de la vue d\'ensemble', 500);
        }
    }

    /**
     * Démarrer une session d'étude
     * POST /api/progress/session/start
     */
    public function startStudySession()
    {
        try {
            $currentUser = JWT::requireAuth();
            $data = json_decode(file_get_contents('php://input'), true);

            $sessionData = [
                'userId' => $currentUser['id'],
                'courseId' => $data['courseId'] ?? null,
                'lessonId' => $data['lessonId'] ?? null,
                'sessionType' => $data['sessionType'] ?? 'lesson',
                'progressStart' => $data['progressStart'] ?? 0.00,
                'deviceType' => $data['deviceType'] ?? 'desktop',
                'browserInfo' => $_SERVER['HTTP_USER_AGENT'] ?? null,
                'ipAddress' => $_SERVER['REMOTE_ADDR'] ?? null
            ];

            $sessionId = $this->sessionModel->startSession($sessionData);

            if ($sessionId) {
                Response::json([
                    'sessionId' => $sessionId,
                    'message' => 'Session démarrée avec succès'
                ], 201);
            } else {
                Response::error('Erreur lors du démarrage de la session', 500);
            }

        } catch (Exception $e) {
            error_log("StartStudySession - Erreur: " . $e->getMessage());
            Response::error('Erreur lors du démarrage de la session', 500);
        }
    }

    /**
     * Terminer une session d'étude
     * POST /api/progress/session/{sessionId}/end
     */
    public function endStudySession($sessionId)
    {
        try {
            $currentUser = JWT::requireAuth();
            $data = json_decode(file_get_contents('php://input'), true);

            $sessionData = [
                'sessionEnd' => date('Y-m-d H:i:s'),
                'progressEnd' => $data['progressEnd'] ?? 0.00,
                'score' => $data['score'] ?? null,
                'attempts' => $data['attempts'] ?? 1,
                'timePerQuestion' => $data['timePerQuestion'] ?? null
            ];

            $result = $this->sessionModel->endSession($sessionId, $sessionData);

            if ($result) {
                // Mettre à jour les analytics
                $this->updateProgressAnalytics($currentUser['id'], $data);
                
                // Vérifier les achievements
                $this->checkAchievements($currentUser['id']);

                Response::json([
                    'message' => 'Session terminée avec succès'
                ], 200);
            } else {
                Response::error('Erreur lors de la finalisation de la session', 500);
            }

        } catch (Exception $e) {
            error_log("EndStudySession - Erreur: " . $e->getMessage());
            Response::error('Erreur lors de la finalisation de la session', 500);
        }
    }

    /**
     * Récupérer les rapports de progression
     * GET /api/progress/child/{childId}/reports
     */
    public function getProgressReports($childId)
    {
        try {
            $currentUser = JWT::requireAuth();
            
            if (!$this->canAccessChildProgress($currentUser, $childId)) {
                Response::forbidden('Accès non autorisé');
                return;
            }

            $period = $_GET['period'] ?? 'week';
            $reports = $this->reportModel->getByUserId($childId, $period);

            Response::json($reports, 200);

        } catch (Exception $e) {
            error_log("GetProgressReports - Erreur: " . $e->getMessage());
            Response::error('Erreur lors de la récupération des rapports', 500);
        }
    }

    /**
     * Récupérer les analytics d'un enfant
     * GET /api/progress/child/{childId}/analytics
     */
    public function getChildAnalytics($childId)
    {
        try {
            $currentUser = JWT::requireAuth();
            
            if (!$this->canAccessChildProgress($currentUser, $childId)) {
                Response::forbidden('Accès non autorisé');
                return;
            }

            $period = $_GET['period'] ?? 'week';
            $analytics = $this->analyticsModel->getByUserId($childId);
            $sessionStats = $this->sessionModel->getSessionStats($childId, $period);
            $studyPatterns = $this->sessionModel->getStudyPatterns($childId);
            $difficultyAnalysis = $this->analyticsModel->getDifficultyAnalysis($childId);

            Response::json([
                'analytics' => $analytics,
                'sessionStats' => $sessionStats,
                'studyPatterns' => $studyPatterns,
                'difficultyAnalysis' => $difficultyAnalysis
            ], 200);

        } catch (Exception $e) {
            error_log("GetChildAnalytics - Erreur: " . $e->getMessage());
            Response::error('Erreur lors de la récupération des analytics', 500);
        }
    }

    /**
     * Vérifier si l'utilisateur peut accéder à la progression d'un enfant
     */
    private function canAccessChildProgress($currentUser, $childId)
    {
        // Admin peut tout voir
        if ($currentUser['role'] === 'admin') {
            return true;
        }

        // Parent peut voir ses enfants
        if ($currentUser['role'] === 'parent') {
            $userModel = new User();
            $children = $userModel->getChildrenByParentId($currentUser['id']);
            foreach ($children as $child) {
                if ($child['id'] == $childId) {
                    return true;
                }
            }
        }

        // L'enfant peut voir sa propre progression
        if ($currentUser['id'] == $childId) {
            return true;
        }

        return false;
    }

    /**
     * Vérifier si un enfant a besoin d'attention
     */
    private function needsAttention($childId)
    {
        $analytics = $this->analyticsModel->getByUserId($childId);
        
        foreach ($analytics as $analytic) {
            if ($analytic['needsReview'] || $analytic['needsPractice']) {
                return true;
            }
        }

        return false;
    }

    /**
     * Mettre à jour les analytics de progression
     */
    private function updateProgressAnalytics($userId, $sessionData)
    {
        // Logique pour mettre à jour les analytics basée sur la session
        // Cette méthode sera implémentée selon les besoins spécifiques
    }

    /**
     * Vérifier et débloquer les achievements
     */
    private function checkAchievements($userId)
    {
        $analytics = $this->analyticsModel->getByUserId($userId);
        
        foreach ($analytics as $analytic) {
            $this->achievementModel->checkAutomaticAchievements($userId, $analytic);
        }
    }
}
