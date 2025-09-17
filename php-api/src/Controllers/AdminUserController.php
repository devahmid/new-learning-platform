<?php

namespace App\Controllers;

use App\Models\User;
use App\Utils\Response;
use App\Utils\JWT;
use App\Utils\Validator;

/**
 * Contrôleur Admin pour la gestion des utilisateurs
 * Équivalent des endpoints admin/users de NestJS
 */
class AdminUserController {
    
    /**
     * Récupère tous les utilisateurs avec leur statut de validation (admin)
     */
    public function getAllUsersWithStatus() {
        // Vérifier l'authentification admin
        JWT::requireRole(['admin']);
        
        try {
            // Récupérer tous les utilisateurs
            $users = User::all();
            
            // Convertir en tableau avec les relations et statut de validation
            $usersArray = array_map(function($user) {
                $userArray = $user->toArray();
                
                // Ajouter le statut de validation (par défaut 'approved' pour les admins, 'pending' pour les autres)
                if ($user->role === 'admin') {
                    $userArray['status'] = 'approved';
                } else {
                    $userArray['status'] = $user->status ?? 'pending';
                }
                
                // Si c'est un parent, charger les enfants
                if ($user->type === 'parent') {
                    $children = $user->children();
                    $userArray['children'] = array_map(function($child) {
                        $childArray = $child->toArray();
                        $childArray['status'] = $child->status ?? 'approved'; // Les enfants héritent du statut du parent
                        return $childArray;
                    }, $children);
                } else {
                    $userArray['children'] = [];
                }
                
                // Charger le niveau si présent
                if ($user->levelId) {
                    $userArray['level'] = $user->level()?->toArray();
                }
                
                return $userArray;
            }, $users);
            
            $response = [
                'users' => $usersArray,
                'total' => count($usersArray)
            ];
            
            Response::json($response, 200);
            
        } catch (\Exception $e) {
            Response::error('Erreur lors de la récupération des utilisateurs: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Récupère tous les utilisateurs avec pagination et filtres (admin)
     */
    public function getAllUsers() {
        // Vérifier l'authentification admin
        JWT::requireRole(['admin']);
        
        try {
            // Récupérer les paramètres de requête
            $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
            $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
            $type = isset($_GET['type']) ? $_GET['type'] : null;
            $search = isset($_GET['search']) ? $_GET['search'] : null;
            
            // Récupérer tous les utilisateurs
            $users = User::all();
            
            // Filtrage par type
            if ($type && in_array($type, ['parent', 'child'])) {
                $users = array_filter($users, function($user) use ($type) {
                    return $user->type === $type;
                });
            }
            
            // Recherche par nom, email
            if ($search) {
                $searchLower = strtolower($search);
                $users = array_filter($users, function($user) use ($searchLower) {
                    return strpos(strtolower($user->firstName ?? ''), $searchLower) !== false ||
                           strpos(strtolower($user->lastName ?? ''), $searchLower) !== false ||
                           strpos(strtolower($user->email ?? ''), $searchLower) !== false;
                });
            }
            
            // Pagination
            $total = count($users);
            $startIndex = ($page - 1) * $limit;
            $endIndex = $startIndex + $limit;
            $paginatedUsers = array_slice($users, $startIndex, $limit);
            
            // Convertir en tableau avec les relations
            $usersArray = array_map(function($user) {
                $userArray = $user->toArray();
                
                // Si c'est un parent, charger les enfants
                if ($user->type === 'parent') {
                    $children = $user->children();
                    $userArray['children'] = array_map(function($child) {
                        return $child->toArray();
                    }, $children);
                } else {
                    $userArray['children'] = [];
                }
                
                // Charger le niveau si présent
                if ($user->levelId) {
                    $userArray['level'] = $user->level()?->toArray();
                }
                
                return $userArray;
            }, $paginatedUsers);
            
            $response = [
                'users' => $usersArray,
                'total' => $total,
                'page' => $page,
                'limit' => $limit
            ];
            
            Response::json($response, 200);
            
        } catch (\Exception $e) {
            Response::error('Erreur lors de la récupération des utilisateurs: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Récupère un utilisateur par ID (admin)
     */
    public function getUserById($id) {
        // Vérifier l'authentification admin
        JWT::requireRole(['admin']);
        
        try {
            $user = User::find($id);
            
            if (!$user) {
                Response::notFound('Utilisateur non trouvé');
                return;
            }
            
            // Charger les relations pour l'utilisateur
            $userArray = $user->toArray();
            
            // Si c'est un parent, charger les enfants
            if ($user->type === 'parent') {
                $children = $user->children();
                $userArray['children'] = array_map(function($child) {
                    return $child->toArray();
                }, $children);
            } else {
                $userArray['children'] = [];
            }
            
            // Charger le niveau si présent
            if ($user->levelId) {
                $userArray['level'] = $user->level()?->toArray();
            }
            
            Response::json($userArray, 200);
            
        } catch (\Exception $e) {
            Response::error('Erreur lors de la récupération de l\'utilisateur: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Crée un nouvel utilisateur (admin)
     */
    public function createUser() {
        // Vérifier l'authentification admin
        JWT::requireRole(['admin']);
        
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Validation
            $validator = new Validator($data, [
                'email' => 'required|email',
                'firstName' => 'required|min:2',
                'lastName' => 'required|min:2',
                'type' => 'required|in:parent,child',
                'password' => 'required|min:6'
            ]);
            
            if (!$validator->validate()) {
                Response::validationError($validator->getErrors());
                return;
            }
            
            // Vérifier si l'email existe déjà
            $existingUser = User::findByEmail($data['email']);
            if ($existingUser) {
                Response::badRequest('Cet email est déjà utilisé');
                return;
            }
            
            // Créer l'utilisateur
            $user = new User();
            $user->email = $data['email'];
            $user->firstName = $data['firstName'];
            $user->lastName = $data['lastName'];
            $user->type = $data['type'];
            $user->phoneNumber = $data['phoneNumber'] ?? null;
            $user->dateOfBirth = $data['dateOfBirth'] ?? null;
            $user->levelId = $data['levelId'] ?? null;
            $user->parentId = $data['parentId'] ?? null;
            $user->setPassword($data['password']);
            
            $user->save();
            
            Response::json($user->toArray(), 201);
            
        } catch (\Exception $e) {
            Response::error('Erreur lors de la création de l\'utilisateur: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Crée un parent (admin)
     */
    public function createParent() {
        // Vérifier l'authentification admin
        JWT::requireRole(['admin']);
        
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Forcer le type parent
            $data['type'] = 'parent';
            
            // Validation
            $validator = new Validator($data, [
                'email' => 'required|email',
                'firstName' => 'required|min:2',
                'lastName' => 'required|min:2',
                'password' => 'required|min:6'
            ]);
            
            if (!$validator->validate()) {
                Response::validationError($validator->getErrors());
                return;
            }
            
            // Vérifier si l'email existe déjà
            $existingUser = User::findByEmail($data['email']);
            if ($existingUser) {
                Response::badRequest('Cet email est déjà utilisé');
                return;
            }
            
            // Créer le parent
            $user = new User();
            $user->email = $data['email'];
            $user->firstName = $data['firstName'];
            $user->lastName = $data['lastName'];
            $user->type = 'parent';
            $user->phoneNumber = $data['phoneNumber'] ?? null;
            $user->dateOfBirth = $data['dateOfBirth'] ?? null;
            $user->setPassword($data['password']);
            
            $user->save();
            
            Response::json($user->toArray(), 201);
            
        } catch (\Exception $e) {
            Response::error('Erreur lors de la création du parent: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Crée un enfant (admin)
     */
    public function createChild() {
        // Vérifier l'authentification admin
        JWT::requireRole(['admin']);
        
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Forcer le type child
            $data['type'] = 'child';
            
            // Validation
            $validator = new Validator($data, [
                'firstName' => 'required|min:2',
                'lastName' => 'required|min:2',
                'parentId' => 'required|integer',
                'dateOfBirth' => 'required|date'
            ]);
            
            if (!$validator->validate()) {
                Response::validationError($validator->getErrors());
                return;
            }
            
            // Vérifier que le parent existe
            $parent = User::find($data['parentId']);
            if (!$parent || $parent->type !== 'parent') {
                Response::badRequest('Parent non trouvé ou invalide');
                return;
            }
            
            // Créer l'enfant
            $user = new User();
            $user->firstName = $data['firstName'];
            $user->lastName = $data['lastName'];
            $user->type = 'child';
            $user->parentId = $data['parentId'];
            $user->dateOfBirth = $data['dateOfBirth'];
            $user->levelId = $data['levelId'] ?? null;
            $user->email = $data['email'] ?? null;
            
            $user->save();
            
            Response::json($user->toArray(), 201);
            
        } catch (\Exception $e) {
            Response::error('Erreur lors de la création de l\'enfant: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Met à jour un utilisateur (admin) - PUT (remplacement complet)
     */
    public function updateUser($id) {
        // Vérifier l'authentification admin
        JWT::requireRole(['admin']);
        
        try {
            $user = User::find($id);
            
            if (!$user) {
                Response::notFound('Utilisateur non trouvé');
                return;
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
                return;
            }
            
            // Vérifier si le nouvel email existe déjà
            if (!empty($data['email']) && $data['email'] !== $user->email) {
                $existingUser = User::findByEmail($data['email']);
                if ($existingUser) {
                    Response::badRequest('Cet email est déjà utilisé');
                    return;
                }
            }
            
            // Mettre à jour tous les champs
            $fillableFields = ['email', 'firstName', 'lastName', 'phoneNumber', 'dateOfBirth', 'type', 'levelId', 'parentId'];
            
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
            
            Response::json($user->toArray(), 200);
            
        } catch (\Exception $e) {
            Response::error('Erreur lors de la mise à jour de l\'utilisateur: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Met à jour un utilisateur (admin) - PATCH (mise à jour partielle)
     */
    public function patchUpdateUser($id) {
        // Vérifier l'authentification admin
        JWT::requireRole(['admin']);
        
        try {
            $user = User::find($id);
            
            if (!$user) {
                Response::notFound('Utilisateur non trouvé');
                return;
            }
            
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Validation pour PATCH (champs optionnels)
            $validator = new Validator($data, [
                'email' => 'email',
                'firstName' => 'min:2',
                'lastName' => 'min:2',
                'type' => 'in:parent,child',
                'role' => 'in:admin,user,modérateur'
            ]);
            
            if (!$validator->validate()) {
                Response::validationError($validator->getErrors());
                return;
            }
            
            // Vérifier si le nouvel email existe déjà
            if (!empty($data['email']) && $data['email'] !== $user->email) {
                $existingUser = User::findByEmail($data['email']);
                if ($existingUser) {
                    Response::badRequest('Cet email est déjà utilisé');
                    return;
                }
            }
            
            // Mettre à jour seulement les champs fournis
            $fillableFields = ['email', 'firstName', 'lastName', 'phoneNumber', 'dateOfBirth', 'type', 'levelId', 'parentId', 'classeId', 'role'];
            
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
            
            Response::json($user->toArray(), 200);
            
        } catch (\Exception $e) {
            Response::error('Erreur lors de la mise à jour de l\'utilisateur: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Met à jour un parent (admin) - PATCH (mise à jour partielle)
     */
    public function updateParent($id) {
        // Vérifier l'authentification admin
        JWT::requireRole(['admin']);
        
        try {
            $user = User::find($id);
            
            if (!$user) {
                Response::notFound('Parent non trouvé');
                return;
            }
            
            if ($user->type !== 'parent') {
                Response::badRequest('L\'utilisateur n\'est pas un parent');
                return;
            }
            
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Validation
            $validator = new Validator($data, [
                'email' => 'email',
                'firstName' => 'min:2',
                'lastName' => 'min:2'
            ]);
            
            if (!$validator->validate()) {
                Response::validationError($validator->getErrors());
                return;
            }
            
            // Vérifier si le nouvel email existe déjà
            if (!empty($data['email']) && $data['email'] !== $user->email) {
                $existingUser = User::findByEmail($data['email']);
                if ($existingUser) {
                    Response::badRequest('Cet email est déjà utilisé');
                    return;
                }
            }
            
            // Mettre à jour les champs fournis
            $fillableFields = ['email', 'firstName', 'lastName', 'phoneNumber', 'dateOfBirth'];
            
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
            
            Response::json($user->toArray(), 200);
            
        } catch (\Exception $e) {
            Response::error('Erreur lors de la mise à jour du parent: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Met à jour un enfant (admin) - PATCH (mise à jour partielle)
     */
    public function updateChild($id) {
        // Vérifier l'authentification admin
        JWT::requireRole(['admin']);
        
        try {
            $user = User::find($id);
            
            if (!$user) {
                Response::notFound('Enfant non trouvé');
                return;
            }
            
            if ($user->type !== 'child') {
                Response::badRequest('L\'utilisateur n\'est pas un enfant');
                return;
            }
            
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Validation
            $validator = new Validator($data, [
                'firstName' => 'min:2',
                'lastName' => 'min:2',
                'dateOfBirth' => 'date'
            ]);
            
            if (!$validator->validate()) {
                Response::validationError($validator->getErrors());
                return;
            }
            
            // Mettre à jour les champs fournis
            $fillableFields = ['firstName', 'lastName', 'dateOfBirth', 'levelId', 'email'];
            
            foreach ($fillableFields as $field) {
                if (isset($data[$field])) {
                    $user->$field = $data[$field];
                }
            }
            
            $user->save();
            
            Response::json($user->toArray(), 200);
            
        } catch (\Exception $e) {
            Response::error('Erreur lors de la mise à jour de l\'enfant: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Supprime un utilisateur (admin)
     */
    public function deleteUser($id) {
        // Vérifier l'authentification admin
        JWT::requireRole(['admin']);
        
        try {
            $user = User::find($id);
            
            if (!$user) {
                Response::notFound('Utilisateur non trouvé');
                return;
            }
            
            $user->delete();
            
            Response::json(['message' => 'Utilisateur supprimé avec succès'], 200);
            
        } catch (\Exception $e) {
            Response::error('Erreur lors de la suppression de l\'utilisateur: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Supprime un enfant (admin)
     */
    public function deleteChild($id) {
        // Vérifier l'authentification admin
        JWT::requireRole(['admin']);
        
        try {
            $user = User::find($id);
            
            if (!$user) {
                Response::notFound('Enfant non trouvé');
                return;
            }
            
            if ($user->type !== 'child') {
                Response::badRequest('L\'utilisateur n\'est pas un enfant');
                return;
            }
            
            $user->delete();
            
            Response::json(['message' => 'Enfant supprimé avec succès'], 200);
            
        } catch (\Exception $e) {
            Response::error('Erreur lors de la suppression de l\'enfant: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Récupère les statistiques des utilisateurs (admin)
     */
    public function getUserStats() {
        // Vérifier l'authentification admin
        JWT::requireRole(['admin']);
        
        try {
            $users = User::all();
            
            $total = count($users);
            $parents = 0;
            $children = 0;
            $newThisWeek = 0;
            
            $weekAgo = date('Y-m-d H:i:s', strtotime('-7 days'));
            
            foreach ($users as $user) {
                if ($user->type === 'parent') {
                    $parents++;
                } elseif ($user->type === 'child') {
                    $children++;
                }
                
                // Compter les nouveaux utilisateurs de cette semaine
                if ($user->createdAt && $user->createdAt >= $weekAgo) {
                    $newThisWeek++;
                }
            }
            
            $stats = [
                'total' => $total,
                'parents' => $parents,
                'children' => $children,
                'newThisWeek' => $newThisWeek,
                'activeUsers' => $total // À adapter selon votre logique métier
            ];
            
            Response::json($stats, 200);
            
        } catch (\Exception $e) {
            Response::error('Erreur lors de la récupération des statistiques: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Recherche avancée d'utilisateurs (admin)
     */
    public function advancedSearch() {
        // Vérifier l'authentification admin
        JWT::requireRole(['admin']);
        
        try {
            $query = $_GET['query'] ?? null;
            $type = $_GET['type'] ?? null;
            $level = $_GET['level'] ?? null;
            $dateFrom = $_GET['dateFrom'] ?? null;
            $dateTo = $_GET['dateTo'] ?? null;
            
            $users = User::all();
            
            // Filtrage par type
            if ($type && in_array($type, ['parent', 'child'])) {
                $users = array_filter($users, function($user) use ($type) {
                    return $user->type === $type;
                });
            }
            
            // Filtrage par niveau
            if ($level) {
                $users = array_filter($users, function($user) use ($level) {
                    return $user->level && $user->level->name === $level;
                });
            }
            
            // Filtrage par date de création
            if ($dateFrom) {
                $users = array_filter($users, function($user) use ($dateFrom) {
                    return $user->createdAt && $user->createdAt >= $dateFrom;
                });
            }
            
            if ($dateTo) {
                $users = array_filter($users, function($user) use ($dateTo) {
                    return $user->createdAt && $user->createdAt <= $dateTo;
                });
            }
            
            // Recherche textuelle
            if ($query) {
                $queryLower = strtolower($query);
                $users = array_filter($users, function($user) use ($queryLower) {
                    return strpos(strtolower($user->firstName ?? ''), $queryLower) !== false ||
                           strpos(strtolower($user->lastName ?? ''), $queryLower) !== false ||
                           strpos(strtolower($user->email ?? ''), $queryLower) !== false ||
                           strpos($user->phoneNumber ?? '', $query) !== false;
                });
            }
            
            // Convertir en tableau
            $usersArray = array_map(function($user) {
                return $user->toArray();
            }, $users);
            
            Response::json($usersArray, 200);
            
        } catch (\Exception $e) {
            Response::error('Erreur lors de la recherche avancée: ' . $e->getMessage(), 500);
        }
    }
}
