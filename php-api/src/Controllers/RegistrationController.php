<?php

namespace App\Controllers;

use App\Models\Registration;
use App\Utils\Response;
use App\Utils\Validator;
use App\Utils\EmailService;

/**
 * Contrôleur des inscriptions et réinscriptions
 */
class RegistrationController {

    /**
     * Récupère toutes les inscriptions
     */
    public function findAll() {
        try {
            $registrations = Registration::all();
            $payload = array_map(function ($registration) {
                return $registration->toArray();
            }, $registrations);

            Response::json($payload, 200);
        } catch (\Exception $e) {
            Response::error('Erreur lors de la récupération des inscriptions: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Récupère une inscription par ID
     */
    public function findById($id) {
        try {
            $registration = Registration::find($id);

            if (!$registration) {
                Response::notFound('Inscription introuvable');
                return;
            }

            Response::json($registration->toArray(), 200);
        } catch (\Exception $e) {
            Response::error('Erreur lors de la récupération de l\'inscription: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Crée une inscription ou réinscription
     */
    public function create() {
        try {
            $data = json_decode(file_get_contents('php://input'), true);

            if (!$data || !is_array($data)) {
                Response::badRequest('Données JSON invalides');
                return;
            }

            $validator = new Validator($data, [
                'fullName' => 'required|min:2',
                'email' => 'required|email',
                'phone' => 'required|min:8',
                'children' => 'required|array'
            ]);

            if (!$validator->validate()) {
                Response::validationError($validator->getErrors());
                return;
            }

            $childrenErrors = $this->validateChildren($data['children']);
            if (!empty($childrenErrors)) {
                Response::validationError($childrenErrors);
                return;
            }

            $registration = new Registration([
                'fullName' => trim($data['fullName']),
                'email' => trim($data['email']),
                'phone' => trim($data['phone']),
                'acceptedConditions' => !empty($data['acceptedConditions']) ? 1 : 0,
                'wasRegisteredLastYear' => !empty($data['wasRegisteredLastYear']) ? 1 : 0,
                'sourceUserId' => isset($data['sourceUserId']) ? (int) $data['sourceUserId'] : null,
                'parentSnapshotJson' => isset($data['parentSnapshot']) ? json_encode($data['parentSnapshot'], JSON_UNESCAPED_UNICODE) : null,
                'childrenSnapshotJson' => isset($data['childrenSnapshot']) ? json_encode($data['childrenSnapshot'], JSON_UNESCAPED_UNICODE) : null,
                'childrenJson' => json_encode($this->normalizeChildren($data['children']), JSON_UNESCAPED_UNICODE),
                'notes' => isset($data['notes']) ? trim((string) $data['notes']) : null,
                'status' => 'pending'
            ]);

            $registration->save();

            $this->sendConfirmationEmail($registration->toArray());

            Response::created($registration->toArray(), 'Inscription enregistrée avec succès');
        } catch (\Exception $e) {
            Response::error('Erreur lors de l\'enregistrement de l\'inscription: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Valide la structure des enfants
     */
    private function validateChildren($children) {
        $errors = [];

        if (!is_array($children) || empty($children)) {
            return ['children' => ['Au moins un enfant est requis']];
        }

        foreach ($children as $index => $child) {
            $childValidator = new Validator($child, [
                'firstName' => 'required|min:2',
                'lastName' => 'required|min:2',
                'birthDate' => 'required',
                'arabicLevel' => 'required|in:1,2,3,4,5',
                'activityDetails' => 'max:500'
            ]);

            if (!$childValidator->validate()) {
                $errors['children_' . $index] = $childValidator->getErrors();
                continue;
            }

            $hasActivity = !empty($child['hasActivityOnWednesday']) || !empty($child['hasActivityOnSaturday']) || !empty($child['hasActivityOnSunday']);
            $activityDetails = trim((string) ($child['activityDetails'] ?? ''));

            if ($hasActivity && $activityDetails === '') {
                $errors['children_' . $index]['activityDetails'] = ['Le détail des activités est requis lorsque des créneaux sont cochés'];
            }
        }

        return $errors;
    }

    /**
     * Normalise les enfants avant sauvegarde
     */
    private function normalizeChildren($children) {
        return array_map(function ($child) {
            return [
                'firstName' => trim((string) ($child['firstName'] ?? '')),
                'lastName' => trim((string) ($child['lastName'] ?? '')),
                'birthDate' => trim((string) ($child['birthDate'] ?? '')),
                'arabicLevel' => (int) ($child['arabicLevel'] ?? 1),
                'hasActivityOnWednesday' => !empty($child['hasActivityOnWednesday']),
                'hasActivityOnSaturday' => !empty($child['hasActivityOnSaturday']),
                'hasActivityOnSunday' => !empty($child['hasActivityOnSunday']),
                'activityDetails' => trim((string) ($child['activityDetails'] ?? '')),
            ];
        }, $children);
    }

    /**
     * Envoie un email de confirmation simple
     */
    private function sendConfirmationEmail(array $registration) {
        try {
            $emailService = new EmailService();
            $childrenSummary = '';

            foreach ($registration['children'] as $child) {
                $childrenSummary .= '<li>' . htmlspecialchars($child['firstName']) . ' ' . htmlspecialchars($child['lastName']) . ' - niveau ' . (int) $child['arabicLevel'] . '</li>';
            }

            $content = '
                <h2>Confirmation de votre inscription</h2>
                <p>Bonjour ' . htmlspecialchars($registration['fullName']) . ',</p>
                <p>Nous avons bien reçu votre demande de ' . (!empty($registration['wasRegisteredLastYear']) ? 'réinscription' : 'nouvelle inscription') . '.</p>
                <p><strong>Enfants concernés :</strong></p>
                <ul>' . $childrenSummary . '</ul>
                <p>Notre équipe vérifiera votre dossier et reviendra vers vous si nécessaire.</p>
            ';

            $emailService->sendEmail($registration['email'], 'Confirmation de votre inscription', $content, true);
        } catch (\Exception $e) {
            error_log('Registration confirmation email error: ' . $e->getMessage());
        }
    }
}