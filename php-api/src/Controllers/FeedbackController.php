<?php

namespace App\Controllers;

use App\Models\Feedback;
use App\Utils\Response;
use App\Utils\Validator;

class FeedbackController {
    public function create() {
        try {
            $data = json_decode(file_get_contents('php://input'), true);

            if (!$data || !is_array($data)) {
                Response::badRequest('Données JSON invalides');
                return;
            }

            $validator = new Validator($data, [
                'overall' => 'required|numeric',
                'navigation' => 'required|numeric',
                'clarity' => 'required|numeric',
                'design' => 'required|numeric',
                'mobile' => 'required|numeric',
                'speed' => 'required|numeric',
                'trust' => 'required|numeric',
                'nps' => 'numeric',
                'email' => 'email',
                'improvement' => 'max:4000',
                'source' => 'max:2048',
            ]);

            if (!$validator->validate()) {
                Response::validationError($validator->getErrors());
                return;
            }

            $ratings = [
                'overall' => (int) $data['overall'],
                'navigation' => (int) $data['navigation'],
                'clarity' => (int) $data['clarity'],
                'design' => (int) $data['design'],
                'mobile' => (int) $data['mobile'],
                'speed' => (int) $data['speed'],
                'trust' => (int) $data['trust'],
            ];

            foreach ($ratings as $key => $value) {
                if ($value < 1 || $value > 5) {
                    Response::validationError([
                        $key => ["Le champ $key doit être compris entre 1 et 5"],
                    ]);
                    return;
                }
            }

            $nps = isset($data['nps']) && $data['nps'] !== '' && $data['nps'] !== null
                ? (int) $data['nps']
                : null;

            if ($nps !== null && ($nps < 0 || $nps > 10)) {
                Response::validationError([
                    'nps' => ['Le champ nps doit être compris entre 0 et 10'],
                ]);
                return;
            }

            $consent = !empty($data['consentToContact']) ? 1 : 0;
            $email = isset($data['email']) ? trim((string) $data['email']) : '';

            if ($consent && $email === '') {
                Response::validationError([
                    'email' => ['Email requis si consentement au contact est activé'],
                ]);
                return;
            }

            $feedback = Feedback::create([
                ...$ratings,
                'nps' => $nps,
                'improvement' => isset($data['improvement']) ? trim((string) $data['improvement']) : null,
                'consentToContact' => $consent,
                'email' => $consent ? $email : null,
                'source' => isset($data['source']) ? trim((string) $data['source']) : null,
                'createdAt' => date('Y-m-d H:i:s'),
            ]);

            Response::created($feedback->toArray(), 'Avis enregistré');
        } catch (\Exception $e) {
            Response::error('Erreur lors de l\'envoi de l\'avis: ' . $e->getMessage(), 500);
        }
    }

    public function findAll() {
        try {
            $items = Feedback::all();
            $data = array_map(static function ($item) {
                return $item->toArray();
            }, $items);

            Response::json($data, 200);
        } catch (\Exception $e) {
            Response::error('Erreur lors de la récupération des avis: ' . $e->getMessage(), 500);
        }
    }
}

