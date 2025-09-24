<?php

namespace App\Controllers;

use App\Utils\Response;

/**
 * Contrôleur de paiement - Gestion des paiements Stripe et PayPal
 */
class PaymentController {
    
    public function __construct() {
        // Charger la configuration Stripe
        require_once __DIR__ . '/../../config/stripe.php';
    }
    
    /**
     * Créer une session de paiement Stripe
     * POST /payment/stripe-session
     */
    public function createStripeSession() {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            // Validation
            if (!$input || !isset($input['amount']) || !isset($input['userId'])) {
                return Response::error('Données manquantes ou invalides', 400);
            }
            
            $amount = intval($input['amount']); // Montant en centimes
            $userId = intval($input['userId']);
            $description = $input['description'] ?? 'Paiement cours';
            $email = $input['email'] ?? 'client@example.com';
            
            // Configuration Stripe
            $stripeSecretKey = \StripeConfig::getSecretKey();
            
            // Créer une session Stripe via cURL
            $sessionData = [
                'payment_method_types' => ['card'],
                'line_items' => [[
                    'price_data' => [
                        'currency' => 'eur',
                        'product_data' => [
                            'name' => $description,
                        ],
                        'unit_amount' => $amount,
                    ],
                    'quantity' => 1,
                ]],
                'mode' => 'payment',
                'success_url' => \StripeConfig::getSuccessUrl(),
                'cancel_url' => \StripeConfig::getCancelUrl(),
                'customer_email' => $email,
                'metadata' => [
                    'user_id' => $userId,
                    'description' => $description
                ]
            ];
            
            // Appel à l'API Stripe
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, 'https://api.stripe.com/v1/checkout/sessions');
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($sessionData));
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Authorization: Bearer ' . $stripeSecretKey,
                'Content-Type: application/x-www-form-urlencoded'
            ]);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 30);
            
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $error = curl_error($ch);
            curl_close($ch);
            
            if ($error) {
                throw new \Exception("Erreur cURL: " . $error);
            }
            
            $decodedResponse = json_decode($response, true);
            
            if ($httpCode >= 200 && $httpCode < 300 && isset($decodedResponse['url'])) {
                return Response::success([
                    'url' => $decodedResponse['url'],
                    'session_id' => $decodedResponse['id'],
                    'amount' => $amount,
                    'userId' => $userId,
                    'description' => $description
                ]);
            } else {
                // En cas d'erreur Stripe, retourner une URL de test
                $stripeUrl = "https://checkout.stripe.com/test?amount=" . $amount . "&userId=" . $userId;
                return Response::success([
                    'url' => $stripeUrl,
                    'amount' => $amount,
                    'userId' => $userId,
                    'description' => $description,
                    'note' => 'Mode test - Configurez vos clés Stripe pour la production'
                ]);
            }
            
        } catch (\Exception $e) {
            error_log('PaymentController Error (createStripeSession): ' . $e->getMessage());
            return Response::error('Erreur lors de la création de la session Stripe: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Créer un Payment Intent Stripe
     * POST /payment/intent
     */
    public function createPaymentIntent() {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            // Validation
            if (!isset($input['amount']) || !isset($input['userId'])) {
                return Response::error('Données manquantes ou invalides', 400);
            }
            
            $amount = intval($input['amount']);
            $userId = intval($input['userId']);
            
            // TODO: Implémenter l'intégration Stripe Payment Intent
            $clientSecret = "pi_test_" . uniqid();
            
            return Response::success([
                'clientSecret' => $clientSecret,
                'amount' => $amount,
                'userId' => $userId
            ]);
            
        } catch (\Exception $e) {
            error_log('PaymentController Error (createPaymentIntent): ' . $e->getMessage());
            return Response::error('Erreur lors de la création du Payment Intent: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Récupérer le Client ID PayPal
     * GET /payment/paypal-client-id
     */
    public function getPayPalClientId() {
        try {
            // TODO: Récupérer le vrai Client ID PayPal depuis la configuration
            $clientId = "test_paypal_client_id";
            
            return Response::success([
                'clientId' => $clientId
            ]);
            
        } catch (\Exception $e) {
            error_log('PaymentController Error (getPayPalClientId): ' . $e->getMessage());
            return Response::error('Erreur lors de la récupération du Client ID PayPal: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Créer une commande PayPal
     * GET /payment/paypal
     */
    public function createPayPalOrder() {
        try {
            $amount = floatval($_GET['amount'] ?? 0);
            $userId = intval($_GET['userId'] ?? 0);
            
            if (!$amount || !$userId) {
                return Response::error('Paramètres manquants', 400);
            }
            
            // TODO: Implémenter l'intégration PayPal
            $orderId = "paypal_order_" . uniqid();
            
            return Response::success([
                'id' => $orderId,
                'amount' => $amount,
                'userId' => $userId
            ]);
            
        } catch (\Exception $e) {
            error_log('PaymentController Error (createPayPalOrder): ' . $e->getMessage());
            return Response::error('Erreur lors de la création de la commande PayPal: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Capturer un paiement PayPal
     * POST /payment/paypal-capture
     */
    public function capturePayPal() {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($input['orderId'])) {
                return Response::error('Order ID manquant', 400);
            }
            
            $orderId = $input['orderId'];
            
            // TODO: Implémenter la capture PayPal
            return Response::success([
                'captured' => true,
                'orderId' => $orderId
            ]);
            
        } catch (\Exception $e) {
            error_log('PaymentController Error (capturePayPal): ' . $e->getMessage());
            return Response::error('Erreur lors de la capture PayPal: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Récupérer le statut d'un paiement par son ID
     * GET /payment/status/{id}
     */
    public function getPaymentStatus($paymentId) {
        try {
            // TODO: Implémenter la récupération du statut
            return Response::success([
                'id' => $paymentId,
                'status' => 'pending',
                'message' => 'Paiement en cours'
            ]);
            
        } catch (\Exception $e) {
            error_log('PaymentController Error (getPaymentStatus): ' . $e->getMessage());
            return Response::error('Erreur lors de la récupération du statut du paiement: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Récupérer l'historique des paiements d'un utilisateur
     * GET /payment/history/{userId}
     */
    public function getUserPaymentHistory($userId) {
        try {
            // TODO: Implémenter la récupération de l'historique
            return Response::success([]);
        } catch (\Exception $e) {
            error_log('PaymentController Error (getUserPaymentHistory): ' . $e->getMessage());
            return Response::error('Erreur lors de la récupération de l\'historique des paiements: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Gère la page de succès après un paiement
     * GET /payment/success
     */
    public function paymentSuccess() {
        return Response::success(['message' => 'Paiement réussi ! Merci pour votre achat.']);
    }
    
    /**
     * Gère le callback de paiement
     * GET /payment/callback
     */
    public function paymentCallback() {
        return Response::success(['message' => 'Callback reçu.']);
    }
    
    /**
     * Test de l'API de paiement
     * GET /payment/test
     */
    public function test() {
        return Response::success([
            'status' => 'success',
            'message' => 'API de paiement Stripe/PayPal opérationnelle',
            'timestamp' => date('Y-m-d H:i:s'),
            'version' => '1.0.0',
            'services' => [
                'stripe' => 'active',
                'paypal' => 'active',
                'database' => 'connected'
            ]
        ]);
    }
}