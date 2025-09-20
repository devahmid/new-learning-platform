<?php

namespace App\Controllers;

use App\Models\Course;
use App\Models\Lesson;
use App\Models\Exercise;
use App\Models\Quiz;
use App\Utils\Response;
use App\Utils\JWT;

/**
 * Contrôleur Admin pour la gestion des cours
 * Équivalent des endpoints admin/courses de NestJS
 */
class AdminCourseController {
    
    /**
     * Récupère tous les cours (version admin)
     */
    public function getAllCourses() {
        // Vérifier l'authentification admin
        JWT::requireRole(['admin']);
        
        try {
            $courses = Course::all();
            $coursesArray = array_map(function($course) {
                return $course->toArray();
            }, $courses);
            
            Response::success($coursesArray, 'Cours récupérés avec succès');
            
        } catch (\Exception $e) {
            Response::error('Erreur lors de la récupération des cours: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Récupère un cours par ID (version admin)
     */
    public function getCourseById($id) {
        // Vérifier l'authentification admin
        JWT::requireRole(['admin']);
        
        try {
            $course = Course::find($id);
            
            if (!$course) {
                Response::notFound('Cours non trouvé');
                return;
            }
            
            Response::success($course->toArray(), 'Cours récupéré avec succès');
            
        } catch (\Exception $e) {
            Response::error('Erreur lors de la récupération du cours: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Crée un nouveau cours (version admin)
     */
    public function createCourse() {
        // Vérifier l'authentification admin et récupérer l'utilisateur connecté
        $user = JWT::requireRole(['admin']);
        
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Validation
            $validator = new \App\Utils\Validator($data, [
                'title' => 'required|min:2',
                'description' => 'required|min:10',
                'classeId' => 'required|integer',
                'categoryId' => 'required|integer'
            ]);
            
            if (!$validator->validate()) {
                Response::validationError($validator->getErrors());
                return;
            }
            
            // Vérifier que categoryId existe si fourni
            $categoryId = null;
            if (isset($data['categoryId']) && !empty($data['categoryId'])) {
                // Vérifier que la catégorie existe
                $db = \DatabaseConfig::getInstance()->getConnection();
                $stmt = $db->prepare("SELECT id FROM categories WHERE id = ?");
                $stmt->execute([$data['categoryId']]);
                if ($stmt->fetch()) {
                    $categoryId = $data['categoryId'];
                } else {
                    Response::error('La catégorie spécifiée n\'existe pas', 400);
                    return;
                }
            } else {
                Response::error('categoryId est requis', 400);
                return;
            }
            
            // Vérifier que subcategoryId existe si fourni
            $subcategoryId = null;
            if (isset($data['subcategoryId']) && !empty($data['subcategoryId'])) {
                // Vérifier que la sous-catégorie existe
                $db = \DatabaseConfig::getInstance()->getConnection();
                $stmt = $db->prepare("SELECT id FROM subcategories WHERE id = ?");
                $stmt->execute([$data['subcategoryId']]);
                if ($stmt->fetch()) {
                    $subcategoryId = $data['subcategoryId'];
                }
                // Si la sous-catégorie n'existe pas, on laisse subcategoryId à null
            }
            
            // Vérifier que l'instructorId existe si fourni, sinon utiliser l'utilisateur connecté
            $instructorId = $user['id']; // Utiliser l'ID de l'utilisateur connecté par défaut
            
            if (isset($data['instructorId']) && !empty($data['instructorId'])) {
                $db = \DatabaseConfig::getInstance()->getConnection();
                $stmt = $db->prepare("SELECT id FROM users WHERE id = ?");
                $stmt->execute([$data['instructorId']]);
                if ($stmt->fetch()) {
                    $instructorId = $data['instructorId'];
                } else {
                    Response::error('L\'instructeur spécifié n\'existe pas', 400);
                    return;
                }
            }
            
            // Debug: Log des données reçues
            error_log("DEBUG createCourse - Données reçues: " . json_encode($data));
            error_log("DEBUG createCourse - categoryId vérifié: $categoryId");
            error_log("DEBUG createCourse - subcategoryId vérifié: " . ($subcategoryId ?? 'null'));
            error_log("DEBUG createCourse - classeId: " . $data['classeId']);
            
            // Créer le cours
            $course = new Course([
                'title' => $data['title'],
                'description' => $data['description'],
                'classeId' => $data['classeId'],
                'categoryId' => $categoryId, // Utiliser la variable vérifiée
                'subcategoryId' => $subcategoryId,
                'instructorId' => $instructorId, // Utiliser l'ID vérifié
                'price' => $data['price'] ?? '0.00',
                'discountPrice' => $data['discountPrice'] ?? null,
                'tags' => $data['tags'] ?? null,
                'isActive' => $data['isActive'] ?? true,
                'videoUrl' => $data['videoUrl'] ?? null,
                'pdfUrl' => $data['pdfUrl'] ?? null,
                'imageUrl' => $data['imageUrl'] ?? null,
                'duration' => $data['duration'] ?? null,
                'difficulty' => $data['difficulty'] ?? 'débutant'
            ]);
            
            $course->save();
            
            // Debug: Log du cours sauvegardé
            error_log("DEBUG createCourse - Cours sauvegardé avec ID: " . $course->id);
            error_log("DEBUG createCourse - Cours sauvegardé: " . json_encode($course->toArray()));
            
            // Créer les leçons si elles existent
            if (isset($data['lessons']) && is_array($data['lessons'])) {
                $this->createLessons($course->id, $data['lessons']);
            }
            
            // Créer les quiz si ils existent
            if (isset($data['quizzes']) && is_array($data['quizzes'])) {
                $this->createQuizzes($course->id, $data['quizzes']);
            }
            
            // Récupérer le cours complet avec ses relations
            $completeCourse = Course::find($course->id);
            
            Response::success($completeCourse->toArray(), 'Cours créé avec succès');
            
        } catch (\Exception $e) {
            Response::error('Erreur lors de la création du cours: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Met à jour un cours (version admin)
     */
    public function updateCourse($id) {
        // Vérifier l'authentification admin
        JWT::requireRole(['admin']);
        
        try {
            $course = Course::find($id);
            
            if (!$course) {
                Response::notFound('Cours non trouvé');
                return;
            }
            
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Vérifier que subcategoryId existe si fourni
            if (isset($data['subcategoryId']) && !empty($data['subcategoryId'])) {
                $db = \DatabaseConfig::getInstance()->getConnection();
                $stmt = $db->prepare("SELECT id FROM subcategories WHERE id = ?");
                $stmt->execute([$data['subcategoryId']]);
                if (!$stmt->fetch()) {
                    $data['subcategoryId'] = null; // Si la sous-catégorie n'existe pas, on la met à null
                }
            }
            
            // Mettre à jour les champs
            $fillableFields = [
                'title', 'description', 'classeId', 'categoryId', 'subcategoryId', 
                'instructorId', 'price', 'discountPrice', 'tags', 'order', 
                'isActive', 'videoUrl', 'pdfUrl', 'imageUrl', 'duration', 'difficulty', 'status'
            ];
            
            foreach ($fillableFields as $field) {
                if (isset($data[$field])) {
                    $course->$field = $data[$field];
                }
            }
            
            $course->save();
            
            // Mettre à jour les leçons si elles existent
            if (isset($data['lessons']) && is_array($data['lessons'])) {
                // Supprimer les anciennes leçons
                $existingLessons = Lesson::where(['courseId' => $id]);
                foreach ($existingLessons as $lesson) {
                    $lesson->delete();
                }
                
                // Créer les nouvelles leçons
                $this->createLessons($id, $data['lessons']);
            }
            
            // Récupérer le cours complet avec ses relations
            $completeCourse = Course::find($course->id);
            
            Response::success($completeCourse->toArray(), 'Cours mis à jour avec succès');
            
        } catch (\Exception $e) {
            Response::error('Erreur lors de la mise à jour du cours: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Supprime un cours (version admin)
     */
    public function deleteCourse($id) {
        // Vérifier l'authentification admin
        JWT::requireRole(['admin']);
        
        try {
            $course = Course::find($id);
            
            if (!$course) {
                Response::notFound('Cours non trouvé');
                return;
            }
            
            // Supprimer les leçons associées
            $lessons = Lesson::where(['courseId' => $id]);
            foreach ($lessons as $lesson) {
                $lesson->delete();
            }
            
            // Supprimer les exercices associés
            $exercises = Exercise::where(['courseId' => $id]);
            foreach ($exercises as $exercise) {
                $exercise->delete();
            }
            
            // Supprimer les quiz associés
            $quizzes = Quiz::where(['courseId' => $id]);
            foreach ($quizzes as $quiz) {
                $quiz->delete();
            }
            
            // Supprimer le cours
            $course->delete();
            
            Response::success(['deleted' => true], 'Cours supprimé avec succès');
            
        } catch (\Exception $e) {
            Response::error('Erreur lors de la suppression du cours: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Crée les leçons pour un cours
     */
    private function createLessons($courseId, $lessonsData) {
        foreach ($lessonsData as $lessonData) {
            // Vérifier que subcategoryId existe si fourni
            $lessonSubcategoryId = null;
            if (isset($lessonData['subcategoryId']) && !empty($lessonData['subcategoryId'])) {
                $db = \DatabaseConfig::getInstance()->getConnection();
                $stmt = $db->prepare("SELECT id FROM subcategories WHERE id = ?");
                $stmt->execute([$lessonData['subcategoryId']]);
                if ($stmt->fetch()) {
                    $lessonSubcategoryId = $lessonData['subcategoryId'];
                }
                // Si la sous-catégorie n'existe pas, on laisse subcategoryId à null
            }
            
            $lesson = new Lesson([
                'title' => $lessonData['title'],
                'description' => $lessonData['description'] ?? '',
                'content' => $lessonData['content'] ?? '',
                'videoUrl' => $lessonData['videoUrl'] ?? null,
                'fileUrl' => $lessonData['fileUrl'] ?? null,
                'duration' => $lessonData['duration'] ?? null,
                'order' => $lessonData['order'] ?? 0,
                'courseId' => $courseId,
                'subcategoryId' => $lessonSubcategoryId,
                'isActive' => $lessonData['isActive'] ?? true
            ]);
            $lesson->save();
        }
    }
    
    /**
     * Crée les quiz pour un cours
     */
    private function createQuizzes($courseId, $quizzesData) {
        $db = \DatabaseConfig::getInstance()->getConnection();
        
        foreach ($quizzesData as $quizData) {
            $quiz = new Quiz([
                'title' => $quizData['title'],
                'description' => $quizData['description'] ?? '',
                'timeLimit' => $quizData['timeLimit'] ?? null,
                'passingScore' => $quizData['passingScore'] ?? 70,
                'courseId' => $courseId,
                'isActive' => $quizData['isActive'] ?? true
            ]);
            $quiz->save();
            
            // Créer les questions du quiz
            if (isset($quizData['questions']) && is_array($quizData['questions'])) {
                $this->createQuizQuestions($quiz->id, $quizData['questions']);
            }
        }
    }
    
    /**
     * Crée les questions d'un quiz
     */
    private function createQuizQuestions($quizId, $questionsData) {
        $db = \DatabaseConfig::getInstance()->getConnection();
        
        foreach ($questionsData as $index => $questionData) {
            // Insérer la question
            $questionSql = "INSERT INTO quiz_questions (quizId, text, order_index) VALUES (?, ?, ?)";
            $questionStmt = $db->prepare($questionSql);
            $questionStmt->execute([$quizId, $questionData['text'], $index + 1]);
            $questionId = $db->lastInsertId();
            
            // Créer les options de la question
            if (isset($questionData['options']) && is_array($questionData['options'])) {
                foreach ($questionData['options'] as $optionIndex => $optionData) {
                    $optionSql = "INSERT INTO quiz_question_options (questionId, text, isCorrect, order_index) VALUES (?, ?, ?, ?)";
                    $optionStmt = $db->prepare($optionSql);
                    $optionStmt->execute([
                        $questionId, 
                        $optionData['text'], 
                        $optionData['isCorrect'] ? 1 : 0, 
                        $optionIndex + 1
                    ]);
                }
            }
        }
    }
}
