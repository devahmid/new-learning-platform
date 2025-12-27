<?php

namespace App\Models;

/**
 * Modèle Evaluation
 */
class Evaluation extends BaseModel {
    protected static $table = 'evaluations';
    
    protected static $fillable = [
        'title',
        'description',
        'instructions',
        'specialInstructions',
        'courseId',
        'lessonId',
        'isActive',
        'allowMultipleSubmissions',
        'showResults',
        'startDate',
        'endDate'
    ];
    
    /**
     * Récupère les sections de cette évaluation
     */
    public function sections() {
        $db = \DatabaseConfig::getInstance()->getConnection();
        
        $sql = "SELECT * FROM evaluation_sections WHERE evaluationId = ? ORDER BY `order` ASC";
        $stmt = $db->prepare($sql);
        $stmt->execute([$this->id]);
        return $stmt->fetchAll();
    }
    
    /**
     * Récupère les questions de cette évaluation
     */
    public function questions() {
        $db = \DatabaseConfig::getInstance()->getConnection();
        
        $sql = "SELECT * FROM evaluation_questions WHERE evaluationId = ? ORDER BY sectionId ASC, `order` ASC";
        $stmt = $db->prepare($sql);
        $stmt->execute([$this->id]);
        $questions = $stmt->fetchAll();
        
        // Pour chaque question, récupérer les options si nécessaire
        foreach ($questions as &$question) {
            $question['options'] = [];
            
            if (in_array($question['type'], ['multiple_choice', 'radio', 'checkbox'])) {
                $optionsSql = "SELECT * FROM evaluation_question_options WHERE questionId = ? ORDER BY `order` ASC";
                $optionsStmt = $db->prepare($optionsSql);
                $optionsStmt->execute([$question['id']]);
                $question['options'] = $optionsStmt->fetchAll();
            }
        }
        
        return $questions;
    }
    
    /**
     * Récupère les classes associées à cette évaluation (relation many-to-many)
     */
    public function classes() {
        $db = \DatabaseConfig::getInstance()->getConnection();
        $stmt = $db->prepare("
            SELECT cl.* 
            FROM classes cl
            INNER JOIN evaluation_classes ec ON cl.id = ec.classeId
            WHERE ec.evaluationId = ?
            ORDER BY cl.name
        ");
        $stmt->execute([$this->id]);
        return $stmt->fetchAll();
    }
    
    /**
     * Met à jour les classes associées à l'évaluation
     */
    public function syncClasses($classeIds) {
        if (!$this->id) {
            return false;
        }
        
        $db = \DatabaseConfig::getInstance()->getConnection();
        
        // Supprimer toutes les associations existantes
        $stmt = $db->prepare("DELETE FROM evaluation_classes WHERE evaluationId = ?");
        $stmt->execute([$this->id]);
        
        // Ajouter les nouvelles associations
        if (!empty($classeIds) && is_array($classeIds)) {
            $placeholders = str_repeat('(?,?),', count($classeIds) - 1) . '(?,?)';
            $stmt = $db->prepare("INSERT INTO evaluation_classes (evaluationId, classeId) VALUES $placeholders");
            
            $values = [];
            foreach ($classeIds as $classeId) {
                $values[] = $this->id;
                $values[] = $classeId;
            }
            
            return $stmt->execute($values);
        }
        
        return true;
    }
    
    /**
     * Convertit en tableau pour l'API avec les relations
     */
    public function toArray() {
        $array = parent::toArray();
        $array['sections'] = $this->sections();
        $array['questions'] = $this->questions();
        $array['classes'] = $this->classes();
        return $array;
    }
}

