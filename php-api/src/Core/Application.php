<?php

namespace App\Core;

use App\Utils\Response;

/**
 * Classe principale de l'application
 * Gère le routage et l'initialisation
 */
class Application {
    private $routes = [];
    
    public function __construct() {
        $this->initializeRoutes();
    }
    
    /**
     * Initialise toutes les routes de l'API
     */
    private function initializeRoutes() {
        // Initialiser les tableaux de routes pour chaque méthode HTTP
        $this->routes = [
            'GET' => [],
            'POST' => [],
            'PUT' => [],
            'PATCH' => [],
            'DELETE' => []
        ];
        // Routes d'authentification
        $this->routes['POST']['/api/auth/login'] = ['App\Controllers\AuthController', 'login'];
        $this->routes['POST']['/api/auth/register'] = ['App\Controllers\AuthController', 'register'];
        $this->routes['POST']['/api/auth/request-password-reset'] = ['App\Controllers\AuthController', 'requestPasswordReset'];
        $this->routes['POST']['/api/auth/reset-password'] = ['App\Controllers\AuthController', 'resetPassword'];
        
        // Routes utilisateurs
        $this->routes['GET']['/api/users'] = ['App\Controllers\UserController', 'findAll'];
        $this->routes['GET']['/api/users/me'] = ['App\Controllers\UserController', 'getMe'];
        $this->routes['GET']['/api/users/me/children'] = ['App\Controllers\UserController', 'getMyChildren'];
        $this->routes['GET']['/api/users/children/{id}/stats'] = ['App\Controllers\UserController', 'getChildStats'];
        $this->routes['GET']['/api/users/me/children/stats'] = ['App\Controllers\UserController', 'getMyChildrenStats'];
        
        // Routes de réinitialisation de mot de passe (compatibilité frontend) - AVANT les routes dynamiques
        $this->routes['POST']['/api/users/request-password-reset'] = ['App\Controllers\AuthController', 'requestPasswordReset'];
        $this->routes['POST']['/api/users/reset-password'] = ['App\Controllers\AuthController', 'resetPassword'];
        
        // Routes de validation des utilisateurs (admin)
        $this->routes['GET']['/api/admin/users/pending'] = ['App\Controllers\UserValidationController', 'getPendingUsers'];
        $this->routes['POST']['/api/admin/users/{id}/approve'] = ['App\Controllers\UserValidationController', 'approveUser'];
        $this->routes['POST']['/api/admin/users/{id}/reject'] = ['App\Controllers\UserValidationController', 'rejectUser'];
        $this->routes['POST']['/api/admin/users/{id}/pending'] = ['App\Controllers\UserValidationController', 'setUserPending'];
        $this->routes['GET']['/api/admin/users/validation-stats'] = ['App\Controllers\UserValidationController', 'getValidationStats'];
        
        // Routes de notifications de validation
        $this->routes['POST']['/api/notifications/validation/approval'] = ['App\Controllers\ValidationNotificationController', 'sendApprovalNotification'];
        $this->routes['POST']['/api/notifications/validation/rejection'] = ['App\Controllers\ValidationNotificationController', 'sendRejectionNotification'];
        $this->routes['POST']['/api/notifications/validation/pending'] = ['App\Controllers\ValidationNotificationController', 'sendPendingNotification'];
        $this->routes['GET']['/api/notifications/validation/user/{userId}'] = ['App\Controllers\ValidationNotificationController', 'getUserValidationNotifications'];
        $this->routes['PUT']['/api/notifications/validation/{notificationId}/read'] = ['App\Controllers\ValidationNotificationController', 'markNotificationAsRead'];
        $this->routes['GET']['/api/notifications/validation/user/{userId}/unread-count'] = ['App\Controllers\ValidationNotificationController', 'getUnreadNotificationCount'];
        $this->routes['PUT']['/api/notifications/validation/user/{userId}/mark-all-read'] = ['App\Controllers\ValidationNotificationController', 'markAllNotificationsAsRead'];
        
        $this->routes['GET']['/api/users/{id}'] = ['App\Controllers\UserController', 'findById'];
        $this->routes['GET']['/api/users/{id}/children'] = ['App\Controllers\UserController', 'getUserChildren'];
        $this->routes['GET']['/api/users/parents/{id}'] = ['App\Controllers\UserController', 'getParentProfile'];
        $this->routes['PATCH']['/api/users/parents/{id}'] = ['App\Controllers\UserController', 'updateParentProfile'];
        $this->routes['PATCH']['/api/users/children/{id}'] = ['App\Controllers\UserController', 'updateChild'];
        $this->routes['POST']['/api/users'] = ['App\Controllers\UserController', 'create'];
        $this->routes['POST']['/api/users/children'] = ['App\Controllers\UserController', 'addChild'];
        $this->routes['PUT']['/api/users/{id}'] = ['App\Controllers\UserController', 'update'];
        $this->routes['DELETE']['/api/users/{id}'] = ['App\Controllers\UserController', 'delete'];
        $this->routes['DELETE']['/api/users/children/{id}'] = ['App\Controllers\UserController', 'deleteChild'];
        
        // Routes classes
        $this->routes['GET']['/api/classes'] = ['App\Controllers\ClassController', 'findAll'];
        $this->routes['GET']['/api/classes/{id}'] = ['App\Controllers\ClassController', 'findById'];
        $this->routes['GET']['/api/classes/{id}/categories'] = ['App\Controllers\ClassController', 'getCategories'];
        $this->routes['POST']['/api/classes'] = ['App\Controllers\ClassController', 'create'];
        $this->routes['PUT']['/api/classes/{id}'] = ['App\Controllers\ClassController', 'update'];
        $this->routes['DELETE']['/api/classes/{id}'] = ['App\Controllers\ClassController', 'delete'];
        
        // Routes créneaux horaires
        $this->routes['GET']['/api/schedules'] = ['App\Controllers\ScheduleController', 'getAll'];
        $this->routes['GET']['/api/schedules/{id}'] = ['App\Controllers\ScheduleController', 'getById'];
        $this->routes['GET']['/api/schedules/classe/{classeId}'] = ['App\Controllers\ScheduleController', 'getByClasse'];
        $this->routes['POST']['/api/schedules'] = ['App\Controllers\ScheduleController', 'create'];
        $this->routes['PATCH']['/api/schedules/{id}'] = ['App\Controllers\ScheduleController', 'update'];
        $this->routes['DELETE']['/api/schedules/{id}'] = ['App\Controllers\ScheduleController', 'delete'];
        
        // Routes cours
        $this->routes['GET']['/api/courses'] = ['App\Controllers\CourseController', 'findAll'];
        $this->routes['GET']['/api/courses/{id}'] = ['App\Controllers\CourseController', 'findById'];
        
        // Anciennes routes (compatibilité)
        $this->routes['GET']['/api/courses/level/{levelId}'] = ['App\Controllers\CourseController', 'findByLevel'];
        $this->routes['GET']['/api/courses/category/{categoryId}/level/{levelId}'] = ['App\Controllers\CourseController', 'findByCategoryAndLevel'];
        
        // Nouvelles routes basées sur les classes
        $this->routes['GET']['/api/courses/classe/{classeId}'] = ['App\Controllers\CourseController', 'findByClasse'];
        $this->routes['GET']['/api/courses/classe/{classeId}/category/{categoryId}'] = ['App\Controllers\CourseController', 'findByClasseAndCategory'];
        $this->routes['GET']['/api/courses/classe/{classeId}/categories'] = ['App\Controllers\CourseController', 'getCategoriesForClasse'];
        
        $this->routes['POST']['/api/courses'] = ['App\Controllers\CourseController', 'create'];
        $this->routes['PUT']['/api/courses/{id}'] = ['App\Controllers\CourseController', 'update'];
        $this->routes['DELETE']['/api/courses/{id}'] = ['App\Controllers\CourseController', 'delete'];
        
        // Routes leçons
        $this->routes['GET']['/api/lessons'] = ['App\Controllers\LessonController', 'findAll'];
        $this->routes['GET']['/api/lessons/{id}'] = ['App\Controllers\LessonController', 'findById'];
        $this->routes['GET']['/api/courses/{courseId}/lessons'] = ['App\Controllers\LessonController', 'findByCourse'];
        $this->routes['POST']['/api/lessons'] = ['App\Controllers\LessonController', 'create'];
        $this->routes['PUT']['/api/lessons/{id}'] = ['App\Controllers\LessonController', 'update'];
        $this->routes['DELETE']['/api/lessons/{id}'] = ['App\Controllers\LessonController', 'delete'];
        
        // Routes exercices publics
        $this->routes['GET']['/api/public/exercises'] = ['App\Controllers\ExercisePublicController', 'findAll'];
        $this->routes['GET']['/api/public/exercises/{id}'] = ['App\Controllers\ExercisePublicController', 'findById'];
        $this->routes['GET']['/api/public/exercises/lesson/{lessonId}'] = ['App\Controllers\ExercisePublicController', 'findByLesson'];
        $this->routes['GET']['/api/public/exercises/course/{courseId}'] = ['App\Controllers\ExercisePublicController', 'findByCourse'];
        
        // Routes quiz publics
        $this->routes['GET']['/api/public/quizzes'] = ['App\Controllers\QuizPublicController', 'findAll'];
        $this->routes['GET']['/api/public/quizzes/{id}'] = ['App\Controllers\QuizPublicController', 'findById'];
        $this->routes['GET']['/api/public/quizzes/lesson/{lessonId}'] = ['App\Controllers\QuizPublicController', 'findByLesson'];
        $this->routes['GET']['/api/public/quizzes/course/{courseId}'] = ['App\Controllers\QuizPublicController', 'findByCourse'];
        $this->routes['GET']['/api/courses/{courseId}/quizzes'] = ['App\Controllers\QuizPublicController', 'findByCourse'];
        
        // Routes exercices
        $this->routes['GET']['/api/exercises'] = ['App\Controllers\ExerciseController', 'findAll'];
        $this->routes['GET']['/api/exercises/{id}'] = ['App\Controllers\ExerciseController', 'findById'];
        $this->routes['GET']['/api/lessons/{lessonId}/exercises'] = ['App\Controllers\ExerciseController', 'findByLesson'];
        
        // Routes admin exercices
        $this->routes['GET']['/api/admin/exercises'] = ['App\Controllers\ExerciseAdminController', 'findAll'];
        $this->routes['GET']['/api/admin/exercises/{id}'] = ['App\Controllers\ExerciseAdminController', 'findById'];
        $this->routes['POST']['/api/admin/exercises'] = ['App\Controllers\ExerciseAdminController', 'create'];
        $this->routes['PUT']['/api/admin/exercises/{id}'] = ['App\Controllers\ExerciseAdminController', 'update'];
        $this->routes['DELETE']['/api/admin/exercises/{id}'] = ['App\Controllers\ExerciseAdminController', 'delete'];
        $this->routes['POST']['/api/admin/exercises/{id}/duplicate'] = ['App\Controllers\ExerciseAdminController', 'duplicate'];
        $this->routes['PUT']['/api/admin/exercises/{id}/toggle-status'] = ['App\Controllers\ExerciseAdminController', 'toggleStatus'];
        
        // Routes admin dashboard
        $this->routes['GET']['/api/admin/dashboard/stats'] = ['App\Controllers\AdminDashboardController', 'getStats'];
        $this->routes['GET']['/api/admin/users/stats'] = ['App\Controllers\AdminDashboardController', 'getUserStats'];
        $this->routes['GET']['/api/admin/users/stats/growth'] = ['App\Controllers\AdminDashboardController', 'getUserStatsWithGrowth'];
        $this->routes['GET']['/api/admin/courses/stats'] = ['App\Controllers\AdminDashboardController', 'getCourseStats'];
        $this->routes['GET']['/api/admin/activities/recent'] = ['App\Controllers\AdminDashboardController', 'getRecentActivities'];
        $this->routes['GET']['/api/admin/alerts'] = ['App\Controllers\AdminDashboardController', 'getAlerts'];
        $this->routes['GET']['/api/admin/performance'] = ['App\Controllers\AdminDashboardController', 'getPerformance'];
        $this->routes['GET']['/api/admin/permissions'] = ['App\Controllers\AdminDashboardController', 'getPermissions'];
        
        // Routes admin users
        $this->routes['GET']['/api/admin/users'] = ['App\Controllers\AdminUserController', 'getAllUsers'];
        $this->routes['GET']['/api/admin/users/with-status'] = ['App\Controllers\AdminUserController', 'getAllUsersWithStatus'];
        $this->routes['GET']['/api/admin/users/{id}'] = ['App\Controllers\AdminUserController', 'getUserById'];
        $this->routes['POST']['/api/admin/users'] = ['App\Controllers\AdminUserController', 'createUser'];
        $this->routes['PUT']['/api/admin/users/{id}'] = ['App\Controllers\AdminUserController', 'updateUser'];
        $this->routes['PATCH']['/api/admin/users/{id}'] = ['App\Controllers\AdminUserController', 'patchUpdateUser'];
        $this->routes['DELETE']['/api/admin/users/{id}'] = ['App\Controllers\AdminUserController', 'deleteUser'];
        
        // Routes admin users spécialisées
        $this->routes['POST']['/api/admin/users/parents'] = ['App\Controllers\AdminUserController', 'createParent'];
        $this->routes['POST']['/api/admin/users/children'] = ['App\Controllers\AdminUserController', 'createChild'];
        $this->routes['PATCH']['/api/admin/users/parents/{id}'] = ['App\Controllers\AdminUserController', 'updateParent'];
        $this->routes['PATCH']['/api/admin/users/children/{id}'] = ['App\Controllers\AdminUserController', 'updateChild'];
        $this->routes['DELETE']['/api/admin/users/children/{id}'] = ['App\Controllers\AdminUserController', 'deleteChild'];
        
        // Routes admin users statistiques et recherche
        $this->routes['GET']['/api/admin/users/stats/overview'] = ['App\Controllers\AdminUserController', 'getUserStats'];
        $this->routes['GET']['/api/admin/users/search/advanced'] = ['App\Controllers\AdminUserController', 'advancedSearch'];
        
        // Routes admin courses
        $this->routes['GET']['/api/admin/courses'] = ['App\Controllers\AdminCourseController', 'getAllCourses'];
        $this->routes['GET']['/api/admin/courses/{id}'] = ['App\Controllers\AdminCourseController', 'getCourseById'];
        $this->routes['POST']['/api/admin/courses'] = ['App\Controllers\AdminCourseController', 'createCourse'];
        $this->routes['PUT']['/api/admin/courses/{id}'] = ['App\Controllers\AdminCourseController', 'updateCourse'];
        $this->routes['DELETE']['/api/admin/courses/{id}'] = ['App\Controllers\AdminCourseController', 'deleteCourse'];
        
        // Routes cleanup
        $this->routes['POST']['/api/admin/cleanup/rebuild'] = ['App\Controllers\CleanupController', 'cleanAndRebuild'];
        
        // Routes catégories
        $this->routes['GET']['/api/categories'] = ['App\Controllers\CategoryController', 'findAll'];
        $this->routes['GET']['/api/categories/{id}'] = ['App\Controllers\CategoryController', 'findById'];
        $this->routes['POST']['/api/categories'] = ['App\Controllers\CategoryController', 'create'];
        $this->routes['PUT']['/api/categories/{id}'] = ['App\Controllers\CategoryController', 'update'];
        $this->routes['DELETE']['/api/categories/{id}'] = ['App\Controllers\CategoryController', 'delete'];
        
        // Routes admin catégories
        $this->routes['GET']['/api/admin/categories'] = ['App\Controllers\CategoryController', 'findAll'];
        $this->routes['GET']['/api/admin/categories/{id}'] = ['App\Controllers\CategoryController', 'findById'];
        $this->routes['POST']['/api/admin/categories'] = ['App\Controllers\CategoryController', 'create'];
        $this->routes['PUT']['/api/admin/categories/{id}'] = ['App\Controllers\CategoryController', 'update'];
        $this->routes['DELETE']['/api/admin/categories/{id}'] = ['App\Controllers\CategoryController', 'delete'];
        
        // Routes sous-catégories
        $this->routes['GET']['/api/subcategories'] = ['App\Controllers\SubcategoryController', 'findAll'];
        $this->routes['GET']['/api/subcategories/{id}'] = ['App\Controllers\SubcategoryController', 'findById'];
        $this->routes['GET']['/api/subcategories/category/{categoryId}'] = ['App\Controllers\SubcategoryController', 'findByCategory'];
        $this->routes['POST']['/api/subcategories'] = ['App\Controllers\SubcategoryController', 'create'];
        
        // Routes admin sous-catégories
        $this->routes['GET']['/api/admin/subcategories'] = ['App\Controllers\SubcategoryController', 'findAll'];
        $this->routes['GET']['/api/admin/subcategories/{id}'] = ['App\Controllers\SubcategoryController', 'findById'];
        $this->routes['POST']['/api/admin/subcategories'] = ['App\Controllers\SubcategoryController', 'create'];
        $this->routes['PUT']['/api/admin/subcategories/{id}'] = ['App\Controllers\SubcategoryController', 'update'];
        $this->routes['DELETE']['/api/admin/subcategories/{id}'] = ['App\Controllers\SubcategoryController', 'delete'];
        
        // Routes niveaux
        $this->routes['GET']['/api/levels'] = ['App\Controllers\LevelController', 'findAll'];
        $this->routes['GET']['/api/levels/{id}'] = ['App\Controllers\LevelController', 'findById'];
        $this->routes['POST']['/api/levels'] = ['App\Controllers\LevelController', 'create'];
        
        // Routes quiz
        $this->routes['GET']['/api/quiz'] = ['App\Controllers\QuizController', 'findAll'];
        $this->routes['GET']['/api/quiz/{id}'] = ['App\Controllers\QuizController', 'findById'];
        $this->routes['POST']['/api/quiz'] = ['App\Controllers\QuizController', 'create'];
        
        // Routes migrations
        $this->routes['POST']['/api/migrations/add-course-id-to-exercises'] = ['App\Controllers\MigrationController', 'addCourseIdToExercises'];
        $this->routes['GET']['/api/migrations/check-exercises-structure'] = ['App\Controllers\MigrationController', 'checkExercisesStructure'];
        
        // Routes notifications
        $this->routes['POST']['/api/notifications/email'] = ['App\Controllers\NotificationController', 'sendEmail'];
        $this->routes['POST']['/api/notifications/sms'] = ['App\Controllers\NotificationController', 'sendSms'];
        
        // Routes d'upload
        $this->routes['POST']['/api/upload/multiple'] = ['App\Controllers\UploadController', 'uploadMultiple'];
        $this->routes['GET']['/api/upload/{filename}'] = ['App\Controllers\UploadController', 'getFile'];
        
        // Routes de progression des quiz - CONTRÔLEURS ORIGINAUX
        $this->routes['POST']['/api/quiz/{id}/submit'] = ['App\Controllers\QuizProgressController', 'submitQuiz'];
        $this->routes['GET']['/api/quiz/{id}/progress'] = ['App\Controllers\QuizProgressController', 'getQuizProgress'];
        $this->routes['GET']['/api/quiz/progress/user'] = ['App\Controllers\QuizProgressController', 'getUserQuizProgress'];
        $this->routes['GET']['/api/quiz/progress/stats'] = ['App\Controllers\QuizProgressController', 'getQuizProgressStats'];
        
        // Routes de progression des exercices - CONTRÔLEURS ORIGINAUX
        $this->routes['POST']['/api/exercise/{id}/submit'] = ['App\Controllers\ExerciseProgressController', 'submitExercise'];
        $this->routes['GET']['/api/exercise/{id}/progress'] = ['App\Controllers\ExerciseProgressController', 'getExerciseProgress'];
        $this->routes['GET']['/api/exercise/progress/user'] = ['App\Controllers\ExerciseProgressController', 'getUserExerciseProgress'];
        $this->routes['GET']['/api/exercise/progress/stats'] = ['App\Controllers\ExerciseProgressController', 'getExerciseProgressStats'];
        $this->routes['GET']['/api/exercise/progress/type/{type}'] = ['App\Controllers\ExerciseProgressController', 'getProgressByType'];
        
        // Route de test
        // Routes de contact
        $this->routes['POST']['/api/contact/send'] = ['App\Controllers\ContactControllerSimple', 'sendMessage'];
        $this->routes['GET']['/api/contact/info'] = ['App\Controllers\ContactControllerSimple', 'getContactInfo'];
        
        $this->routes['GET']['/api/health'] = ['App\Controllers\HealthController', 'check'];
        
        // Routes progression des élèves
        $this->routes['GET']['/api/progress/child/{childId}/detailed'] = ['App\Controllers\ProgressController', 'getChildDetailedProgress'];
        $this->routes['GET']['/api/progress/parent/overview'] = ['App\Controllers\ProgressController', 'getParentOverview'];
        $this->routes['POST']['/api/progress/session/start'] = ['App\Controllers\ProgressController', 'startStudySession'];
        $this->routes['POST']['/api/progress/session/{sessionId}/end'] = ['App\Controllers\ProgressController', 'endStudySession'];
        $this->routes['GET']['/api/progress/child/{childId}/reports'] = ['App\Controllers\ProgressController', 'getProgressReports'];
        $this->routes['GET']['/api/progress/child/{childId}/analytics'] = ['App\Controllers\ProgressController', 'getChildAnalytics'];

        // Routes suivi vidéo
        $this->routes['POST']['/api/video/session/start'] = ['App\Controllers\VideoTrackingController', 'startSession'];
        $this->routes['POST']['/api/video/event/record'] = ['App\Controllers\VideoTrackingController', 'recordEvent'];
        $this->routes['PUT']['/api/video/session/{sessionId}/update'] = ['App\Controllers\VideoTrackingController', 'updateSession'];
        $this->routes['PUT']['/api/video/session/{sessionId}/end'] = ['App\Controllers\VideoTrackingController', 'endSession'];
        $this->routes['GET']['/api/video/session/active/{lessonId}'] = ['App\Controllers\VideoTrackingController', 'getActiveSession'];
        $this->routes['GET']['/api/video/stats/{userId}'] = ['App\Controllers\VideoTrackingController', 'getWatchStats'];
        $this->routes['GET']['/api/video/most-watched/{userId}'] = ['App\Controllers\VideoTrackingController', 'getMostWatchedLessons'];
        $this->routes['GET']['/api/video/analytics/{userId}/{lessonId}'] = ['App\Controllers\VideoTrackingController', 'getVideoAnalytics'];

        // Routes messagerie - Routes spécifiques AVANT les routes avec paramètres
        $this->routes['POST']['/api/messages/send'] = ['App\Controllers\MessagingController', 'sendMessage'];
        $this->routes['GET']['/api/messages'] = ['App\Controllers\MessagingController', 'getMessages'];
        $this->routes['GET']['/api/messages/conversations'] = ['App\Controllers\MessagingController', 'getConversations'];
        $this->routes['GET']['/api/messages/search'] = ['App\Controllers\MessagingController', 'searchMessages'];
        $this->routes['GET']['/api/messages/unread/count'] = ['App\Controllers\MessagingController', 'getUnreadCount'];
        $this->routes['GET']['/api/messages/templates'] = ['App\Controllers\MessagingController', 'getTemplates'];
        $this->routes['GET']['/api/messages/users'] = ['App\Controllers\MessagingController', 'getUsers'];
        $this->routes['GET']['/api/messages/conversations/{userId}'] = ['App\Controllers\MessagingController', 'getConversationMessages'];
        $this->routes['GET']['/api/messages/{id}'] = ['App\Controllers\MessagingController', 'getMessage'];
        $this->routes['PUT']['/api/messages/{id}/read'] = ['App\Controllers\MessagingController', 'markAsRead'];
        $this->routes['PUT']['/api/messages/{id}/important'] = ['App\Controllers\MessagingController', 'toggleImportant'];
        $this->routes['DELETE']['/api/messages/{id}'] = ['App\Controllers\MessagingController', 'deleteMessage'];
        
        // Routes de paiement Stripe et PayPal
        $this->routes['POST']['/api/payment/stripe-session'] = ['App\Controllers\PaymentController', 'createStripeSession'];
        $this->routes['POST']['/api/payment/intent'] = ['App\Controllers\PaymentController', 'createPaymentIntent'];
        $this->routes['GET']['/api/payment/paypal-client-id'] = ['App\Controllers\PaymentController', 'getPayPalClientId'];
        $this->routes['GET']['/api/payment/paypal'] = ['App\Controllers\PaymentController', 'createPayPalOrder'];
        $this->routes['POST']['/api/payment/paypal-capture'] = ['App\Controllers\PaymentController', 'capturePayPal'];
        $this->routes['GET']['/api/payment/status/{id}'] = ['App\Controllers\PaymentController', 'getPaymentStatus'];
        $this->routes['GET']['/api/payment/history/{userId}'] = ['App\Controllers\PaymentController', 'getUserPaymentHistory'];
        $this->routes['GET']['/api/payment/success'] = ['App\Controllers\PaymentController', 'paymentSuccess'];
        $this->routes['GET']['/api/payment/callback'] = ['App\Controllers\PaymentController', 'paymentCallback'];
        $this->routes['GET']['/api/payment/test'] = ['App\Controllers\PaymentController', 'test'];
    }
    
