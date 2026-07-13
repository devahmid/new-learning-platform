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
    private const ADMIN_RECIPIENT_EMAIL = 'centre.culturel.olivier@gmail.com';
    private const REGISTRATIONS_CLOSED = true;

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
            if (self::REGISTRATIONS_CLOSED) {
                Response::error('Les inscriptions et réinscriptions sont actuellement closes.', 403);
                return;
            }

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
            $childrenCards = '';

            foreach (($reinscription['children'] ?? []) as $index => $child) {
                $activityFlags = [];

                if (!empty($child['hasActivityOnWednesday'])) {
                    $activityFlags[] = 'Mercredi';
                }

                if (!empty($child['hasActivityOnSaturday'])) {
                    $activityFlags[] = 'Samedi';
                }

                if (!empty($child['hasActivityOnSunday'])) {
                    $activityFlags[] = 'Dimanche';
                }

                $childrenCards .= '
                    <div style="margin-top:16px;padding:16px;border:1px solid #e5e7eb;border-radius:14px;background:#ffffff;">
                        <h3 style="margin:0 0 10px;font-size:16px;color:#10312a;">Enfant ' . ($index + 1) . '</h3>
                        <p style="margin:0 0 6px;"><strong>Nom :</strong> ' . htmlspecialchars($child['firstName']) . ' ' . htmlspecialchars($child['lastName']) . '</p>
                        <p style="margin:0 0 6px;"><strong>Date de naissance :</strong> ' . htmlspecialchars($child['birthDate']) . '</p>
                        <p style="margin:0 0 6px;"><strong>Niveau d’arabe :</strong> ' . (int) $child['arabicLevel'] . '</p>
                        <p style="margin:0 0 6px;"><strong>Créneaux signalés :</strong> ' . (!empty($activityFlags) ? htmlspecialchars(implode(', ', $activityFlags)) : 'Aucun') . '</p>
                        <p style="margin:0;"><strong>Détails :</strong> ' . (!empty($child['activityDetails']) ? nl2br(htmlspecialchars($child['activityDetails'])) : 'Aucun détail ajouté') . '</p>
                    </div>
                ';
            }

            $requestTypeLabel = $reinscription['requestType'] === 'renewal' ? 'Réinscription' : 'Nouvelle demande';
            $acceptedConditionsLabel = !empty($reinscription['acceptedConditions']) ? 'Oui' : 'Non';
            $notesHtml = !empty($reinscription['notes']) ? nl2br(htmlspecialchars($reinscription['notes'])) : 'Aucune note ajoutée';

            $content = '
                <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937;background:#f8faf9;padding:24px;">
                    <div style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #dbe7df;border-radius:20px;overflow:hidden;">
                        <div style="background:linear-gradient(135deg,#10312a,#1D9E75);color:#fff;padding:28px 32px;">
                            <h2 style="margin:0;font-size:26px;line-height:1.2;">Récapitulatif de votre demande de réinscription</h2>
                            <p style="margin:10px 0 0;opacity:0.95;">Votre formulaire a bien été reçu pour l’année ' . htmlspecialchars($reinscription['schoolYear']) . '.</p>
                        </div>
                        <div style="padding:32px;">
                            <p style="margin-top:0;">Bonjour ' . htmlspecialchars($reinscription['fullName']) . ',</p>
                            <p>Voici le récapitulatif des informations transmises lors de l’envoi de votre formulaire.</p>

                            <div style="margin-top:24px;padding:18px;border-radius:16px;background:#f5fdf8;border:1px solid #d9eadf;">
                                <p style="margin:0 0 8px;"><strong>Type de demande :</strong> ' . htmlspecialchars($requestTypeLabel) . '</p>
                                <p style="margin:0 0 8px;"><strong>Parent :</strong> ' . htmlspecialchars($reinscription['fullName']) . '</p>
                                <p style="margin:0 0 8px;"><strong>Email :</strong> ' . htmlspecialchars($reinscription['email']) . '</p>
                                <p style="margin:0 0 8px;"><strong>Téléphone :</strong> ' . htmlspecialchars($reinscription['phone']) . '</p>
                                <p style="margin:0 0 8px;"><strong>Année scolaire :</strong> ' . htmlspecialchars($reinscription['schoolYear']) . '</p>
                                <p style="margin:0;"><strong>Conditions acceptées :</strong> ' . htmlspecialchars($acceptedConditionsLabel) . '</p>
                            </div>

                            <h3 style="margin:28px 0 8px;font-size:18px;color:#10312a;">Enfants concernés</h3>
                            ' . $childrenCards . '

                            <h3 style="margin:28px 0 8px;font-size:18px;color:#10312a;">Informations complémentaires</h3>
                            <div style="padding:18px;border-radius:16px;background:#fafcfb;border:1px solid #e5e7eb;">
                                <p style="margin:0;"><strong>Notes :</strong><br>' . $notesHtml . '</p>
                            </div>

                            <p style="margin-top:28px;">Notre équipe va vérifier votre dossier et reviendra vers vous si nécessaire.</p>
                            <p style="margin-bottom:0;">Si vous constatez une erreur dans ce récapitulatif, merci de nous contacter rapidement.</p>
                        </div>
                    </div>
                </div>
            ';

            $subject = 'Récapitulatif de votre demande de réinscription';
            $emailService->sendEmail($reinscription['email'], $subject, $content, true);
            $emailService->sendEmail(self::ADMIN_RECIPIENT_EMAIL, '[Copie admin] ' . $subject, $content, true);
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