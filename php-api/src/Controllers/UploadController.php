<?php

namespace App\Controllers;

use App\Utils\Response;
use App\Utils\JWT;

/**
 * Contrôleur d'upload de fichiers - Compatible avec l'API NestJS
 */
class UploadController {
    
    private $uploadDir = '../uploads/';
    private $maxFileSize = 50 * 1024 * 1024; // 50MB
    private $allowedTypes = [
        'image/jpeg',
        'image/png', 
        'image/gif',
        'application/pdf',
        'video/mp4',
        'video/webm',
        'video/avi',
        'audio/mp3',
        'audio/wav',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
    ];
    
    public function __construct() {
        // Créer le dossier uploads s'il n'existe pas
        if (!is_dir($this->uploadDir)) {
            mkdir($this->uploadDir, 0755, true);
        }
    }
    
    /**
     * Upload multiple de fichiers (compatible NestJS)
     */
    public function uploadMultiple() {
        try {
            // Vérifier la méthode HTTP
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                Response::methodNotAllowed('Seule la méthode POST est autorisée');
                return;
            }
            
            // Vérifier si des fichiers ont été uploadés
            if (!isset($_FILES['files']) || empty($_FILES['files']['name'])) {
                Response::badRequest('Aucun fichier fourni');
                return;
            }
            
            $file = $_FILES['files'];
            
            // Validation du fichier
            $validation = $this->validateFile($file);
            if (!$validation['valid']) {
                Response::badRequest($validation['message']);
                return;
            }
            
            // Générer un nom de fichier unique
            $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
            $filename = 'files-' . time() . '-' . uniqid() . '.' . $extension;
            $filepath = $this->uploadDir . $filename;
            
            // Déplacer le fichier
            if (move_uploaded_file($file['tmp_name'], $filepath)) {
                // Générer l'URL publique
                $baseUrl = $this->getBaseUrl();
                $publicUrl = $baseUrl . '/api/upload/' . $filename;
                
                // Format compatible NestJS
                Response::json([
                    'url' => $publicUrl,
                    'originalName' => $file['name'],
                    'type' => $file['type'],
                    'size' => $file['size'],
                    'filename' => $filename
                ], 200);
            } else {
                Response::error('Erreur lors de l\'upload du fichier', 500);
            }
            
        } catch (\Exception $e) {
            Response::error('Erreur serveur: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Upload spécifique pour les cartes mentales
     */
    public function uploadMindMap() {
        try {
            // Vérifier la méthode HTTP
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                Response::methodNotAllowed('Seule la méthode POST est autorisée');
                return;
            }
            
            // Vérifier si un fichier a été uploadé
            if (!isset($_FILES['mindmap']) || empty($_FILES['mindmap']['name'])) {
                Response::badRequest('Aucune carte mentale fournie');
                return;
            }
            
            $file = $_FILES['mindmap'];
            
            // Validation du fichier (images uniquement pour les cartes mentales)
            $validation = $this->validateImageFile($file);
            if (!$validation['valid']) {
                Response::badRequest($validation['message']);
                return;
            }
            
            // Générer un nom de fichier unique pour les cartes mentales
            $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
            $filename = 'mindmap-' . time() . '-' . uniqid() . '.' . $extension;
            $filepath = $this->uploadDir . $filename;
            
            // Déplacer le fichier
            if (move_uploaded_file($file['tmp_name'], $filepath)) {
                // Générer l'URL publique
                $baseUrl = $this->getBaseUrl();
                $publicUrl = $baseUrl . '/api/upload/' . $filename;
                
                // Format compatible avec l'API
                Response::json([
                    'url' => $publicUrl,
                    'originalName' => $file['name'],
                    'type' => $file['type'],
                    'size' => $file['size'],
                    'filename' => $filename
                ], 200);
            } else {
                Response::error('Erreur lors de l\'upload de la carte mentale', 500);
            }
            
        } catch (\Exception $e) {
            Response::error('Erreur serveur: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Récupérer un fichier uploadé
     */
    public function getFile($filename) {
        $filepath = $this->uploadDir . $filename;
        
        if (!file_exists($filepath)) {
            Response::notFound('Fichier non trouvé');
            return;
        }
        
        // Déterminer le type MIME
        $mimeType = $this->getMimeType($filename);
        
        // Headers pour le téléchargement
        header('Content-Type: ' . $mimeType);
        header('Content-Disposition: inline');
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Expose-Headers: Content-Disposition');
        
        // Lire et envoyer le fichier
        readfile($filepath);
        exit;
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
        
        // Vérifier la taille (limite plus stricte pour les images)
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
    
    /**
     * Valider un fichier
     */
    private function validateFile($file) {
        // Vérifier les erreurs d'upload
        if ($file['error'] !== UPLOAD_ERR_OK) {
            return [
                'valid' => false,
                'message' => 'Erreur lors de l\'upload du fichier'
            ];
        }
        
        // Vérifier la taille
        if ($file['size'] > $this->maxFileSize) {
            return [
                'valid' => false,
                'message' => 'Fichier trop volumineux. Maximum: ' . ($this->maxFileSize / 1024 / 1024) . 'MB'
            ];
        }
        
        // Vérifier le type MIME
        if (!in_array($file['type'], $this->allowedTypes)) {
            return [
                'valid' => false,
                'message' => 'Type de fichier non autorisé: ' . $file['type']
            ];
        }
        
        return ['valid' => true];
    }
    
    /**
     * Obtenir le type MIME d'un fichier
     */
    private function getMimeType($filename) {
        $extension = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
        
        switch ($extension) {
            case 'pdf':
                return 'application/pdf';
            case 'jpg':
            case 'jpeg':
                return 'image/jpeg';
            case 'png':
                return 'image/png';
            case 'gif':
                return 'image/gif';
            case 'mp4':
                return 'video/mp4';
            case 'webm':
                return 'video/webm';
            case 'avi':
                return 'video/avi';
            case 'mp3':
                return 'audio/mp3';
            case 'wav':
                return 'audio/wav';
            case 'doc':
                return 'application/msword';
            case 'docx':
                return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            case 'txt':
                return 'text/plain';
            default:
                return 'application/octet-stream';
        }
    }
    
    /**
     * Obtenir l'URL de base de l'API
     */
    private function getBaseUrl() {
        $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
        $host = $_SERVER['HTTP_HOST'];
        
        // Retourner directement l'URL de base sans le chemin du script
        // pour éviter la duplication /api/api/
        return $protocol . '://' . $host;
    }
}
