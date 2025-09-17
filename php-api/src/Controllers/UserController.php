<?php

namespace App\Controllers;

use App\Models\User;
use App\Utils\Response;
use App\Utils\JWT;
use App\Utils\Validator;
use App\Utils\UserStatusGuard;

/**
 * Contrôleur User - Équivalent du UserController NestJS
 */
class UserController {
    
    /**
     * Récupère tous les utilisateurs
     */
    public function findAll() {
        // Vérifier l'authentification admin
        $currentUser = JWT::requireRole(['admin']);
        
        $users = User::all();
        $usersArray = array_map(function($user) {
            return $user->toArray();
        }, $users);
        
        // Format compatible NestJS
        Response::json($usersArray, 200);
    }
    
    /**
     * Récupère l'utilisateur connecté
     */
    public function getMe() {
        $currentUser = JWT::requireAuth();
        
        $user = User::find($currentUser['id']);
        
        if (!$user) {
            Response::notFound('Utilisateur non trouvé');
        }
        
        // Format compatible NestJS
        Response::json($user->toArray(), 200);
    }
    
    /**
     * Récupère un utilisateur par ID
     */
    public function findById($id) {
        $currentUser = JWT::requireAuth();
        
        // Un utilisateur peut voir ses propres infos ou un admin peut voir tout
        if ($currentUser['id'] != $id && $currentUser['role'] !== 'admin') {
            Response::forbidden('Accès non autorisé');
        }
        
        $user = User::find($id);
        
        if (!$user) {
            Response::notFound('Utilisateur non trouvé');
        }
        
        // Format compatible NestJS
        Response::json($user->toArray(), 200);
    }
    
    /**
     * Récupère les enfants de l'utilisateur connecté
     */
    public function getMyChildren() {
        // Récupérer l'utilisateur connecté via JWT
        $currentUser = JWT::requireAuth();
        
        // Vérifier le statut de l'utilisateur
        UserStatusGuard::requireApproved();
        $parentId = $currentUser['id'];
        
        $parent = User::find($parentId);
        
        if (!$parent) {
            Response::notFound('Parent non trouvé');
        }
        
        $children = $parent->children();
        $childrenArray = array_map(function($child) {
            return $child->toArray();
        }, $children);
        
        // Retourner un tableau vide si pas d'enfants (compatible NestJS)
        Response::json($childrenArray, 200);
    }
    
    /**
     * Récupère les enfants d'un utilisateur spécifique
     */
    public function getUserChildren($userId) {
        try {
            // Vérifier le statut de l'utilisateur
            UserStatusGuard::requireApproved();
            
            // Récupérer les enfants de l'utilisateur
            $children = User::where(['parentId' => $userId, 'type' => 'child']);
            
            if (empty($children)) {
                Response::json([], 200);
                return;
            }
            
            $childrenArray = array_map(function($child) {
                return $child->toArray();
            }, $children);
            
            Response::json($childrenArray, 200);
            
        } catch (Exception $e) {
            Response::json(['error' => 'Erreur lors de la récupération des enfants'], 500);
        }
    }
    
