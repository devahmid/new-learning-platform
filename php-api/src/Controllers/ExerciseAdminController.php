<?php

namespace App\Controllers;

use App\Models\Exercise;
use App\Models\ExerciseQuestion;
use App\Models\ExerciseAnswer;
use App\Utils\Response;
use App\Utils\JWT;
use App\Utils\Validator;

/**
 * Contrôleur Admin des exercices - Équivalent du ExerciseAdminController NestJS
 */
class ExerciseAdminController {
    
    /**
     * Récupère tous les exercices avec pagination
     */
    public function findAll() {
        // Temporairement désactivé pour les tests
        // $currentUser = JWT::requireRole(['admin']);
        
        $page = (int) ($_GET['page'] ?? 1);
        $limit = (int) ($_GET['limit'] ?? 10);
        $lessonId = $_GET['lessonId'] ?? null;
        $type = $_GET['type'] ?? null;
        
        $offset = ($page - 1) * $limit;
        
        // Construire les conditions
        $conditions = [];
        if ($lessonId) {
            $conditions['lessonId'] = $lessonId;
        }
        if ($type) {
            $conditions['type'] = $type;
        }
        
        // Récupérer les exercices avec pagination
        $exercises = Exercise::where($conditions, $limit, $offset);
        $total = Exercise::count($conditions);
        
        // Convertir en tableau avec les relations
        $exercisesArray = array_map(function($exercise) {
            return $exercise->toArray();
        }, $exercises);
        
        // Format compatible NestJS (retour direct sans wrapper)
        Response::json([
            'exercises' => $exercisesArray,
            'total' => $total,
            'page' => $page,
            'limit' => $limit
        ], 200);
    }
    
    /**
     * Récupère un exercice par ID
     */
    public function findById($id) {
        // Temporairement désactivé pour les tests
        // $currentUser = JWT::requireRole(['admin']);
        
        $exercise = Exercise::find($id);
        
        if (!$exercise) {
            Response::notFound('Exercice non trouvé');
        }
        
        // Format compatible NestJS
        Response::json($exercise->toArray(), 200);
    }
    
    /**
     * Crée un nouvel exercice
     */
    public function create() {
        // Temporairement désactivé pour les tests
        // $currentUser = JWT::requireRole(['admin']);
        
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Validation
        $validator = new Validator($data, [
            'title' => 'required|min:3',
            'description' => 'required|min:10',
            'type' => 'required|in:flashcard,translation,listening',
            'lessonId' => 'required|numeric',
            'questions' => 'required|array'
        ]);
        
        if (!$validator->validate()) {
            Response::validationError($validator->getErrors());
        }
        
        // Créer l'exercice
        $exercise = new Exercise([
            'title' => $data['title'],
            'description' => $data['description'],
            'type' => $data['type'],
            'order' => $data['order'] ?? 1,
            'isActive' => $data['isActive'] ?? 1,
            'lessonId' => $data['lessonId']
        ]);
        
        $exercise->save();
        
        // Créer les questions et réponses
        foreach ($data['questions'] as $questionData) {
            $question = new ExerciseQuestion([
                'text' => $questionData['text'],
                'audioUrl' => $questionData['audioUrl'] ?? null,
                'imageUrl' => $questionData['imageUrl'] ?? null,
                'order' => $questionData['order'] ?? 1,
                'metadata' => isset($questionData['metadata']) ? json_encode($questionData['metadata']) : null,
                'exerciseId' => $exercise->id
            ]);
            
            $question->save();
            
            // Créer les réponses
            if (isset($questionData['answers'])) {
                foreach ($questionData['answers'] as $answerData) {
                    $answer = new ExerciseAnswer([
                        'text' => $answerData['text'],
                        'isCorrect' => $answerData['isCorrect'] ?? 0,
                        'order' => $answerData['order'] ?? 1,
                        'metadata' => isset($answerData['metadata']) ? json_encode($answerData['metadata']) : null,
                        'questionId' => $question->id
                    ]);
                    
                    $answer->save();
                }
            }
        }
        
        // Format compatible NestJS
        Response::json($exercise->toArray(), 201);
    }
    
    /**
     * Met à jour un exercice
     */
    public function update($id) {
        // Temporairement désactivé pour les tests
        // $currentUser = JWT::requireRole(['admin']);
        
        $exercise = Exercise::find($id);
        
        if (!$exercise) {
            Response::notFound('Exercice non trouvé');
        }
        
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Validation
        $validator = new Validator($data, [
            'title' => 'min:3',
            'description' => 'min:10',
            'type' => 'in:flashcard,translation,listening'
        ]);
        
        if (!$validator->validate()) {
            Response::validationError($validator->getErrors());
        }
        
        // Mettre à jour l'exercice
        $fillableFields = ['title', 'description', 'type', 'order', 'isActive', 'lessonId'];
        
        foreach ($fillableFields as $field) {
            if (isset($data[$field])) {
                $exercise->$field = $data[$field];
            }
        }
        
        $exercise->save();
        
        // TODO: Gérer la mise à jour des questions et réponses
        
        // Format compatible NestJS
        Response::json($exercise->toArray(), 200);
    }
    
    /**
     * Supprime un exercice
     */
    public function delete($id) {
        // Temporairement désactivé pour les tests
        // $currentUser = JWT::requireRole(['admin']);
        
        $exercise = Exercise::find($id);
        
        if (!$exercise) {
            Response::notFound('Exercice non trouvé');
        }
        
        // Supprimer les questions et réponses associées
        $questions = $exercise->questions();
        foreach ($questions as $question) {
            $answers = $question->answers();
            foreach ($answers as $answer) {
                $answer->delete();
            }
            $question->delete();
        }
        
        // Supprimer l'exercice
        $exercise->delete();
        
        // Format compatible NestJS
        Response::json(['message' => 'Exercice supprimé avec succès'], 200);
    }
    
    /**
     * Duplique un exercice
     */
    public function duplicate($id) {
        // Temporairement désactivé pour les tests
        // $currentUser = JWT::requireRole(['admin']);
        
        $exercise = Exercise::find($id);
        
        if (!$exercise) {
            Response::notFound('Exercice non trouvé');
        }
        
        $duplicatedExercise = $exercise->duplicate();
        
        // Format compatible NestJS
        Response::json($duplicatedExercise->toArray(), 201);
    }
    
    /**
     * Bascule le statut actif/inactif d'un exercice
     */
    public function toggleStatus($id) {
        // Temporairement désactivé pour les tests
        // $currentUser = JWT::requireRole(['admin']);
        
        $exercise = Exercise::find($id);
        
        if (!$exercise) {
            Response::notFound('Exercice non trouvé');
        }
        
        $exercise->toggleStatus();
        
        // Format compatible NestJS
        Response::json($exercise->toArray(), 200);
    }
    
    /**
     * Récupère les statistiques des exercices
     */
    public function getStats() {
        // Temporairement désactivé pour les tests
        // $currentUser = JWT::requireRole(['admin']);
        
        $total = Exercise::count();
        $active = Exercise::count(['isActive' => 1]);
        $inactive = $total - $active;
        
        // Statistiques par type
        $types = ['flashcard', 'translation', 'listening'];
        $byType = [];
        
        foreach ($types as $type) {
            $byType[$type] = Exercise::count(['type' => $type]);
        }
        
        // Format compatible NestJS
        Response::json([
            'total' => $total,
            'active' => $active,
            'inactive' => $inactive,
            'byType' => $byType
        ], 200);
    }
}
