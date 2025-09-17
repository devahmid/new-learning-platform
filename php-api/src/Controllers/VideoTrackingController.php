<?php

namespace App\Controllers;

use App\Models\VideoWatchSession;
use App\Models\VideoWatchEvent;
use App\Models\VideoAnalytics;
use App\Core\BaseController;

class VideoTrackingController extends BaseController
{
    private $videoWatchSession;
    private $videoWatchEvent;
    private $videoAnalytics;

    public function __construct()
    {
        parent::__construct();
        $this->videoWatchSession = new VideoWatchSession($this->db);
        $this->videoWatchEvent = new VideoWatchEvent($this->db);
        $this->videoAnalytics = new VideoAnalytics($this->db);
    }

    /**
     * Démarrer une session de visionnage
     */
    public function startSession()
    {
        try {
            $data = $this->getRequestData();
            
            // Validation des données requises
            $requiredFields = ['userId', 'lessonId', 'videoUrl', 'totalDuration'];
            foreach ($requiredFields as $field) {
                if (!isset($data[$field])) {
                    $this->sendError("Champ requis manquant: $field", 400);
                    return;
                }
            }

            // Démarrer la session
            $sessionId = $this->videoWatchSession->startSession($data);
            
            if ($sessionId) {
                $session = $this->videoWatchSession->getById($sessionId);
                $this->sendSuccess($session, 'Session de visionnage démarrée');
            } else {
                $this->sendError('Erreur lors du démarrage de la session', 500);
            }
        } catch (Exception $e) {
            $this->sendError('Erreur serveur: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Enregistrer un événement de visionnage
     */
    public function recordEvent()
    {
        try {
            $data = $this->getRequestData();
            
            // Validation des données requises
            $requiredFields = ['sessionId', 'userId', 'lessonId', 'eventType', 'timestamp'];
            foreach ($requiredFields as $field) {
                if (!isset($data[$field])) {
                    $this->sendError("Champ requis manquant: $field", 400);
                    return;
                }
            }

            // Enregistrer l'événement
            $result = $this->videoWatchEvent->recordEvent($data);
            
            if ($result) {
                $this->sendSuccess(['eventRecorded' => true], 'Événement enregistré');
            } else {
                $this->sendError('Erreur lors de l\'enregistrement de l\'événement', 500);
            }
        } catch (Exception $e) {
            $this->sendError('Erreur serveur: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Mettre à jour une session de visionnage
     */
    public function updateSession($sessionId)
    {
        try {
            $data = $this->getRequestData();
            
            // Mettre à jour la session
            $result = $this->videoWatchSession->updateSession($sessionId, $data);
            
            if ($result) {
                $this->sendSuccess(['sessionUpdated' => true], 'Session mise à jour');
            } else {
                $this->sendError('Erreur lors de la mise à jour de la session', 500);
            }
        } catch (Exception $e) {
            $this->sendError('Erreur serveur: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Terminer une session de visionnage
     */
    public function endSession($sessionId)
    {
        try {
            $data = $this->getRequestData();
            
            // Terminer la session
            $result = $this->videoWatchSession->endSession($sessionId, $data);
            
            if ($result) {
                // Mettre à jour les analytics
                $this->updateVideoAnalytics($data['userId'], $data['lessonId']);
                
                $this->sendSuccess(['sessionEnded' => true], 'Session terminée');
            } else {
                $this->sendError('Erreur lors de la fin de la session', 500);
            }
        } catch (Exception $e) {
            $this->sendError('Erreur serveur: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Récupérer la session active d'un utilisateur
     */
    public function getActiveSession($lessonId)
    {
        try {
            $userId = $this->getCurrentUserId();
            
            if (!$userId) {
                $this->sendError('Utilisateur non authentifié', 401);
                return;
            }

            $session = $this->videoWatchSession->getActiveSession($userId, $lessonId);
            
            if ($session) {
                $this->sendSuccess($session, 'Session active trouvée');
            } else {
                $this->sendSuccess(null, 'Aucune session active');
            }
        } catch (Exception $e) {
            $this->sendError('Erreur serveur: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Récupérer les statistiques de visionnage
     */
    public function getWatchStats($userId, $period = 'week')
    {
        try {
            $stats = $this->videoWatchSession->getWatchStats($userId, $period);
            $this->sendSuccess($stats, 'Statistiques récupérées');
        } catch (Exception $e) {
            $this->sendError('Erreur serveur: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Récupérer les leçons les plus regardées
     */
    public function getMostWatchedLessons($userId, $limit = 10)
    {
        try {
            $lessons = $this->videoWatchSession->getMostWatchedLessons($userId, $limit);
            $this->sendSuccess($lessons, 'Leçons les plus regardées');
        } catch (Exception $e) {
            $this->sendError('Erreur serveur: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Récupérer les analytics vidéo détaillées
     */
    public function getVideoAnalytics($userId, $lessonId)
    {
        try {
            $analytics = $this->videoAnalytics->getByUserAndLesson($userId, $lessonId);
            
            if (!$analytics) {
                // Créer des analytics vides si elles n'existent pas
                $analytics = $this->videoAnalytics->createEmpty($userId, $lessonId);
            }
            
            $this->sendSuccess($analytics, 'Analytics vidéo récupérées');
        } catch (Exception $e) {
            $this->sendError('Erreur serveur: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Mettre à jour les analytics vidéo
     */
    private function updateVideoAnalytics($userId, $lessonId)
    {
        try {
            // Récupérer les sessions de cette leçon
            $sessions = $this->videoWatchSession->getByLessonId($lessonId, $userId);
            
            if (empty($sessions)) {
                return;
            }

            // Calculer les statistiques
            $totalWatchTime = array_sum(array_column($sessions, 'watchedDuration'));
            $totalSessions = count($sessions);
            $averageWatchTime = $totalSessions > 0 ? $totalWatchTime / $totalSessions : 0;
            $completedSessions = count(array_filter($sessions, function($s) { return $s['isCompleted']; }));
            $completionRate = $totalSessions > 0 ? ($completedSessions / $totalSessions) * 100 : 0;

            // Calculer les patterns
            $averagePauseCount = array_sum(array_column($sessions, 'pauseCount')) / $totalSessions;
            $averageSeekCount = array_sum(array_column($sessions, 'seekCount')) / $totalSessions;
            $averageReplayCount = array_sum(array_column($sessions, 'replayCount')) / $totalSessions;

            // Mettre à jour ou créer les analytics
            $analyticsData = [
                'totalWatchTime' => $totalWatchTime,
                'totalSessions' => $totalSessions,
                'averageWatchTime' => $averageWatchTime,
                'completionRate' => $completionRate,
                'averagePauseCount' => $averagePauseCount,
                'averageSeekCount' => $averageSeekCount,
                'averageReplayCount' => $averageReplayCount,
                'lastWatchedAt' => date('Y-m-d H:i:s')
            ];

            $this->videoAnalytics->updateOrCreate($userId, $lessonId, $analyticsData);
        } catch (Exception $e) {
            error_log('Erreur lors de la mise à jour des analytics: ' . $e->getMessage());
        }
    }

    /**
     * Obtenir l'ID de l'utilisateur actuel
     */
    private function getCurrentUserId()
    {
        // Implémentation selon votre système d'authentification
        $headers = getallheaders();
        $token = $headers['Authorization'] ?? '';
        
        if (empty($token)) {
            return null;
        }

        // Décoder le token JWT et récupérer l'ID utilisateur
        // Cette partie dépend de votre implémentation JWT
        return 1; // Temporaire pour les tests
    }
}
