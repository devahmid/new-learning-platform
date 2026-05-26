<?php

namespace App\Controllers;

use App\Models\Reinscription;
use App\Utils\EmailService;
use App\Utils\Response;
use App\Utils\Validator;

/**
 * Contrôleur des réinscriptions
 */
class ReinscriptionController {
    private const ALLOWED_STATUSES = ['pending', 'in_review', 'approved', 'rejected', 'archived'];
    private const ALLOWED_REQUEST_TYPES = ['new', 'renewal'];

    /**
     * Liste les dossiers de réinscription
     */
    public function findAll() {
        try {
            $filters = [
                'status' => $_GET['status'] ?? null,
                'requestType' => $_GET['requestType'] ?? null,
                'schoolYear' => $_GET['schoolYear'] ?? null,
                'sourceUserId' => isset($_GET['sourceUserId']) ? (int) $_GET['sourceUserId'] : null,
            ];

            $filters = array_filter($filters, static function ($value) {
                return $value !== null && $value !== '';
            });

            $reinscriptions = Reinscription::allWithChildren($filters);
            Response::json($reinscriptions, 200);
        } catch (\Exception $e) {
            Response::error('Erreur lors de la récupération des réinscriptions: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Récupère un dossier de réinscription par ID
     */
    public function findById($id) {
        try {
            $reinscription = Reinscription::findWithChildren((int) $id);

            if (!$reinscription) {
                Response::notFound('Réinscription introuvable');
                return;
            }

            Response::json($reinscription, 200);
        } catch (\Exception $e) {
            Response::error('Erreur lors de la récupération de la réinscription: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Crée une demande de réinscription
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

            $requestType = $this->resolveRequestType($data);
            $isGuest = $this->resolveIsGuest($data);
            $schoolYear = trim((string) ($data['schoolYear'] ?? $this->defaultSchoolYear()));
            $children = $this->normalizeChildren($data['children']);

            $reinscription = Reinscription::createWithChildren(
                [
                    'sourceUserId' => isset($data['sourceUserId']) ? (int) $data['sourceUserId'] : null,
                    'isGuest' => $isGuest,
                    'schoolYear' => $schoolYear,
                    'requestType' => $requestType,
                    'fullName' => trim($data['fullName']),
                    'email' => trim($data['email']),
                    'phone' => trim($data['phone']),
                    'acceptedConditions' => !empty($data['acceptedConditions']) ? 1 : 0,
                    'notes' => isset($data['notes']) ? trim((string) $data['notes']) : null,
                    'status' => 'pending',
                    'childrenCount' => count($children),
                ],
                array_map(static function ($child) use ($schoolYear) {
                    $child['schoolYear'] = $schoolYear;
                    return $child;
                }, $children)
            );

            $this->sendConfirmationEmail($reinscription);

            Response::created($reinscription, 'Réinscription enregistrée avec succès');
        } catch (\Exception $e) {
            Response::error('Erreur lors de l\'enregistrement de la réinscription: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Met à jour le statut d'un dossier de réinscription
     */
    public function updateStatus($id) {
        try {
            $data = json_decode(file_get_contents('php://input'), true);

            if (!$data || !is_array($data)) {
                Response::badRequest('Données JSON invalides');
                return;
            }

            $status = trim((string) ($data['status'] ?? ''));
            if (!in_array($status, self::ALLOWED_STATUSES, true)) {
                Response::validationError(['status' => ['Statut de réinscription invalide']]);
                return;
            }

            $reinscription = Reinscription::updateStatus((int) $id, $status);

            if (!$reinscription) {
                Response::notFound('Réinscription introuvable');
                return;
            }

            Response::json($reinscription, 200);
        } catch (\Exception $e) {
            Response::error('Erreur lors de la mise à jour de la réinscription: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Valide les enfants du dossier
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
     * Normalise les données enfants avant insertion
     */
    private function normalizeChildren($children) {
        return array_map(function ($child, $index) {
            return [
                'sourceChildId' => isset($child['sourceChildId']) ? (int) $child['sourceChildId'] : null,
                'schoolYear' => trim((string) ($child['schoolYear'] ?? $this->defaultSchoolYear())),
                'firstName' => trim((string) ($child['firstName'] ?? '')),
                'lastName' => trim((string) ($child['lastName'] ?? '')),
                'birthDate' => trim((string) ($child['birthDate'] ?? '')),
                'arabicLevel' => (int) ($child['arabicLevel'] ?? 1),
                'hasActivityOnWednesday' => !empty($child['hasActivityOnWednesday']) ? 1 : 0,
                'hasActivityOnSaturday' => !empty($child['hasActivityOnSaturday']) ? 1 : 0,
                'hasActivityOnSunday' => !empty($child['hasActivityOnSunday']) ? 1 : 0,
                'activityDetails' => trim((string) ($child['activityDetails'] ?? '')),
                'status' => 'pending',
                'sortOrder' => isset($child['sortOrder']) ? (int) $child['sortOrder'] : $index,
            ];
        }, $children, array_keys($children));
    }

    /**
     * Envoie un email de confirmation simple
     */
    private function sendConfirmationEmail(array $reinscription) {
        try {
            $emailService = new EmailService();
            $childrenSummary = '';

            foreach ($reinscription['children'] as $child) {
                $childrenSummary .= '<li>' . htmlspecialchars($child['firstName']) . ' ' . htmlspecialchars($child['lastName']) . ' - niveau ' . (int) $child['arabicLevel'] . '</li>';
            }

            $content = '
                <h2>Confirmation de votre demande de réinscription</h2>
                <p>Bonjour ' . htmlspecialchars($reinscription['fullName']) . ',</p>
                <p>Nous avons bien reçu votre demande de ' . ($reinscription['requestType'] === 'renewal' ? 'réinscription' : 'nouvelle demande') . ' pour l\'année ' . htmlspecialchars($reinscription['schoolYear']) . '.</p>
                <p><strong>Enfants concernés :</strong></p>
                <ul>' . $childrenSummary . '</ul>
                <p>Notre équipe vérifiera votre dossier et reviendra vers vous si nécessaire.</p>
            ';

            $emailService->sendEmail($reinscription['email'], 'Confirmation de votre demande de réinscription', $content, true);
        } catch (\Exception $e) {
            error_log('Reinscription confirmation email error: ' . $e->getMessage());
        }
    }

    /**
     * Déduit le type de demande
     */
    private function resolveRequestType(array $data): string {
        if (isset($data['requestType']) && in_array($data['requestType'], self::ALLOWED_REQUEST_TYPES, true)) {
            return $data['requestType'];
        }

        return !empty($data['wasRegisteredLastYear']) ? 'renewal' : 'new';
    }

    /**
     * Détermine si la demande vient d'un parent invité
     */
    private function resolveIsGuest(array $data): int {
        return empty($data['sourceUserId']) ? 1 : 0;
    }

    /**
     * Construit l'année scolaire par défaut
     */
    private function defaultSchoolYear(): string {
        $year = (int) date('Y');
        return $year . '/' . ($year + 1);
    }
}