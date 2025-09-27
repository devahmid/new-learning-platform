<?php

namespace App\Controllers;

use App\Utils\Response;
use App\Utils\JWT;
use App\Utils\EmailService;
use App\Models\Assignment;
use App\Models\Classe;
use App\Models\User;

/**
 * Contrôleur Assignment - Gestion des devoirs
 */
class AssignmentController {
    
    /**
     * Récupérer tous les devoirs (pour l'admin)
     * GET /api/admin/assignments
     */
    public function getAllAssignments() {
        try {
            // Vérifier l'authentification admin
            JWT::requireRole(['admin']);
            
            // Récupérer les paramètres de requête
            $classeId = $_GET['classeId'] ?? '';
            $status = $_GET['status'] ?? '';
            $page = (int) ($_GET['page'] ?? 1);
            $limit = (int) ($_GET['limit'] ?? 25);
            
            $db = \DatabaseConfig::getInstance()->getConnection();
            
            // Construire la requête
            $whereConditions = ['a.isActive = 1'];
            $params = [];
            
            if ($classeId) {
                $whereConditions[] = 'a.classeId = ?';
                $params[] = $classeId;
            }
            
            if ($status) {
                switch ($status) {
                    case 'overdue':
                        $whereConditions[] = 'a.dueDate < NOW()';
                        break;
                    case 'due_soon':
                        $whereConditions[] = 'a.dueDate BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 7 DAY)';
                        break;
                    case 'upcoming':
                        $whereConditions[] = 'a.dueDate > DATE_ADD(NOW(), INTERVAL 7 DAY)';
                        break;
                }
            }
            
            $whereClause = 'WHERE ' . implode(' AND ', $whereConditions);
            
            // Compter le total
            $countSql = "
                SELECT COUNT(*) as total
                FROM assignments a
                $whereClause
            ";
            
            $countStmt = $db->prepare($countSql);
            $countStmt->execute($params);
            $total = $countStmt->fetch(\PDO::FETCH_ASSOC)['total'];
            
            // Récupérer les devoirs avec pagination
            $offset = ($page - 1) * $limit;
            $sql = "
                SELECT 
                    a.*,
                    c.name as classe_name,
                    c.color as classe_color,
                    u.firstName as creator_firstName,
                    u.lastName as creator_lastName,
                    u.email as creator_email
                FROM assignments a
                LEFT JOIN classes c ON a.classeId = c.id
                LEFT JOIN users u ON a.createdBy = u.id
                $whereClause
                ORDER BY a.dueDate ASC, a.createdAt DESC
                LIMIT ? OFFSET ?
            ";
            
            $params[] = $limit;
            $params[] = $offset;
            
            $stmt = $db->prepare($sql);
            $stmt->execute($params);
            $assignments = $stmt->fetchAll(\PDO::FETCH_ASSOC);
            
            // Formater les données
            $formattedAssignments = [];
            foreach ($assignments as $assignment) {
                $assignment['status'] = $this->getAssignmentStatus($assignment['dueDate']);
                $assignment['isOverdue'] = $assignment['dueDate'] && strtotime($assignment['dueDate']) < time();
                $formattedAssignments[] = $assignment;
            }
            
            $pages = ceil($total / $limit);
            
            return Response::success([
                'items' => $formattedAssignments,
                'pagination' => [
                    'total' => (int) $total,
                    'page' => $page,
                    'limit' => $limit,
                    'pages' => $pages
                ]
            ]);
            
        } catch (\Exception $e) {
            error_log('AssignmentController Error (getAllAssignments): ' . $e->getMessage());
            return Response::error('Erreur lors de la récupération des devoirs: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Créer un nouveau devoir (pour l'admin)
     * POST /api/admin/assignments
     */
    public function createAssignment() {
        try {
            // Vérifier l'authentification admin
            $currentUser = JWT::requireRole(['admin']);
            
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input) {
                return Response::badRequest('Données JSON invalides');
            }
            
            // Validation
            if (empty($input['title']) || empty($input['classeId'])) {
                return Response::badRequest('Titre et classe requis');
            }
            
            // Vérifier que la classe existe
            $classe = Classe::find($input['classeId']);
            if (!$classe) {
                return Response::badRequest('Classe non trouvée');
            }
            
            // Créer le devoir
            $assignment = new Assignment();
            $assignment->title = $input['title'];
            $assignment->description = $input['description'] ?? '';
            $assignment->classeId = $input['classeId'];
            $assignment->dueDate = $input['dueDate'] ?? null;
            $assignment->createdBy = $currentUser['id'];
            $assignment->isActive = true;
            
            $assignment->save();
            
            // Envoyer les notifications aux parents
            $this->sendAssignmentNotifications($assignment);
            
            return Response::success($assignment->toArray(), 'Devoir créé avec succès', 201);
            
        } catch (\Exception $e) {
            error_log('AssignmentController Error (createAssignment): ' . $e->getMessage());
            return Response::error('Erreur lors de la création du devoir: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Mettre à jour un devoir (pour l'admin)
     * PUT /api/admin/assignments/{id}
     */
    public function updateAssignment($assignmentId) {
        try {
            // Vérifier l'authentification admin
            JWT::requireRole(['admin']);
            
            $assignment = Assignment::find($assignmentId);
            if (!$assignment) {
                return Response::notFound('Devoir non trouvé');
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input) {
                return Response::badRequest('Données JSON invalides');
            }
            
            // Mettre à jour les champs
            if (isset($input['title'])) {
                $assignment->title = $input['title'];
            }
            if (isset($input['description'])) {
                $assignment->description = $input['description'];
            }
            if (isset($input['dueDate'])) {
                $assignment->dueDate = $input['dueDate'];
            }
            if (isset($input['isActive'])) {
                $assignment->isActive = $input['isActive'];
            }
            
            $assignment->save();
            
            return Response::success($assignment->toArray(), 'Devoir mis à jour avec succès');
            
        } catch (\Exception $e) {
            error_log('AssignmentController Error (updateAssignment): ' . $e->getMessage());
            return Response::error('Erreur lors de la mise à jour du devoir: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Supprimer un devoir (pour l'admin)
     * DELETE /api/admin/assignments/{id}
     */
    public function deleteAssignment($assignmentId) {
        try {
            // Vérifier l'authentification admin
            JWT::requireRole(['admin']);
            
            $assignment = Assignment::find($assignmentId);
            if (!$assignment) {
                return Response::notFound('Devoir non trouvé');
            }
            
            // Soft delete - marquer comme inactif
            $assignment->isActive = false;
            $assignment->save();
            
            return Response::success(null, 'Devoir supprimé avec succès');
            
        } catch (\Exception $e) {
            error_log('AssignmentController Error (deleteAssignment): ' . $e->getMessage());
            return Response::error('Erreur lors de la suppression du devoir: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Récupérer les devoirs pour un parent
     * GET /api/assignments/parent
     */
    public function getParentAssignments() {
        try {
            // Vérifier l'authentification parent ou user (compatibilité)
            $currentUser = JWT::requireRole(['parent', 'user']);
            
            // Debug: Log des informations de l'utilisateur
            error_log("DEBUG getParentAssignments - User ID: " . $currentUser['id']);
            error_log("DEBUG getParentAssignments - User Role: " . $currentUser['role']);
            error_log("DEBUG getParentAssignments - User Type: " . $currentUser['type']);
            
            $assignments = Assignment::getForParent($currentUser['id']);
            
            // Debug: Log du nombre de devoirs trouvés
            error_log("DEBUG getParentAssignments - Assignments found: " . count($assignments));
            
            // Grouper par enfant
            $groupedAssignments = [];
            foreach ($assignments as $assignment) {
                $classeId = $assignment->classeId;
                $classe = $assignment->classe();
                
                if (!isset($groupedAssignments[$classeId])) {
                    $groupedAssignments[$classeId] = [
                        'classe' => $classe ? $classe->toArray() : null,
                        'assignments' => []
                    ];
                }
                
                $groupedAssignments[$classeId]['assignments'][] = $assignment->toArray();
            }
            
            return Response::success($groupedAssignments);
            
        } catch (\Exception $e) {
            error_log('AssignmentController Error (getParentAssignments): ' . $e->getMessage());
            return Response::error('Erreur lors de la récupération des devoirs: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Récupérer les devoirs pour un utilisateur (version alternative)
     * GET /api/assignments/user
     */
    public function getUserAssignments() {
        try {
            // Vérifier l'authentification
            $currentUser = JWT::requireRole(['parent', 'user', 'admin']);
            
            // Debug: Log des informations de l'utilisateur
            error_log("DEBUG getUserAssignments - User ID: " . $currentUser['id']);
            error_log("DEBUG getUserAssignments - User Role: " . $currentUser['role']);
            error_log("DEBUG getUserAssignments - User Type: " . $currentUser['type']);
            
            // Si c'est un admin, retourner tous les devoirs
            if ($currentUser['role'] === 'admin') {
                error_log("DEBUG getUserAssignments - Admin user detected, fetching all assignments");
                
                $db = \DatabaseConfig::getInstance()->getConnection();
                $sql = "
                    SELECT a.*, c.name as classe_name, c.color as classe_color
                    FROM assignments a
                    LEFT JOIN classes c ON a.classeId = c.id
                    WHERE a.isActive = 1
                    ORDER BY a.dueDate ASC, a.createdAt DESC
                ";
                $stmt = $db->prepare($sql);
                $stmt->execute();
                $assignments = $stmt->fetchAll(\PDO::FETCH_ASSOC);
                
                error_log("DEBUG getUserAssignments - Admin found " . count($assignments) . " assignments");
                
                // Grouper par classe
                $groupedAssignments = [];
                foreach ($assignments as $assignmentData) {
                    $classeId = $assignmentData['classeId'];
                    
                    if (!isset($groupedAssignments[$classeId])) {
                        $groupedAssignments[$classeId] = [
                            'classe' => [
                                'id' => $classeId,
                                'name' => $assignmentData['classe_name'] ?? 'Classe inconnue',
                                'color' => $assignmentData['classe_color'] ?? '#3B82F6'
                            ],
                            'assignments' => []
                        ];
                    }
                    
                    $groupedAssignments[$classeId]['assignments'][] = $assignmentData;
                }
                
                error_log("DEBUG getUserAssignments - Grouped into " . count($groupedAssignments) . " classes");
                
                return Response::success($groupedAssignments);
            }
            
            // Pour les autres utilisateurs, essayer d'abord la méthode parent
            $assignments = Assignment::getForParent($currentUser['id']);
            
            // Si aucun devoir trouvé, retourner un tableau vide
            if (empty($assignments)) {
                return Response::success([]);
            }
            
            // Grouper par classe
            $groupedAssignments = [];
            foreach ($assignments as $assignment) {
                $classeId = $assignment->classeId;
                $classe = $assignment->classe();
                
                if (!isset($groupedAssignments[$classeId])) {
                    $groupedAssignments[$classeId] = [
                        'classe' => $classe ? $classe->toArray() : null,
                        'assignments' => []
                    ];
                }
                
                $groupedAssignments[$classeId]['assignments'][] = $assignment->toArray();
            }
            
            return Response::success($groupedAssignments);
            
        } catch (\Exception $e) {
            error_log('AssignmentController Error (getUserAssignments): ' . $e->getMessage());
            return Response::error('Erreur lors de la récupération des devoirs: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Récupérer les statistiques des devoirs (pour l'admin)
     * GET /api/admin/assignments/stats
     */
    public function getAssignmentStats() {
        try {
            // Vérifier l'authentification admin
            JWT::requireRole(['admin']);
            
            $db = \DatabaseConfig::getInstance()->getConnection();
            
            // Statistiques générales
            $stats = [
                'total' => 0,
                'overdue' => 0,
                'due_soon' => 0,
                'upcoming' => 0,
                'by_classe' => []
            ];
            
            // Compter les devoirs par statut
            $sql = "
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN dueDate < NOW() THEN 1 ELSE 0 END) as overdue,
                    SUM(CASE WHEN dueDate BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as due_soon,
                    SUM(CASE WHEN dueDate > DATE_ADD(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as upcoming
                FROM assignments 
                WHERE isActive = 1
            ";
            
            $stmt = $db->prepare($sql);
            $stmt->execute();
            $result = $stmt->fetch(\PDO::FETCH_ASSOC);
            
            $stats['total'] = (int) $result['total'];
            $stats['overdue'] = (int) $result['overdue'];
            $stats['due_soon'] = (int) $result['due_soon'];
            $stats['upcoming'] = (int) $result['upcoming'];
            
            // Statistiques par classe
            $sql = "
                SELECT 
                    c.id,
                    c.name,
                    c.color,
                    COUNT(a.id) as assignment_count
                FROM classes c
                LEFT JOIN assignments a ON c.id = a.classeId AND a.isActive = 1
                WHERE c.isActive = 1
                GROUP BY c.id, c.name, c.color
                ORDER BY assignment_count DESC
            ";
            
            $stmt = $db->prepare($sql);
            $stmt->execute();
            $stats['by_classe'] = $stmt->fetchAll(\PDO::FETCH_ASSOC);
            
            return Response::success($stats);
            
        } catch (\Exception $e) {
            error_log('AssignmentController Error (getAssignmentStats): ' . $e->getMessage());
            return Response::error('Erreur lors de la récupération des statistiques: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Envoyer les notifications aux parents
     */
    private function sendAssignmentNotifications($assignment) {
        try {
            $emailService = new EmailService();
            $parents = $assignment->parents();
            
            foreach ($parents as $parent) {
                $emailSent = $emailService->sendAssignmentNotification(
                    $parent['email'],
                    $parent['firstName'] . ' ' . $parent['lastName'],
                    $assignment->toArray()
                );
                
                if ($emailSent) {
                    error_log("Notification de devoir envoyée à: " . $parent['email']);
                } else {
                    error_log("Erreur envoi notification à: " . $parent['email']);
                }
            }
            
        } catch (\Exception $e) {
            error_log('Erreur envoi notifications devoir: ' . $e->getMessage());
        }
    }
    
    /**
     * Déterminer le statut d'un devoir
     */
    private function getAssignmentStatus($dueDate) {
        if (!$dueDate) {
            return 'no_due_date';
        }
        
        $dueTimestamp = strtotime($dueDate);
        $now = time();
        
        if ($dueTimestamp < $now) {
            return 'overdue';
        } elseif ($dueTimestamp <= $now + (7 * 24 * 60 * 60)) { // 7 jours
            return 'due_soon';
        } else {
            return 'upcoming';
        }
    }
}

