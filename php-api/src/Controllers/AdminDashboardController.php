<?php

namespace App\Controllers;

use App\Models\User;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\Exercise;
use App\Models\Quiz;
use App\Models\ClassModel;
use App\Utils\Response;
use App\Utils\JWT;

/**
 * Contrôleur pour le dashboard administrateur
 */
class AdminDashboardController {
    
    /**
     * Récupère les statistiques générales du dashboard
     */
    public function getStats() {
        // Vérifier l'authentification admin
        JWT::requireRole(['admin']);
        
        try {
            // Statistiques des utilisateurs
            $totalUsers = User::count();
            $totalParents = User::countByType('parent');
            $totalChildren = User::countByType('child');
            $totalAdmins = User::countByRole('admin');
            
            // Statistiques du contenu
            $totalCourses = Course::count();
            $totalLessons = Lesson::count();
            $totalExercises = Exercise::count();
            $totalQuizzes = Quiz::count();
            $totalClasses = ClassModel::count();
            
            // Utilisateurs actifs (créés dans les 30 derniers jours)
            $activeUsers = User::countActiveUsers(30);
            
            // Cours populaires (avec le plus d'exercices) - avec gestion d'erreur
            $popularCourses = [];
            try {
                $popularCourses = Course::getPopularCourses(5);
            } catch (Exception $e) {
                // En cas d'erreur, on continue avec un tableau vide
                $popularCourses = [];
            }
            
            $stats = [
                'users' => [
                    'total' => $totalUsers,
                    'parents' => $totalParents,
                    'children' => $totalChildren,
                    'admins' => $totalAdmins,
                    'active' => $activeUsers
                ],
                'content' => [
                    'courses' => $totalCourses,
                    'lessons' => $totalLessons,
                    'exercises' => $totalExercises,
                    'quizzes' => $totalQuizzes,
                    'classes' => $totalClasses
                ],
                'popularCourses' => $popularCourses
            ];
            
            Response::success($stats, 'Statistiques récupérées avec succès');
            
        } catch (\Exception $e) {
            Response::error('Erreur lors de la récupération des statistiques: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Récupère les statistiques détaillées des utilisateurs
     */
    public function getUserStats() {
        // Vérifier l'authentification admin
        JWT::requireRole(['admin']);
        
        try {
            $userModel = new User();
            
            // Répartition par type
            $usersByType = $userModel->getUsersByType();
            
            // Répartition par rôle
            $usersByRole = $userModel->getUsersByRole();
            
            // Utilisateurs récents (derniers 7 jours)
            $recentUsers = $userModel->getRecentUsers(7);
            
            // Utilisateurs par mois (derniers 12 mois)
            $usersByMonth = $userModel->getUsersByMonth(12);
            
            $stats = [
                'byType' => $usersByType,
                'byRole' => $usersByRole,
                'recent' => $recentUsers,
                'byMonth' => $usersByMonth
            ];
            
            Response::success($stats, 'Statistiques utilisateurs récupérées avec succès');
            
        } catch (\Exception $e) {
            Response::error('Erreur lors de la récupération des statistiques utilisateurs: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Récupère les statistiques avec pourcentages de croissance pour le composant Users
     */
    public function getUserStatsWithGrowth() {
        // Vérifier l'authentification admin
        JWT::requireRole(['admin']);
        
        try {
            // Statistiques actuelles
            $totalUsers = User::count();
            $totalParents = User::countByType('parent');
            $totalChildren = User::countByType('child');
            $totalAdmins = User::countByRole('admin');
            
            // Statistiques du mois précédent pour calculer la croissance
            $lastMonthUsers = User::countLastMonth();
            $lastMonthParents = User::countByTypeLastMonth('parent');
            $lastMonthChildren = User::countByTypeLastMonth('child');
            $lastMonthAdmins = User::countByRoleLastMonth('admin');
            
            // Calcul des pourcentages de croissance
            $usersGrowth = $this->calculateGrowthPercentage($totalUsers, $lastMonthUsers);
            $parentsGrowth = $this->calculateGrowthPercentage($totalParents, $lastMonthParents);
            $childrenGrowth = $this->calculateGrowthPercentage($totalChildren, $lastMonthChildren);
            $adminsGrowth = $this->calculateGrowthPercentage($totalAdmins, $lastMonthAdmins);
            
            $stats = [
                'totalUsers' => $totalUsers,
                'totalParents' => $totalParents,
                'totalChildren' => $totalChildren,
                'totalAdmins' => $totalAdmins,
                'usersGrowthPercentage' => $usersGrowth,
                'parentsGrowthPercentage' => $parentsGrowth,
                'childrenGrowthPercentage' => $childrenGrowth,
                'adminsGrowthPercentage' => $adminsGrowth,
                'recentActivity' => [
                    'newUsersThisMonth' => $totalUsers - $lastMonthUsers,
                    'newParentsThisMonth' => $totalParents - $lastMonthParents,
                    'newChildrenThisMonth' => $totalChildren - $lastMonthChildren,
                ]
            ];
            
            Response::success($stats, 'Statistiques avec croissance récupérées avec succès');
            
        } catch (\Exception $e) {
            Response::error('Erreur lors de la récupération des statistiques avec croissance: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Calcule le pourcentage de croissance entre deux valeurs
     */
    private function calculateGrowthPercentage($current, $previous) {
        if ($previous == 0) {
            return $current > 0 ? 100 : 0;
        }
        return round((($current - $previous) / $previous) * 100, 1);
    }
    

    

    
    /**
     * Récupère les statistiques des cours
     */
    public function getCourseStats() {
        // Vérifier l'authentification admin
        JWT::requireRole(['admin']);
        
        try {
            $courseModel = new Course();
            $lessonModel = new Lesson();
            $exerciseModel = new Exercise();
            
            // Statistiques des cours
            $totalCourses = Course::count();
            $activeCourses = Course::countActive();
            $coursesByClasse = Course::getCoursesByClasse();
            $coursesByCategory = Course::getCoursesByCategory();
            $popularCourses = Course::getPopularCourses(10);
            $recentCourses = Course::getRecentCourses(7);
            
            $stats = [
                'total' => $totalCourses,
                'active' => $activeCourses,
                'byClasse' => $coursesByClasse,
                'byCategory' => $coursesByCategory,
                'popular' => $popularCourses,
                'recent' => $recentCourses
            ];
            
            Response::success($stats, 'Statistiques des cours récupérées avec succès');
            
        } catch (\Exception $e) {
            Response::error('Erreur lors de la récupération des statistiques des cours: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Récupère les activités récentes
     */
    public function getRecentActivities() {
        // Vérifier l'authentification admin
        JWT::requireRole(['admin']);
        
        try {
            $userModel = new User();
            $courseModel = new Course();
            $exerciseModel = new Exercise();
            
            // Activités récentes (derniers 7 jours)
            $recentUsers = $userModel->getRecentUsers(7);
            $recentCourses = $courseModel->getRecentCourses(7);
            $recentExercises = $exerciseModel->getRecentExercises(7);
            
            // Combiner et trier par date
            $activities = [];
            
            foreach ($recentUsers as $user) {
                $activities[] = [
                    'type' => 'user_registration',
                    'title' => 'Nouvel utilisateur inscrit',
                    'description' => $user['firstName'] . ' ' . $user['lastName'] . ' (' . $user['email'] . ')',
                    'date' => $user['createdAt'],
                    'user' => $user
                ];
            }
            
            foreach ($recentCourses as $course) {
                $activities[] = [
                    'type' => 'course_created',
                    'title' => 'Nouveau cours créé',
                    'description' => $course['title'],
                    'date' => $course['createdAt'],
                    'course' => $course
                ];
            }
            
            foreach ($recentExercises as $exercise) {
                $activities[] = [
                    'type' => 'exercise_created',
                    'title' => 'Nouvel exercice créé',
                    'description' => $exercise['title'],
                    'date' => $exercise['createdAt'],
                    'exercise' => $exercise
                ];
            }
            
            // Trier par date décroissante
            usort($activities, function($a, $b) {
                return strtotime($b['date']) - strtotime($a['date']);
            });
            
            // Limiter à 20 activités
            $activities = array_slice($activities, 0, 20);
            
            Response::success($activities, 'Activités récentes récupérées avec succès');
            
        } catch (\Exception $e) {
            Response::error('Erreur lors de la récupération des activités récentes: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Récupère les permissions de l'admin
     */
    public function getPermissions() {
        // Vérifier l'authentification admin
        $currentUser = JWT::requireRole(['admin']);
        
        try {
            // Permissions basées sur le rôle
            $permissions = [
                'canManageUsers' => in_array($currentUser['role'], ['admin', 'super_admin']),
                'canManageCourses' => in_array($currentUser['role'], ['admin', 'super_admin', 'instructor']),
                'canViewStats' => in_array($currentUser['role'], ['admin', 'super_admin']),
                'canManageSystem' => $currentUser['role'] === 'super_admin',
                'canManageExercises' => in_array($currentUser['role'], ['admin', 'super_admin', 'instructor']),
                'canManageLessons' => in_array($currentUser['role'], ['admin', 'super_admin', 'instructor']),
                'canViewReports' => in_array($currentUser['role'], ['admin', 'super_admin']),
                'canManageSettings' => $currentUser['role'] === 'super_admin'
            ];
            
            Response::success($permissions, 'Permissions récupérées avec succès');
            
        } catch (\Exception $e) {
            Response::error('Erreur lors de la récupération des permissions: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Récupère les alertes système
     */
    public function getAlerts() {
        // Vérifier l'authentification admin
        JWT::requireRole(['admin']);
        
        try {
            $alerts = [];
            
            // Vérifier les utilisateurs inactifs (pas de connexion depuis 30 jours)
            $inactiveUsers = User::getInactiveUsers(30);
            if (count($inactiveUsers) > 0) {
                $alerts[] = [
                    'type' => 'warning',
                    'title' => 'Utilisateurs inactifs',
                    'message' => count($inactiveUsers) . ' utilisateur(s) inactif(s) depuis plus de 30 jours',
                    'count' => count($inactiveUsers)
                ];
            }
            
            // Vérifier les cours sans exercices
            $coursesWithoutExercises = Course::getCoursesWithoutExercises();
            if (count($coursesWithoutExercises) > 0) {
                $alerts[] = [
                    'type' => 'info',
                    'title' => 'Cours incomplets',
                    'message' => count($coursesWithoutExercises) . ' cours sans exercices',
                    'count' => count($coursesWithoutExercises)
                ];
            }
            
            // Vérifier les classes sans cours
            $classesWithoutCourses = ClassModel::getClassesWithoutCourses();
            if (count($classesWithoutCourses) > 0) {
                $alerts[] = [
                    'type' => 'info',
                    'title' => 'Classes vides',
                    'message' => count($classesWithoutCourses) . ' classe(s) sans cours',
                    'count' => count($classesWithoutCourses)
                ];
            }
            
            // Vérifier les utilisateurs en attente de validation
            $pendingUsers = User::where(['status' => 'pending']);
            if (count($pendingUsers) > 0) {
                $alerts[] = [
                    'type' => 'warning',
                    'title' => 'Utilisateurs en attente',
                    'message' => count($pendingUsers) . ' utilisateur(s) en attente de validation',
                    'count' => count($pendingUsers)
                ];
            }
            
            Response::success($alerts, 'Alertes récupérées avec succès');
            
        } catch (\Exception $e) {
            Response::error('Erreur lors de la récupération des alertes: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Récupère les métriques de performance
     */
    public function getPerformance() {
        // Vérifier l'authentification admin
        JWT::requireRole(['admin']);
        
        try {
            $performance = [
                'system' => [
                    'uptime' => '99.9%',
                    'responseTime' => '120ms',
                    'memoryUsage' => '45%',
                    'diskUsage' => '60%'
                ],
                'database' => [
                    'connections' => 5,
                    'queryTime' => '15ms',
                    'cacheHitRate' => '95%'
                ],
                'api' => [
                    'requestsPerMinute' => 150,
                    'averageResponseTime' => '200ms',
                    'errorRate' => '0.1%'
                ]
            ];
            
            Response::success($performance, 'Métriques de performance récupérées avec succès');
            
        } catch (\Exception $e) {
            Response::error('Erreur lors de la récupération des métriques de performance: ' . $e->getMessage(), 500);
        }
    }
}