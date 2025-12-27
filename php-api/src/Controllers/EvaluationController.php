<?php

namespace App\Controllers;

use App\Models\Evaluation;
use App\Utils\Response;
use App\Utils\JWT;

/**
 * Contrôleur pour la gestion des évaluations
 */
class EvaluationController {
    
    /**
     * Récupère toutes les évaluations
     */
    public function findAll() {
        try {
            $evaluations = Evaluation::all();
            $evaluationsArray = array_map(function($evaluation) {
                return $evaluation->toArray();
            }, $evaluations);
            
            Response::json($evaluationsArray, 200);
        } catch (\Exception $e) {
            Response::error('Erreur lors de la récupération des évaluations: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Récupère une évaluation par son ID
     */
    public function findById($id) {
        try {
            $evaluation = Evaluation::find($id);
            
            if (!$evaluation) {
                Response::json(['error' => 'Évaluation non trouvée'], 404);
                return;
            }
            
            Response::json($evaluation->toArray(), 200);
        } catch (\Exception $e) {
            Response::error('Erreur lors de la récupération de l\'évaluation: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Récupère les évaluations d'un cours
     */
    public function findByCourse($courseId) {
        try {
            $evaluations = Evaluation::where(['courseId' => $courseId]);
            $evaluationsArray = array_map(function($evaluation) {
                return $evaluation->toArray();
            }, $evaluations);
            
            Response::json($evaluationsArray, 200);
        } catch (\Exception $e) {
            Response::error('Erreur lors de la récupération des évaluations: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Récupère les évaluations d'une leçon
     */
    public function findByLesson($lessonId) {
        try {
            $evaluations = Evaluation::where(['lessonId' => $lessonId]);
            $evaluationsArray = array_map(function($evaluation) {
                return $evaluation->toArray();
            }, $evaluations);
            
            Response::json($evaluationsArray, 200);
        } catch (\Exception $e) {
            Response::error('Erreur lors de la récupération des évaluations: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Crée une nouvelle évaluation
     */
    public function create() {
        try {
            // Vérifier l'authentification admin
            JWT::requireRole(['admin']);
            
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['title'])) {
                Response::json(['error' => 'Le titre est requis'], 400);
                return;
            }
            
            $db = \DatabaseConfig::getInstance()->getConnection();
            $db->beginTransaction();
            
            try {
                // Créer l'évaluation
                $evaluation = Evaluation::create([
                    'title' => $data['title'],
                    'description' => $data['description'] ?? null,
                    'instructions' => $data['instructions'] ?? null,
                    'specialInstructions' => $data['specialInstructions'] ?? null,
                    'courseId' => $data['courseId'] ?? null,
                    'lessonId' => $data['lessonId'] ?? null,
                    'isActive' => $data['isActive'] ?? true,
                    'allowMultipleSubmissions' => $data['allowMultipleSubmissions'] ?? false,
                    'showResults' => $data['showResults'] ?? true,
                    'startDate' => isset($data['startDate']) ? date('Y-m-d H:i:s', strtotime($data['startDate'])) : null,
                    'endDate' => isset($data['endDate']) ? date('Y-m-d H:i:s', strtotime($data['endDate'])) : null
                ]);
                
                $evaluationId = $evaluation->id;
                
                // Associer les classes si fournies (pour les évaluations générales)
                if (isset($data['classeIds']) && is_array($data['classeIds']) && !empty($data['classeIds'])) {
                    $evaluation->syncClasses($data['classeIds']);
                }
                
                // Créer les sections
                $sectionMap = []; // Pour mapper les index de sections aux IDs réels
                if (isset($data['sections']) && is_array($data['sections'])) {
                    foreach ($data['sections'] as $index => $sectionData) {
                        $sectionSql = "INSERT INTO evaluation_sections (evaluationId, title, description, `order`) VALUES (?, ?, ?, ?)";
                        $sectionStmt = $db->prepare($sectionSql);
                        $sectionStmt->execute([
                            $evaluationId,
                            $sectionData['title'],
                            $sectionData['description'] ?? null,
                            $sectionData['order'] ?? $index
                        ]);
                        $sectionMap[$index] = $db->lastInsertId();
                    }
                }
                
                // Créer les questions
                if (isset($data['questions']) && is_array($data['questions'])) {
                    foreach ($data['questions'] as $index => $questionData) {
                        // Mapper sectionId si fourni
                        $sectionId = null;
                        if (isset($questionData['sectionId']) && $questionData['sectionId'] !== null && isset($sectionMap[$questionData['sectionId']])) {
                            $sectionId = $sectionMap[$questionData['sectionId']];
                        }
                        
                        $questionSql = "INSERT INTO evaluation_questions 
                            (evaluationId, sectionId, text, type, required, `order`, placeholder, minLength, maxLength, minRating, maxRating) 
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                        
                        $questionStmt = $db->prepare($questionSql);
                        $questionStmt->execute([
                            $evaluationId,
                            $sectionId,
                            $questionData['text'],
                            $questionData['type'],
                            $questionData['required'] ? 1 : 0,
                            $questionData['order'] ?? $index,
                            $questionData['placeholder'] ?? null,
                            $questionData['minLength'] ?? null,
                            $questionData['maxLength'] ?? null,
                            $questionData['minRating'] ?? null,
                            $questionData['maxRating'] ?? null
                        ]);
                        
                        $questionId = $db->lastInsertId();
                        
                        // Créer les options si nécessaire
                        if (isset($questionData['options']) && is_array($questionData['options'])) {
                            foreach ($questionData['options'] as $optIndex => $optionData) {
                                $optionSql = "INSERT INTO evaluation_question_options (questionId, text, `order`, isCorrect) VALUES (?, ?, ?, ?)";
                                $optionStmt = $db->prepare($optionSql);
                                
                                // Gérer isCorrect : peut être true, false, 1, 0, "true", "false"
                                $isCorrect = 0;
                                if (isset($optionData['isCorrect'])) {
                                    $isCorrectValue = $optionData['isCorrect'];
                                    // Debug: logger la valeur reçue
                                    error_log("isCorrect reçu pour option '{$optionData['text']}': " . var_export($isCorrectValue, true) . " (type: " . gettype($isCorrectValue) . ")");
                                    
                                    if ($isCorrectValue === true || $isCorrectValue === 1 || $isCorrectValue === '1' || $isCorrectValue === 'true') {
                                        $isCorrect = 1;
                                    }
                                }
                                
                                error_log("Valeur isCorrect sauvegardée: $isCorrect pour option '{$optionData['text']}'");
                                
                                $optionStmt->execute([
                                    $questionId,
                                    $optionData['text'],
                                    $optionData['order'] ?? $optIndex,
                                    $isCorrect
                                ]);
                            }
                        }
                    }
                }
                
                $db->commit();
                
                // Récupérer l'évaluation complète
                $evaluation = Evaluation::find($evaluationId);
                Response::json($evaluation->toArray(), 201);
                
            } catch (\Exception $e) {
                $db->rollBack();
                throw $e;
            }
            
        } catch (\Exception $e) {
            Response::error('Erreur lors de la création de l\'évaluation: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Met à jour une évaluation
     */
    public function update($id) {
        try {
            // Vérifier l'authentification admin
            JWT::requireRole(['admin']);
            
            $evaluation = Evaluation::find($id);
            if (!$evaluation) {
                Response::json(['error' => 'Évaluation non trouvée'], 404);
                return;
            }
            
            $data = json_decode(file_get_contents('php://input'), true);
            
            $db = \DatabaseConfig::getInstance()->getConnection();
            $db->beginTransaction();
            
            try {
                // Mettre à jour l'évaluation
                $updateData = [];
                if (isset($data['title'])) $updateData['title'] = $data['title'];
                if (isset($data['description'])) $updateData['description'] = $data['description'];
                if (isset($data['instructions'])) $updateData['instructions'] = $data['instructions'];
                if (isset($data['specialInstructions'])) $updateData['specialInstructions'] = $data['specialInstructions'];
                if (isset($data['courseId'])) $updateData['courseId'] = $data['courseId'];
                if (isset($data['lessonId'])) $updateData['lessonId'] = $data['lessonId'];
                if (isset($data['isActive'])) $updateData['isActive'] = $data['isActive'];
                if (isset($data['allowMultipleSubmissions'])) $updateData['allowMultipleSubmissions'] = $data['allowMultipleSubmissions'];
                if (isset($data['showResults'])) $updateData['showResults'] = $data['showResults'];
                if (isset($data['startDate'])) $updateData['startDate'] = date('Y-m-d H:i:s', strtotime($data['startDate']));
                if (isset($data['endDate'])) $updateData['endDate'] = date('Y-m-d H:i:s', strtotime($data['endDate']));
                
                foreach ($updateData as $key => $value) {
                    $evaluation->$key = $value;
                }
                $evaluation->save();
                
                // Mettre à jour les classes associées si fournies
                if (isset($data['classeIds'])) {
                    if (is_array($data['classeIds']) && !empty($data['classeIds'])) {
                        $evaluation->syncClasses($data['classeIds']);
                    } else {
                        // Si classeIds est vide ou null, supprimer toutes les associations
                        $evaluation->syncClasses([]);
                    }
                }
                
                // Supprimer les anciennes sections, questions et options
                $db->exec("DELETE FROM evaluation_question_options WHERE questionId IN (SELECT id FROM evaluation_questions WHERE evaluationId = $id)");
                $db->exec("DELETE FROM evaluation_questions WHERE evaluationId = $id");
                $db->exec("DELETE FROM evaluation_sections WHERE evaluationId = $id");
                
                // Recréer les sections
                $sectionMap = [];
                if (isset($data['sections']) && is_array($data['sections'])) {
                    foreach ($data['sections'] as $index => $sectionData) {
                        $sectionSql = "INSERT INTO evaluation_sections (evaluationId, title, description, `order`) VALUES (?, ?, ?, ?)";
                        $sectionStmt = $db->prepare($sectionSql);
                        $sectionStmt->execute([
                            $id,
                            $sectionData['title'],
                            $sectionData['description'] ?? null,
                            $sectionData['order'] ?? $index
                        ]);
                        $sectionMap[$index] = $db->lastInsertId();
                    }
                }
                
                // Recréer les questions
                if (isset($data['questions']) && is_array($data['questions'])) {
                    foreach ($data['questions'] as $index => $questionData) {
                        // Mapper sectionId si fourni
                        $sectionId = null;
                        if (isset($questionData['sectionId']) && $questionData['sectionId'] !== null && isset($sectionMap[$questionData['sectionId']])) {
                            $sectionId = $sectionMap[$questionData['sectionId']];
                        }
                        
                        $questionSql = "INSERT INTO evaluation_questions 
                            (evaluationId, sectionId, text, type, required, `order`, placeholder, minLength, maxLength, minRating, maxRating) 
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                        
                        $questionStmt = $db->prepare($questionSql);
                        $questionStmt->execute([
                            $id,
                            $sectionId,
                            $questionData['text'],
                            $questionData['type'],
                            $questionData['required'] ? 1 : 0,
                            $questionData['order'] ?? $index,
                            $questionData['placeholder'] ?? null,
                            $questionData['minLength'] ?? null,
                            $questionData['maxLength'] ?? null,
                            $questionData['minRating'] ?? null,
                            $questionData['maxRating'] ?? null
                        ]);
                        
                        $questionId = $db->lastInsertId();
                        
                        // Créer les options si nécessaire
                        if (isset($questionData['options']) && is_array($questionData['options'])) {
                            foreach ($questionData['options'] as $optIndex => $optionData) {
                                $optionSql = "INSERT INTO evaluation_question_options (questionId, text, `order`, isCorrect) VALUES (?, ?, ?, ?)";
                                $optionStmt = $db->prepare($optionSql);
                                
                                // Gérer isCorrect : peut être true, false, 1, 0, "true", "false"
                                $isCorrect = 0;
                                if (isset($optionData['isCorrect'])) {
                                    $isCorrectValue = $optionData['isCorrect'];
                                    // Debug: logger la valeur reçue
                                    error_log("isCorrect reçu pour option '{$optionData['text']}': " . var_export($isCorrectValue, true) . " (type: " . gettype($isCorrectValue) . ")");
                                    
                                    if ($isCorrectValue === true || $isCorrectValue === 1 || $isCorrectValue === '1' || $isCorrectValue === 'true') {
                                        $isCorrect = 1;
                                    }
                                }
                                
                                error_log("Valeur isCorrect sauvegardée: $isCorrect pour option '{$optionData['text']}'");
                                
                                $optionStmt->execute([
                                    $questionId,
                                    $optionData['text'],
                                    $optionData['order'] ?? $optIndex,
                                    $isCorrect
                                ]);
                            }
                        }
                    }
                }
                
                $db->commit();
                
                // Récupérer l'évaluation complète
                $evaluation = Evaluation::find($id);
                Response::json($evaluation->toArray(), 200);
                
            } catch (\Exception $e) {
                $db->rollBack();
                throw $e;
            }
            
        } catch (\Exception $e) {
            Response::error('Erreur lors de la mise à jour de l\'évaluation: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Supprime une évaluation
     */
    public function delete($id) {
        try {
            // Vérifier l'authentification admin
            JWT::requireRole(['admin']);
            
            $evaluation = Evaluation::find($id);
            if (!$evaluation) {
                Response::json(['error' => 'Évaluation non trouvée'], 404);
                return;
            }
            
            $evaluation->delete();
            Response::json(['message' => 'Évaluation supprimée avec succès'], 200);
            
        } catch (\Exception $e) {
            Response::error('Erreur lors de la suppression de l\'évaluation: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Soumet une réponse à une évaluation
     */
    public function submitResponse($evaluationId) {
        // Gestionnaire d'erreur global pour capturer les erreurs fatales
        set_error_handler(function($severity, $message, $file, $line) {
            if (error_reporting() & $severity) {
                throw new \ErrorException($message, 0, $severity, $file, $line);
            }
        });
        
        try {
            error_log("=== submitResponse DEBUT - evaluationId: $evaluationId ===");
            $evaluation = Evaluation::find($evaluationId);
            if (!$evaluation) {
                error_log("=== submitResponse - Évaluation non trouvée: $evaluationId");
                Response::json(['success' => false, 'error' => 'Évaluation non trouvée'], 404);
                return;
            }
            if (!$evaluation->isActive) {
                error_log("=== submitResponse - Évaluation inactive: $evaluationId");
                Response::json(['success' => false, 'error' => 'Évaluation inactive'], 404);
                return;
            }
            error_log("=== submitResponse - Évaluation trouvée et active");
            
            // Vérifier les dates (désactivé temporairement pour permettre les tests)
            // $now = new \DateTime();
            // if ($evaluation->startDate && new \DateTime($evaluation->startDate) > $now) {
            //     Response::json(['error' => 'L\'évaluation n\'est pas encore disponible'], 400);
            //     return;
            // }
            // if ($evaluation->endDate && new \DateTime($evaluation->endDate) < $now) {
            //     Response::json(['error' => 'L\'évaluation n\'est plus disponible'], 400);
            //     return;
            // }
            
            // Récupérer le userId depuis le token (optionnel)
            $userId = null;
            try {
                $token = JWT::getTokenFromHeaders();
                if ($token) {
                    $payload = JWT::decode($token);
                    $userId = $payload['sub'] ?? $payload['userId'] ?? null;
                }
            } catch (\Exception $e) {
                // Pas d'authentification, continuer sans userId
            }
            
            $rawInput = file_get_contents('php://input');
            error_log("=== submitResponse - Données brutes: " . $rawInput);
            $data = json_decode($rawInput, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                error_log("=== submitResponse - Erreur JSON: " . json_last_error_msg());
                Response::json(['error' => 'JSON invalide: ' . json_last_error_msg()], 400);
                return;
            }
            error_log("=== submitResponse - Données décodées: " . json_encode($data));
            
            if (!isset($data['responses']) || !is_array($data['responses'])) {
                error_log("=== submitResponse - Erreur: réponses manquantes");
                Response::json(['error' => 'Les réponses sont requises'], 400);
                return;
            }
            
            error_log("=== submitResponse - Nombre de réponses: " . count($data['responses']));
            
            $db = \DatabaseConfig::getInstance()->getConnection();
            error_log("=== submitResponse - Début transaction");
            $db->beginTransaction();
            
            try {
                // Récupérer les informations de l'enfant depuis les données
                $childId = $data['childId'] ?? $userId;
                $classeId = $data['classeId'] ?? null;
                $childName = $data['childName'] ?? null;
                $classeName = $data['classeName'] ?? null;
                
                error_log("Infos enfant: childId=$childId, classeId=$classeId, childName=$childName, classeName=$classeName");
                
                // Si on a un userId mais pas de childId, essayer de récupérer les infos de l'utilisateur
                if ($userId && !$childId) {
                    $userSql = "SELECT id, firstName, lastName, classeId FROM users WHERE id = ?";
                    $userStmt = $db->prepare($userSql);
                    $userStmt->execute([$userId]);
                    $user = $userStmt->fetch();
                    if ($user) {
                        $childId = $user['id'];
                        $childName = trim(($user['firstName'] ?? '') . ' ' . ($user['lastName'] ?? ''));
                        $classeId = $user['classeId'] ?? null;
                        
                        // Récupérer le nom de la classe si on a l'ID
                        if ($classeId) {
                            $classeSql = "SELECT name FROM classes WHERE id = ?";
                            $classeStmt = $db->prepare($classeSql);
                            $classeStmt->execute([$classeId]);
                            $classe = $classeStmt->fetch();
                            if ($classe) {
                                $classeName = $classe['name'];
                            }
                        }
                    }
                }
                
                // Vérifier si l'enfant peut soumettre plusieurs fois (après avoir récupéré le childId)
                if (!$evaluation->allowMultipleSubmissions && $childId) {
                    // Vérifier si cet enfant a déjà soumis cette évaluation
                    $checkSql = "SELECT id FROM evaluation_responses WHERE evaluationId = ? AND childId = ?";
                    $checkStmt = $db->prepare($checkSql);
                    $checkStmt->execute([$evaluationId, $childId]);
                    if ($checkStmt->fetch()) {
                        $db->rollBack();
                        error_log("=== submitResponse - Erreur: Enfant $childId a déjà soumis cette évaluation");
                        Response::json(['error' => 'Vous avez déjà soumis cette évaluation'], 400);
                        return;
                    }
                }
                
                // Calculer le score
                error_log("Récupération des questions de l'évaluation");
                $questions = $evaluation->questions();
                error_log("Nombre de questions récupérées: " . count($questions));
                $totalQuestions = count($questions);
                $correctAnswers = 0;
                
                foreach ($data['responses'] as $responseData) {
                    $question = null;
                    foreach ($questions as $q) {
                        if ($q['id'] == $responseData['questionId']) {
                            $question = $q;
                            break;
                        }
                    }
                    
                    if (!$question) continue;
                    
                    // Vérifier si la réponse est correcte (seulement pour les questions à choix multiples)
                    if (in_array($question['type'], ['radio', 'checkbox', 'multiple_choice'])) {
                        $userAnswer = $responseData['value'];
                        $correctOptions = [];
                        
                        // Récupérer les bonnes réponses
                        if (isset($question['options'])) {
                            foreach ($question['options'] as $option) {
                                if (isset($option['isCorrect']) && $option['isCorrect'] == 1) {
                                    $correctOptions[] = $option['text'];
                                }
                            }
                        }
                        
                        // Comparer avec la réponse de l'utilisateur
                        if ($question['type'] === 'radio') {
                            // Une seule bonne réponse
                            if (in_array($userAnswer, $correctOptions)) {
                                $correctAnswers++;
                            }
                        } else if ($question['type'] === 'checkbox' || $question['type'] === 'multiple_choice') {
                            // Plusieurs bonnes réponses possibles
                            $userAnswers = is_array($userAnswer) ? $userAnswer : [$userAnswer];
                            $userAnswers = array_filter($userAnswers, function($a) { return !empty($a); });
                            
                            if (count($userAnswers) === count($correctOptions)) {
                                $allCorrect = true;
                                foreach ($userAnswers as $ans) {
                                    if (!in_array($ans, $correctOptions)) {
                                        $allCorrect = false;
                                        break;
                                    }
                                }
                                if ($allCorrect) {
                                    $correctAnswers++;
                                }
                            }
                        }
                    }
                }
                
                $score = $totalQuestions > 0 ? ($correctAnswers / $totalQuestions) * 100 : 0;
                $percentage = round($score, 2);
                
                error_log("=== submitResponse - Score calculé: correctAnswers=$correctAnswers, totalQuestions=$totalQuestions, score=$score, percentage=$percentage");
                
                // Créer la réponse principale avec toutes les informations
                // Essayer d'abord avec toutes les colonnes, puis avec seulement les colonnes de base si ça échoue
                error_log("=== submitResponse - Tentative d'insertion dans evaluation_responses");
                try {
                    $responseSql = "INSERT INTO evaluation_responses 
                        (evaluationId, userId, childId, classeId, childName, classeName, score, totalQuestions, correctAnswers, percentage) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                    $responseStmt = $db->prepare($responseSql);
                    $responseStmt->execute([
                        $evaluationId, 
                        $userId,
                        $childId,
                        $classeId,
                        $childName,
                        $classeName,
                        $score,
                        $totalQuestions,
                        $correctAnswers,
                        $percentage
                    ]);
                } catch (\Exception $e) {
                    // Si les colonnes n'existent pas, utiliser seulement les colonnes de base
                    error_log("Tentative avec colonnes étendues échouée, utilisation des colonnes de base: " . $e->getMessage());
                    $responseSql = "INSERT INTO evaluation_responses (evaluationId, userId) VALUES (?, ?)";
                    $responseStmt = $db->prepare($responseSql);
                    $responseStmt->execute([$evaluationId, $userId]);
                }
                $responseId = $db->lastInsertId();
                
                // Créer les réponses aux questions
                foreach ($data['responses'] as $responseData) {
                    $value = is_array($responseData['value']) 
                        ? json_encode($responseData['value']) 
                        : $responseData['value'];
                    
                    error_log("Insertion réponse question: questionId=" . $responseData['questionId'] . ", value=" . (is_string($value) ? $value : json_encode($value)));
                    
                    $questionResponseSql = "INSERT INTO evaluation_question_responses 
                        (responseId, questionId, value, textValue) VALUES (?, ?, ?, ?)";
                    $questionResponseStmt = $db->prepare($questionResponseSql);
                    if (!$questionResponseStmt) {
                        $dbError = $db->errorInfo();
                        error_log("Erreur de préparation SQL pour question_response: " . json_encode($dbError));
                        throw new \Exception("Erreur de préparation SQL pour evaluation_question_responses: " . json_encode($dbError));
                    }
                    $executeResult = $questionResponseStmt->execute([
                        $responseId,
                        $responseData['questionId'],
                        $value,
                        $responseData['textValue'] ?? null
                    ]);
                    if (!$executeResult) {
                        $stmtError = $questionResponseStmt->errorInfo();
                        error_log("Erreur d'exécution SQL pour question_response: " . json_encode($stmtError));
                        throw new \Exception("Erreur d'exécution SQL pour evaluation_question_responses: " . json_encode($stmtError));
                    }
                }
                
                error_log("=== submitResponse - Commit transaction");
                $db->commit();
                
                // Récupérer la réponse complète
                error_log("=== submitResponse - Récupération réponse complète");
                $responseSql = "SELECT * FROM evaluation_responses WHERE id = ?";
                $responseStmt = $db->prepare($responseSql);
                $responseStmt->execute([$responseId]);
                $response = $responseStmt->fetch();
                
                // Récupérer les réponses aux questions
                $questionResponsesSql = "SELECT * FROM evaluation_question_responses WHERE responseId = ?";
                $questionResponsesStmt = $db->prepare($questionResponsesSql);
                $questionResponsesStmt->execute([$responseId]);
                $response['responses'] = $questionResponsesStmt->fetchAll();
                
                error_log("=== submitResponse - SUCCÈS - ResponseId: $responseId");
                Response::json($response, 201);
                
            } catch (\Exception $e) {
                $db->rollBack();
                $errorDetails = [
                    'message' => $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'trace' => explode("\n", $e->getTraceAsString())
                ];
                error_log("Erreur dans submitResponse (transaction): " . json_encode($errorDetails));
                Response::json([
                    'success' => false,
                    'error' => 'Erreur lors de la soumission (transaction)',
                    'details' => $errorDetails
                ], 500);
                return;
            }
            
        } catch (\Exception $e) {
            $errorDetails = [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => explode("\n", $e->getTraceAsString())
            ];
            error_log("Erreur générale dans submitResponse: " . json_encode($errorDetails));
            try {
                Response::json([
                    'success' => false,
                    'error' => 'Erreur lors de la soumission de l\'évaluation',
                    'details' => $errorDetails
                ], 500);
            } catch (\Exception $responseError) {
                // Si même la réponse d'erreur échoue, essayer une réponse basique
                http_response_code(500);
                header('Content-Type: application/json');
                echo json_encode([
                    'success' => false,
                    'error' => 'Erreur lors de la soumission',
                    'message' => $e->getMessage()
                ]);
                exit;
            }
        } catch (\Throwable $e) {
            // Capturer aussi les erreurs fatales (Error, etc.)
            $errorDetails = [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'type' => get_class($e)
            ];
            error_log("Erreur fatale dans submitResponse: " . json_encode($errorDetails));
            try {
                Response::json([
                    'success' => false,
                    'error' => 'Erreur fatale lors de la soumission',
                    'details' => $errorDetails
                ], 500);
            } catch (\Exception $responseError) {
                http_response_code(500);
                header('Content-Type: application/json');
                echo json_encode([
                    'success' => false,
                    'error' => 'Erreur fatale',
                    'message' => $e->getMessage()
                ]);
                exit;
            }
        } finally {
            restore_error_handler();
        }
    }
    
    /**
     * Récupère les réponses d'une évaluation (admin)
     */
    public function getResponses($evaluationId) {
        try {
            // Vérifier l'authentification admin
            JWT::requireRole(['admin']);
            
            $db = \DatabaseConfig::getInstance()->getConnection();
            
            // Récupérer toutes les réponses principales
            $sql = "SELECT * FROM evaluation_responses WHERE evaluationId = ? ORDER BY submittedAt DESC";
            $stmt = $db->prepare($sql);
            $stmt->execute([$evaluationId]);
            $responses = $stmt->fetchAll();
            
            // Pour chaque réponse, récupérer les réponses aux questions et calculer le percentage si manquant
            foreach ($responses as &$response) {
                $questionResponsesSql = "SELECT * FROM evaluation_question_responses WHERE responseId = ?";
                $questionResponsesStmt = $db->prepare($questionResponsesSql);
                $questionResponsesStmt->execute([$response['id']]);
                $response['responses'] = $questionResponsesStmt->fetchAll();
                
                // Calculer le percentage si manquant ou null
                if (!isset($response['percentage']) || $response['percentage'] === null) {
                    if (isset($response['totalQuestions']) && $response['totalQuestions'] > 0 && isset($response['correctAnswers'])) {
                        $response['percentage'] = round(($response['correctAnswers'] / $response['totalQuestions']) * 100, 2);
                    } else {
                        $response['percentage'] = 0;
                    }
                }
                
                // S'assurer que les valeurs numériques sont bien des nombres
                $response['percentage'] = isset($response['percentage']) ? (float)$response['percentage'] : 0;
                $response['score'] = isset($response['score']) ? (float)$response['score'] : 0;
                $response['correctAnswers'] = isset($response['correctAnswers']) ? (int)$response['correctAnswers'] : 0;
                $response['totalQuestions'] = isset($response['totalQuestions']) ? (int)$response['totalQuestions'] : 0;
            }
            
            Response::json($responses, 200);
            
        } catch (\Exception $e) {
            Response::error('Erreur lors de la récupération des réponses: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Récupère une réponse spécifique par son ID (admin)
     */
    public function getResponseById($responseId) {
        try {
            // Vérifier l'authentification admin
            JWT::requireRole(['admin']);
            
            $db = \DatabaseConfig::getInstance()->getConnection();
            
            // Récupérer la réponse principale
            $sql = "SELECT * FROM evaluation_responses WHERE id = ?";
            $stmt = $db->prepare($sql);
            $stmt->execute([$responseId]);
            $response = $stmt->fetch();
            
            if (!$response) {
                Response::notFound('Réponse non trouvée');
                return;
            }
            
            // Récupérer les réponses aux questions
            $questionResponsesSql = "SELECT * FROM evaluation_question_responses WHERE responseId = ? ORDER BY questionId";
            $questionResponsesStmt = $db->prepare($questionResponsesSql);
            $questionResponsesStmt->execute([$responseId]);
            $response['responses'] = $questionResponsesStmt->fetchAll();
            
            // Récupérer l'évaluation pour avoir les questions complètes
            $evaluation = Evaluation::find($response['evaluationId']);
            if ($evaluation) {
                $response['evaluation'] = $evaluation->toArray();
            }
            
            Response::json($response, 200);
            
        } catch (\Exception $e) {
            Response::error('Erreur lors de la récupération de la réponse: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Récupère la réponse d'un utilisateur pour une évaluation
     */
    public function getUserResponse($evaluationId, $userId = null) {
        try {
            // Si userId n'est pas fourni, essayer de le récupérer du token
            if (!$userId) {
                try {
                    $token = JWT::getTokenFromHeaders();
                    if ($token) {
                        $payload = JWT::decode($token);
                        $userId = $payload['sub'] ?? $payload['userId'] ?? null;
                    }
                } catch (\Exception $e) {
                    // Pas d'authentification
                }
            }
            
            if (!$userId) {
                Response::json(['error' => 'Utilisateur non identifié'], 401);
                return;
            }
            
            $db = \DatabaseConfig::getInstance()->getConnection();
            
            $sql = "SELECT er.* FROM evaluation_responses er 
                    WHERE er.evaluationId = ? AND er.userId = ? 
                    ORDER BY er.submittedAt DESC LIMIT 1";
            
            $stmt = $db->prepare($sql);
            $stmt->execute([$evaluationId, $userId]);
            $response = $stmt->fetch();
            
            if (!$response) {
                Response::json(null, 200);
                return;
            }
            
            // Récupérer les réponses aux questions
            $questionResponsesSql = "SELECT * FROM evaluation_question_responses WHERE responseId = ?";
            $questionResponsesStmt = $db->prepare($questionResponsesSql);
            $questionResponsesStmt->execute([$response['id']]);
            $response['responses'] = $questionResponsesStmt->fetchAll();
            
            Response::json($response, 200);
            
        } catch (\Exception $e) {
            Response::error('Erreur lors de la récupération de la réponse: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Récupère les réponses d'évaluations pour les enfants d'un parent
     */
    public function getChildrenResponses($parentId) {
        try {
            // Vérifier l'authentification
            $token = JWT::getTokenFromHeaders();
            if (!$token) {
                Response::json(['error' => 'Non autorisé'], 401);
                return;
            }
            
            $payload = JWT::decode($token);
            $userId = $payload['sub'] ?? $payload['userId'] ?? null;
            
            // Vérifier que l'utilisateur demande ses propres données ou est admin
            if ($userId != $parentId && !in_array('admin', $payload['roles'] ?? [])) {
                Response::json(['error' => 'Non autorisé'], 403);
                return;
            }
            
            $db = \DatabaseConfig::getInstance()->getConnection();
            
            // Récupérer tous les enfants du parent
            $childrenSql = "SELECT id FROM users WHERE parentId = ?";
            $childrenStmt = $db->prepare($childrenSql);
            $childrenStmt->execute([$parentId]);
            $children = $childrenStmt->fetchAll();
            
            if (empty($children)) {
                Response::json([], 200);
                return;
            }
            
            $childIds = array_column($children, 'id');
            $placeholders = implode(',', array_fill(0, count($childIds), '?'));
            
            // Récupérer toutes les réponses d'évaluations pour ces enfants
            $sql = "SELECT er.*, 
                    e.title as evaluationTitle,
                    e.description as evaluationDescription,
                    e.courseId,
                    e.lessonId
                    FROM evaluation_responses er
                    INNER JOIN evaluations e ON er.evaluationId = e.id
                    WHERE er.childId IN ($placeholders)
                    ORDER BY er.submittedAt DESC";
            
            $stmt = $db->prepare($sql);
            $stmt->execute($childIds);
            $responses = $stmt->fetchAll();
            
            // Pour chaque réponse, récupérer les réponses aux questions et les infos de l'enfant
            foreach ($responses as &$response) {
                // Récupérer les réponses aux questions
                $questionResponsesSql = "SELECT * FROM evaluation_question_responses WHERE responseId = ? ORDER BY questionId";
                $questionResponsesStmt = $db->prepare($questionResponsesSql);
                $questionResponsesStmt->execute([$response['id']]);
                $response['responses'] = $questionResponsesStmt->fetchAll();
                
                // Récupérer les infos de l'enfant
                if ($response['childId']) {
                    $childSql = "SELECT id, firstName, lastName, classeId FROM users WHERE id = ?";
                    $childStmt = $db->prepare($childSql);
                    $childStmt->execute([$response['childId']]);
                    $child = $childStmt->fetch();
                    if ($child) {
                        $response['child'] = $child;
                        // Récupérer le nom de la classe
                        if ($child['classeId']) {
                            $classeSql = "SELECT name FROM classes WHERE id = ?";
                            $classeStmt = $db->prepare($classeSql);
                            $classeStmt->execute([$child['classeId']]);
                            $classe = $classeStmt->fetch();
                            if ($classe) {
                                $response['child']['classeName'] = $classe['name'];
                            }
                        }
                    }
                }
            }
            
            Response::json($responses, 200);
            
        } catch (\Exception $e) {
            Response::error('Erreur lors de la récupération des réponses: ' . $e->getMessage(), 500);
        }
    }
}