    /**
     * Traite la requête HTTP entrante
     */
    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        
        // Chercher la route correspondante
        $handler = $this->findRoute($method, $uri);
        
        if ($handler === null) {
            Response::notFound('Route not found');
            return;
        }
        
        
        // Extraire les paramètres de l'URL
        $params = $this->extractParams($handler['pattern'], $uri);
        
        // Instancier le contrôleur et appeler la méthode
        $controllerClass = $handler['controller'];
        $methodName = $handler['method'];
        
        if (!class_exists($controllerClass)) {
            Response::internalError("Controller $controllerClass not found");
            return;
        }
        
        $controller = new $controllerClass();
        
        if (!method_exists($controller, $methodName)) {
            Response::internalError("Method $methodName not found in $controllerClass");
            return;
        }
        
        // Appeler la méthode du contrôleur avec les paramètres
        call_user_func_array([$controller, $methodName], $params);
    }
    
    /**
     * Trouve la route correspondante à la requête
     */
    private function findRoute($method, $uri) {
        if (!isset($this->routes[$method])) {
            return null;
        }
        
        // D'abord, chercher une correspondance exacte
        if (isset($this->routes[$method][$uri])) {
            $handler = $this->routes[$method][$uri];
            return [
                'controller' => $handler[0],
                'method' => $handler[1],
                'pattern' => $uri
            ];
        }
        
        // Ensuite, chercher une correspondance avec paramètres
        // Utiliser array_keys pour maintenir l'ordre d'insertion
        foreach (array_keys($this->routes[$method]) as $pattern) {
            if ($this->matchRoute($pattern, $uri)) {
                $handler = $this->routes[$method][$pattern];
                return [
                    'controller' => $handler[0],
                    'method' => $handler[1],
                    'pattern' => $pattern
                ];
            }
        }
        
        return null;
    }
    
    /**
     * Vérifie si une route correspond au pattern
     */
    private function matchRoute($pattern, $uri) {
        // Si c'est une correspondance exacte, retourner true
        if ($pattern === $uri) {
            return true;
        }
        
        // Si le pattern contient des paramètres {id}, vérifier qu'il n'y a pas de correspondance exacte
        if (strpos($pattern, '{') !== false) {
            // Vérifier s'il y a une correspondance exacte dans les routes
            if (isset($this->routes[$_SERVER['REQUEST_METHOD']][$uri])) {
                return false; // Ne pas matcher si une correspondance exacte existe
            }
        }
        
        // Convertir les paramètres {id} en expressions régulières
        $regex = preg_replace('/\{[^}]+\}/', '([^/]+)', $pattern);
        $regex = str_replace('/', '\/', $regex);
        $regex = '/^' . $regex . '$/';
        
        return preg_match($regex, $uri);
    }
    
    /**
     * Extrait les paramètres de l'URL
     */
    private function extractParams($pattern, $uri) {
        $regex = preg_replace('/\{[^}]+\}/', '([^/]+)', $pattern);
        $regex = str_replace('/', '\/', $regex);
        $regex = '/^' . $regex . '$/';
        
        preg_match($regex, $uri, $matches);
        
        // Retirer le premier élément (correspondance complète)
        array_shift($matches);
        
        return $matches;
    }
}
