<?php

namespace App\Controllers;

use App\Models\Lesson;
use App\Utils\Response;

/**
 * Contrôleur pour la gestion des leçons
 */
class LessonController {
    
    /**
     * Récupère toutes les leçons
     */
    public function findAll() {
        $lessons = Lesson::all();
        $lessonsArray = array_map(function($lesson) {
            return $lesson->toArray();
        }, $lessons);
        Response::json($lessonsArray, 200);
    }
    
    /**
     * Récupère une leçon par son ID
     */
    public function findById($id) {
        $lesson = Lesson::find($id);
        
        if (!$lesson) {
            Response::json(['error' => 'Leçon non trouvée'], 404);
            return;
        }
        
        Response::json($lesson->toArray(), 200);
    }
    
    /**
     * Récupère les leçons d'un cours
     */
    public function findByCourse($courseId) {
        $lessons = Lesson::where(['courseId' => $courseId]);
        $lessonsArray = array_map(function($lesson) {
            return $lesson->toArray();
        }, $lessons);
        Response::json($lessonsArray, 200);
    }
    
    /**
     * Crée une nouvelle leçon
     */
    public function create() {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!$data) {
            Response::json(['error' => 'Données JSON invalides'], 400);
            return;
        }
        
        $lesson = new Lesson($data);
        
        if ($lesson->save()) {
            Response::json($lesson->toArray(), 201);
        } else {
            Response::json(['error' => 'Erreur lors de la création de la leçon'], 500);
        }
    }
    
    /**
     * Met à jour une leçon
     */
    public function update($id) {
        $lesson = Lesson::find($id);
        
        if (!$lesson) {
            Response::json(['error' => 'Leçon non trouvée'], 404);
            return;
        }
        
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!$data) {
            Response::json(['error' => 'Données JSON invalides'], 400);
            return;
        }
        
        foreach ($data as $key => $value) {
            if (in_array($key, $lesson->getFillable())) {
                $lesson->$key = $value;
            }
        }
        
        if ($lesson->save()) {
            Response::json($lesson->toArray(), 200);
        } else {
            Response::json(['error' => 'Erreur lors de la mise à jour de la leçon'], 500);
        }
    }
    
    /**
     * Supprime une leçon
     */
    public function delete($id) {
        $lesson = Lesson::find($id);
        
        if (!$lesson) {
            Response::json(['error' => 'Leçon non trouvée'], 404);
            return;
        }
        
        if ($lesson->delete()) {
            Response::json(['message' => 'Leçon supprimée avec succès'], 200);
        } else {
            Response::json(['error' => 'Erreur lors de la suppression de la leçon'], 500);
        }
    }
    
    /**
     * Upload d'une carte mentale pour une leçon
     */
    public function uploadMindMap($id) {
        $lesson = Lesson::find($id);
        
        if (!$lesson) {
            Response::json(['error' => 'Leçon non trouvée'], 404);
            return;
        }
        
        // Vérifier si un fichier a été uploadé
        if (!isset($_FILES['mindmap']) || empty($_FILES['mindmap']['name'])) {
            Response::json(['error' => 'Aucune carte mentale fournie'], 400);
            return;
        }
        
        $file = $_FILES['mindmap'];
        
        // Validation du fichier (images uniquement)
        $validation = $this->validateImageFile($file);
        if (!$validation['valid']) {
            Response::json(['error' => $validation['message']], 400);
            return;
        }
        
        // Générer un nom de fichier unique
        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = 'mindmap-lesson-' . $id . '-' . time() . '-' . uniqid() . '.' . $extension;
        $uploadDir = '../uploads/';
        $filepath = $uploadDir . $filename;
        
        // Créer le dossier uploads s'il n'existe pas
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }
        
        // Déplacer le fichier
        if (move_uploaded_file($file['tmp_name'], $filepath)) {
            // Générer l'URL publique
            $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
            $host = $_SERVER['HTTP_HOST'];
            $baseUrl = $protocol . '://' . $host;
            $publicUrl = $baseUrl . '/api/upload/' . $filename;
            
            // Mettre à jour la leçon avec l'URL de la carte mentale
            $lesson->mindMapUrl = $publicUrl;
            
            if ($lesson->save()) {
                Response::json([
                    'message' => 'Carte mentale uploadée avec succès',
                    'lesson' => $lesson->toArray(),
                    'mindMapUrl' => $publicUrl
                ], 200);
            } else {
                Response::json(['error' => 'Erreur lors de la sauvegarde de la carte mentale'], 500);
            }
        } else {
            Response::json(['error' => 'Erreur lors de l\'upload de la carte mentale'], 500);
        }
    }
    
    /**
     * Valider un fichier image (pour les cartes mentales)
     */
    private function validateImageFile($file) {
        // Vérifier les erreurs d'upload
        if ($file['error'] !== UPLOAD_ERR_OK) {
            return [
                'valid' => false,
                'message' => 'Erreur lors de l\'upload du fichier'
            ];
        }
        
        // Vérifier la taille (limite pour les images)
        $maxImageSize = 10 * 1024 * 1024; // 10MB pour les images
        if ($file['size'] > $maxImageSize) {
            return [
                'valid' => false,
                'message' => 'Image trop volumineuse. Maximum: ' . ($maxImageSize / 1024 / 1024) . 'MB'
            ];
        }
        
        // Vérifier le type MIME (images uniquement)
        $allowedImageTypes = [
            'image/jpeg',
            'image/png', 
            'image/gif',
            'image/webp'
        ];
        
        if (!in_array($file['type'], $allowedImageTypes)) {
            return [
                'valid' => false,
                'message' => 'Type d\'image non autorisé. Formats acceptés: JPEG, PNG, GIF, WebP'
            ];
        }
        
        return ['valid' => true];
    }
}
