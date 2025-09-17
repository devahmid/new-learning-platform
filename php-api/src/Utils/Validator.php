<?php

namespace App\Utils;

/**
 * Classe de validation simple
 */
class Validator {
    private $data;
    private $rules;
    private $errors = [];
    
    public function __construct($data, $rules) {
        $this->data = $data;
        $this->rules = $rules;
    }
    
    /**
     * Valide les données
     */
    public function validate() {
        foreach ($this->rules as $field => $ruleString) {
            $rules = explode('|', $ruleString);
            $value = $this->data[$field] ?? null;
            
            foreach ($rules as $rule) {
                $this->applyRule($field, $value, $rule);
            }
        }
        
        return empty($this->errors);
    }
    
    /**
     * Applique une règle de validation
     */
    private function applyRule($field, $value, $rule) {
        $parts = explode(':', $rule);
        $ruleName = $parts[0];
        $parameter = $parts[1] ?? null;
        
        switch ($ruleName) {
            case 'required':
                if (empty($value) && $value !== '0') {
                    $this->addError($field, "Le champ $field est requis");
                }
                break;
                
            case 'email':
                if (!empty($value) && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
                    $this->addError($field, "Le champ $field doit être un email valide");
                }
                break;
                
            case 'min':
                if (!empty($value) && strlen($value) < (int)$parameter) {
                    $this->addError($field, "Le champ $field doit contenir au moins $parameter caractères");
                }
                break;
                
            case 'max':
                if (!empty($value) && strlen($value) > (int)$parameter) {
                    $this->addError($field, "Le champ $field ne peut pas contenir plus de $parameter caractères");
                }
                break;
                
            case 'numeric':
                if (!empty($value) && !is_numeric($value)) {
                    $this->addError($field, "Le champ $field doit être numérique");
                }
                break;
                
            case 'in':
                if (!empty($value)) {
                    $allowedValues = explode(',', $parameter);
                    if (!in_array($value, $allowedValues)) {
                        $this->addError($field, "Le champ $field doit être l'une des valeurs suivantes: " . implode(', ', $allowedValues));
                    }
                }
                break;
                
            case 'array':
                if (!empty($value) && !is_array($value)) {
                    $this->addError($field, "Le champ $field doit être un tableau");
                }
                break;
        }
    }
    
    /**
     * Ajoute une erreur
     */
    private function addError($field, $message) {
        if (!isset($this->errors[$field])) {
            $this->errors[$field] = [];
        }
        $this->errors[$field][] = $message;
    }
    
    /**
     * Récupère les erreurs
     */
    public function getErrors() {
        return $this->errors;
    }
}