    /**
     * Met à jour un enfant
     */
    public function updateChild($childId) {
        try {
            $child = User::find($childId);
            
            if (!$child) {
                Response::json(['error' => 'Enfant non trouvé'], 404);
                return;
            }
            
            // Vérifier que c'est bien un enfant
            if ($child->type !== 'child') {
                Response::json(['error' => 'Cet utilisateur n\'est pas un enfant'], 400);
                return;
            }
            
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!$data) {
                Response::json(['error' => 'Données JSON invalides'], 400);
                return;
            }
            
            // Mettre à jour les champs autorisés
            $allowedFields = ['firstName', 'lastName', 'dateOfBirth', 'classeId'];
            foreach ($data as $key => $value) {
                if (in_array($key, $allowedFields)) {
                    $child->$key = $value;
                }
            }
            
            if ($child->save()) {
                Response::json($child->toArray(), 200);
            } else {
                Response::json(['error' => 'Erreur lors de la mise à jour de l\'enfant'], 500);
            }
            
        } catch (Exception $e) {
            Response::json(['error' => 'Erreur lors de la mise à jour de l\'enfant'], 500);
        }
    }
    
    /**
     * Crée un nouvel utilisateur
     */
    public function create() {
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Validation
        $validator = new Validator($data, [
            'email' => 'email',
            'firstName' => 'required|min:2',
            'lastName' => 'required|min:2',
            'type' => 'required|in:parent,child',
            'password' => 'required|min:6'
        ]);
        
        if (!$validator->validate()) {
            Response::validationError($validator->getErrors());
        }
        
        // Vérifier si l'email existe déjà (si fourni)
        if (!empty($data['email'])) {
            $existingUser = User::findByEmail($data['email']);
            if ($existingUser) {
                Response::badRequest('Cet email est déjà utilisé');
            }
        }
        
        // Créer l'utilisateur
        $user = new User([
            'email' => $data['email'] ?? null,
            'firstName' => $data['firstName'],
            'lastName' => $data['lastName'],
            'type' => $data['type'],
            'role' => $data['role'] ?? 'user',
            'phoneNumber' => $data['phoneNumber'] ?? null,
            'dateOfBirth' => $data['dateOfBirth'] ?? null,
            'classeId' => $data['classeId'] ?? null,
            'parentId' => $data['parentId'] ?? null
        ]);
        
        if (!empty($data['password'])) {
            $user->setPassword($data['password']);
        }
        
        $user->save();
        
        // Format compatible NestJS
        Response::json($user->toArray(), 201);
    }
    
    /**
     * Met à jour un utilisateur
     */
    public function update($id) {
        $currentUser = JWT::requireAuth();
        
        // Un utilisateur peut modifier ses propres infos ou un admin peut modifier tout
        if ($currentUser['id'] != $id && $currentUser['role'] !== 'admin') {
            Response::forbidden('Accès non autorisé');
        }
        
        $user = User::find($id);
        
        if (!$user) {
            Response::notFound('Utilisateur non trouvé');
        }
        
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Validation
        $validator = new Validator($data, [
            'email' => 'email',
            'firstName' => 'min:2',
            'lastName' => 'min:2',
            'type' => 'in:parent,child'
        ]);
        
        if (!$validator->validate()) {
            Response::validationError($validator->getErrors());
        }
        
        // Vérifier si le nouvel email existe déjà
        if (!empty($data['email']) && $data['email'] !== $user->email) {
            $existingUser = User::findByEmail($data['email']);
            if ($existingUser) {
                Response::badRequest('Cet email est déjà utilisé');
            }
        }
        
        // Mettre à jour les champs
        $fillableFields = ['email', 'firstName', 'lastName', 'phoneNumber', 'dateOfBirth', 'type', 'classeId', 'parentId'];
        
        foreach ($fillableFields as $field) {
            if (isset($data[$field])) {
                $user->$field = $data[$field];
            }
        }
        
        // Mettre à jour le mot de passe si fourni
        if (!empty($data['password'])) {
            $user->setPassword($data['password']);
        }
        
        $user->save();
        
        // Format compatible NestJS
        Response::json($user->toArray(), 200);
    }
    
    /**
     * Supprime un utilisateur
     */
    public function delete($id) {
        $currentUser = JWT::requireRole(['admin']);
        
        $user = User::find($id);
        
        if (!$user) {
            Response::notFound('Utilisateur non trouvé');
        }
        
        $user->delete();
        
        // Format compatible NestJS
        Response::json(['message' => 'Utilisateur supprimé avec succès'], 200);
    }
    
    /**
     * Supprime un enfant (pour les parents)
     */
    public function deleteChild($id) {
        try {
            // Désactiver l'affichage des erreurs pour éviter la pollution HTML
            ini_set('display_errors', 0);
            error_reporting(0);
            
            $currentUser = JWT::requireRole(['user', 'parent', 'admin']);
            
            // Log pour débogage (sans affichage)
            error_log("DeleteChild - Current User ID: " . $currentUser['id'] . ", Role: " . $currentUser['role']);
            
            $child = User::find($id);
            
            if (!$child) {
                error_log("DeleteChild - Enfant non trouvé avec ID: " . $id);
                Response::notFound('Enfant non trouvé');
                return;
            }
            
            if ($child->type !== 'child') {
                error_log("DeleteChild - L'utilisateur n'est pas un enfant. Type: " . $child->type);
                Response::badRequest('L\'utilisateur n\'est pas un enfant');
                return;
            }
            
            // Log pour débogage
            error_log("DeleteChild - Child parentId: " . $child->parentId . ", Current user ID: " . $currentUser['id']);
            
            // Vérifier que l'utilisateur connecté est le parent de cet enfant
            if ($currentUser['role'] !== 'admin' && $child->parentId != $currentUser['id']) {
                error_log("DeleteChild - Accès refusé. Parent ID mismatch: " . $child->parentId . " != " . $currentUser['id']);
                Response::forbidden('Vous n\'êtes pas autorisé à supprimer cet enfant');
                return;
            }
            
            $child->delete();
            
            error_log("DeleteChild - Enfant supprimé avec succès");
            Response::json(['message' => 'Enfant supprimé avec succès'], 200);
            
        } catch (Exception $e) {
            // Log l'erreur sans l'afficher
            error_log("DeleteChild - Erreur: " . $e->getMessage());
            Response::error('Erreur lors de la suppression de l\'enfant: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Récupère le profil parent avec ses enfants
     */
    public function getParentProfile($id) {
        $user = User::find($id);
        
        if (!$user) {
            Response::notFound('Utilisateur non trouvé');
        }
        
        // Récupérer les enfants si c'est un parent
        $children = [];
        if ($user->type === 'parent') {
            $children = $user->children();
            $children = array_map(function($child) {
                return $child->toArray();
            }, $children);
        }
        
        // Construire la réponse avec le profil parent
        $profile = $user->toArray();
        $profile['children'] = $children;
        $profile['parentProfile'] = [
            'hasChildren' => count($children) > 0,
            'childrenCount' => count($children)
        ];
        
        // Format compatible NestJS
        Response::json($profile, 200);
    }
    
    /**
     * Met à jour le profil parent
     */
    public function updateParentProfile($id) {
        $user = User::find($id);
        
        if (!$user) {
            Response::notFound('Utilisateur non trouvé');
        }
        
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Mettre à jour les champs autorisés
        $allowedFields = ['firstName', 'lastName', 'phoneNumber', 'address', 'dateOfBirth'];
        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $user->$field = $data[$field];
            }
        }
        
        $user->save();
        
        // Format compatible NestJS
        Response::json($user->toArray(), 200);
    }
    
    /**
     * Ajoute un enfant à un parent
     */
    public function addChild() {
        $currentUser = JWT::requireAuth();
        
        // Vérifier le statut de l'utilisateur
        UserStatusGuard::requireApproved();
        
        // Vérifier que l'utilisateur est un parent
        if ($currentUser['type'] !== 'parent') {
            Response::forbidden('Seuls les parents peuvent ajouter des enfants');
        }
        
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Validation des données requises
        if (empty($data['firstName']) || empty($data['lastName'])) {
            Response::badRequest('Le prénom et le nom sont requis');
        }
        
        // Créer l'enfant
        $child = new User();
        $child->firstName = $data['firstName'];
        $child->lastName = $data['lastName'];
        $child->dateOfBirth = $data['dateOfBirth'] ?? null;
        $child->type = 'child';
        $child->role = 'user';
        $child->parentId = $currentUser['id'];
        $child->classeId = $data['classeId'] ?? null;
        
        // Générer un email temporaire si non fourni
        if (empty($data['email'])) {
            $child->email = null; // Pas d'email pour les enfants
        } else {
            $child->email = $data['email'];
        }
        
        // Générer un mot de passe temporaire
        $child->password = password_hash('temp_password_' . time(), PASSWORD_DEFAULT);
        
        $child->save();
        
        // Retourner l'enfant créé (sans le mot de passe)
        $childData = $child->toArray();
        unset($childData['password']);
        
        Response::json($childData, 201);
    }
    
    /**
     * Récupère les statistiques d'un enfant
     */
    public function getChildStats($childId) {
        $currentUser = JWT::requireAuth();
        
        // Vérifier que l'enfant appartient au parent ou que l'utilisateur est admin
        $child = User::find($childId);
        if (!$child) {
            Response::notFound('Enfant non trouvé');
        }
        
        // Vérifier que l'enfant appartient au parent ou que l'utilisateur est admin
        if ($currentUser['type'] !== 'admin' && $child->parentId !== $currentUser['id']) {
            Response::forbidden('Accès non autorisé à cet enfant');
        }
        
        // Calculer les statistiques de l'enfant
        $stats = $this->calculateChildStats($childId);
        
        Response::json($stats, 200);
    }
    
    /**
     * Calcule les statistiques d'un enfant
     */
    private function calculateChildStats($childId) {
        $db = \DatabaseConfig::getInstance()->getConnection();
        
        // Récupérer les cours de l'enfant (basé sur sa classe)
        $child = User::find($childId);
        $classeId = $child->classeId; // Utiliser uniquement classeId
        
        if (!$classeId) {
            // Retourner des statistiques vides si pas de classe
            return [
                'id' => $childId,
                'progress' => 0,
                'points' => 0,
                'badges' => 0,
                'subjects' => 0,
                'completedLessons' => 0,
                'totalLessons' => 0,
                'completedExercises' => 0,
                'totalExercises' => 0,
                'completedQuizzes' => 0,
                'totalQuizzes' => 0
            ];
        }
        
        // Compter les leçons
        $stmt = $db->prepare("
            SELECT COUNT(*) as total
            FROM lessons l
            JOIN courses c ON l.courseId = c.id
            WHERE c.classeId = ? AND c.isActive = 1
        ");
        $stmt->execute([$classeId]);
        $totalLessons = $stmt->fetch()['total'] ?? 0;
        
        // Compter les leçons complétées (simulation - à adapter selon votre logique)
        $completedLessons = 0; // TODO: Implémenter la logique de progression réelle
        
        // Compter les exercices
        $stmt = $db->prepare("
            SELECT COUNT(*) as total
            FROM exercises e
            JOIN courses c ON e.courseId = c.id
            WHERE c.classeId = ? AND c.isActive = 1
        ");
        $stmt->execute([$classeId]);
        $totalExercises = $stmt->fetch()['total'] ?? 0;
        
        // Compter les exercices complétés (simulation)
        $completedExercises = 0; // TODO: Implémenter la logique de progression réelle
        
        // Compter les quiz
        $stmt = $db->prepare("
            SELECT COUNT(*) as total
            FROM quizzes q
            JOIN courses c ON q.courseId = c.id
            WHERE c.classeId = ? AND c.isActive = 1
        ");
        $stmt->execute([$classeId]);
        $totalQuizzes = $stmt->fetch()['total'] ?? 0;
        
        // Compter les quiz complétés (simulation)
        $completedQuizzes = 0; // TODO: Implémenter la logique de progression réelle
        
        // Compter les matières
        $stmt = $db->prepare("
            SELECT COUNT(DISTINCT c.categoryId) as total
            FROM courses c
            WHERE c.classeId = ? AND c.isActive = 1
        ");
        $stmt->execute([$classeId]);
        $subjects = $stmt->fetch()['total'] ?? 0;
        
        // Calculer la progression globale
        $totalItems = $totalLessons + $totalExercises + $totalQuizzes;
        $completedItems = $completedLessons + $completedExercises + $completedQuizzes;
        $progress = $totalItems > 0 ? round(($completedItems / $totalItems) * 100) : 0;
        
        // Calculer les points (simulation)
        $points = ($completedLessons * 10) + ($completedExercises * 5) + ($completedQuizzes * 15);
        
        // Calculer les badges (simulation)
        $badges = 0;
        if ($completedLessons >= 10) $badges++;
        if ($completedLessons >= 50) $badges++;
        if ($completedExercises >= 20) $badges++;
        if ($completedQuizzes >= 5) $badges++;
        if ($progress >= 25) $badges++;
        if ($progress >= 50) $badges++;
        if ($progress >= 75) $badges++;
        if ($progress >= 100) $badges++;
        
        return [
            'id' => $childId,
            'progress' => $progress,
            'points' => $points,
            'badges' => $badges,
            'subjects' => $subjects,
            'completedLessons' => $completedLessons,
            'totalLessons' => $totalLessons,
            'completedExercises' => $completedExercises,
            'totalExercises' => $totalExercises,
            'completedQuizzes' => $completedQuizzes,
            'totalQuizzes' => $totalQuizzes
        ];
    }
    
    /**
     * Récupère les statistiques de tous les enfants du parent connecté
     */
    public function getMyChildrenStats() {
        $currentUser = JWT::requireAuth();
        
        // Vérifier que l'utilisateur est un parent
        if ($currentUser['type'] !== 'parent') {
            Response::forbidden('Seuls les parents peuvent accéder aux statistiques de leurs enfants');
        }
        
        // Récupérer tous les enfants du parent
        $children = User::where(['parentId' => $currentUser['id'], 'type' => 'child']);
        
        $childrenStats = [];
        foreach ($children as $child) {
            $stats = $this->calculateChildStats($child->id);
            $childrenStats[] = $stats;
        }
        
        Response::json($childrenStats, 200);
    }
}
