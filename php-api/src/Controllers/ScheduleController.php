<?php

namespace App\Controllers;

use App\Models\Schedule;
use App\Models\Classe;
use App\Models\User;
use App\Utils\Response;
use App\Utils\JWT;
use App\Utils\Validator;

/**
 * Contrôleur pour la gestion des créneaux horaires
 */
class ScheduleController {
    
    /**
     * Récupère tous les créneaux
     */
    public function getAll() {
        try {
            $schedules = Schedule::all();
            
            // Convertir les schedules en tableaux
            $schedulesArray = [];
            foreach ($schedules as $schedule) {
                $schedulesArray[] = $schedule->toArray();
            }
            
            Response::json($schedulesArray, 200);
        } catch (\Exception $e) {
            Response::error('Erreur lors de la récupération des créneaux: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Récupère un créneau par ID
     */
    public function getById($id) {
        try {
            $schedule = Schedule::find($id);
            
            if (!$schedule) {
                Response::notFound('Créneau non trouvé');
                return;
            }
            
            Response::json($schedule->toArray(), 200);
        } catch (\Exception $e) {
            Response::error('Erreur lors de la récupération du créneau: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Crée un nouveau créneau
     */
    public function create() {
        // Vérifier l'authentification admin
        JWT::requireRole(['admin']);
        
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Validation
            $validator = new Validator($data, [
                'day' => 'required|string',
                'startHour' => 'required|string',
                'endHour' => 'required|string',
                'classeId' => 'required|integer'
            ]);
            
            if (!$validator->validate()) {
                Response::validationError($validator->getErrors());
                return;
            }
            
            // Vérifier que la classe existe
            $classe = Classe::find($data['classeId']);
            if (!$classe) {
                Response::badRequest('Classe non trouvée');
                return;
            }
            
            // Créer le créneau
            $schedule = new Schedule();
            $schedule->day = $data['day'];
            $schedule->startHour = $data['startHour'];
            $schedule->endHour = $data['endHour'];
            $schedule->classeId = $data['classeId'];
            $schedule->teacherId = $data['teacherId'] ?? null;
            $schedule->description = $data['description'] ?? null;
            
            $schedule->save();
            
            Response::json($schedule->toArray(), 201);
            
        } catch (\Exception $e) {
            Response::error('Erreur lors de la création du créneau: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Met à jour un créneau
     */
    public function update($id) {
        // Vérifier l'authentification admin
        JWT::requireRole(['admin']);
        
        try {
            $schedule = Schedule::find($id);
            
            if (!$schedule) {
                Response::notFound('Créneau non trouvé');
                return;
            }
            
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Validation pour PATCH (champs optionnels)
            $validator = new Validator($data, [
                'day' => 'string',
                'startHour' => 'string',
                'endHour' => 'string',
                'classeId' => 'integer',
                'teacherId' => 'integer'
            ]);
            
            if (!$validator->validate()) {
                Response::validationError($validator->getErrors());
                return;
            }
            
            // Vérifier que la classe existe si elle est fournie
            if (isset($data['classeId'])) {
                $classe = Classe::find($data['classeId']);
                if (!$classe) {
                    Response::badRequest('Classe non trouvée');
                    return;
                }
            }
            
            // Mettre à jour les champs fournis
            $fillableFields = ['day', 'startHour', 'endHour', 'classeId', 'teacherId', 'description'];
            
            foreach ($fillableFields as $field) {
                if (isset($data[$field])) {
                    $schedule->$field = $data[$field];
                }
            }
            
            $schedule->save();
            
            Response::json($schedule->toArray(), 200);
            
        } catch (\Exception $e) {
            Response::error('Erreur lors de la mise à jour du créneau: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Supprime un créneau
     */
    public function delete($id) {
        // Vérifier l'authentification admin
        JWT::requireRole(['admin']);
        
        try {
            $schedule = Schedule::find($id);
            
            if (!$schedule) {
                Response::notFound('Créneau non trouvé');
                return;
            }
            
            $schedule->delete();
            
            Response::json(['message' => 'Créneau supprimé avec succès'], 200);
            
        } catch (\Exception $e) {
            Response::error('Erreur lors de la suppression du créneau: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Récupère les créneaux d'une classe
     */
    public function getByClasse($classeId) {
        try {
            $schedules = Schedule::where(['classeId' => $classeId]);
            
            // Convertir les schedules en tableaux
            $schedulesArray = [];
            foreach ($schedules as $schedule) {
                $schedulesArray[] = $schedule->toArray();
            }
            
            Response::json($schedulesArray, 200);
        } catch (\Exception $e) {
            Response::error('Erreur lors de la récupération des créneaux de la classe: ' . $e->getMessage(), 500);
        }
    }
}
