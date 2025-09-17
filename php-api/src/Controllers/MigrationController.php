<?php

namespace App\Controllers;

use App\Utils\Response;
use App\Utils\JWT;

/**
 * Contrôleur pour les migrations de base de données
 */
class MigrationController {
    
    /**
     * Exécute la migration pour ajouter courseId à la table exercises
     */
    public function addCourseIdToExercises() {
        // Vérifier l'authentification admin
        JWT::requireRole(['admin']);
        
        try {
            $db = \DatabaseConfig::getInstance()->getConnection();
            
            // Vérifier si la colonne existe déjà
            $stmt = $db->query("SHOW COLUMNS FROM exercises LIKE 'courseId'");
            if ($stmt->rowCount() > 0) {
                Response::success([], 'La colonne courseId existe déjà dans la table exercises');
                return;
            }
            
            // Exécuter la migration
            $migrationSQL = "
                ALTER TABLE exercises ADD COLUMN courseId INT(11) NULL AFTER id;
                ALTER TABLE exercises ADD CONSTRAINT fk_exercises_course 
                FOREIGN KEY (courseId) REFERENCES courses(id) 
                ON DELETE SET NULL ON UPDATE CASCADE;
                CREATE INDEX idx_exercises_course_id ON exercises(courseId);
            ";
            
            $db->exec($migrationSQL);
            
            // Mettre à jour les exercices existants
            $updateSQL = "UPDATE exercises SET courseId = (SELECT id FROM courses LIMIT 1) WHERE courseId IS NULL";
            $db->exec($updateSQL);
            
            Response::success([], 'Migration exécutée avec succès: courseId ajouté à la table exercises');
            
        } catch (\Exception $e) {
            Response::error('Erreur lors de l\'exécution de la migration: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Vérifie la structure de la table exercises
     */
    public function checkExercisesStructure() {
        // Vérifier l'authentification admin
        JWT::requireRole(['admin']);
        
        try {
            $db = \DatabaseConfig::getInstance()->getConnection();
            
            // Récupérer la structure de la table exercises
            $stmt = $db->query("DESCRIBE exercises");
            $columns = $stmt->fetchAll(\PDO::FETCH_ASSOC);
            
            Response::success($columns, 'Structure de la table exercises récupérée');
            
        } catch (\Exception $e) {
            Response::error('Erreur lors de la récupération de la structure: ' . $e->getMessage(), 500);
        }
    }
}
