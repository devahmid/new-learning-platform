<?php

namespace App\Controllers;

use App\Utils\Response;
use App\Services\SumUpService;
use App\Models\Payment;

/**
 * Contrôleur de paiement - Gestion des paiements Stripe et PayPal
 */
class PaymentController {
    
    public function __construct() {
        // Charger la configuration Stripe
        require_once __DIR__ . '/../../config/stripe.php';
        // Charger la configuration SumUp
        require_once __DIR__ . '/../../config/sumup.php';
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
                // Enregistrer le paiement en base de données
                $payment = new Payment();
                $payment->userId = $userId;
                $payment->amount = $amount / 100; // Convertir les centimes en euros
                $payment->currency = 'EUR';
                $payment->status = 'pending'; // Statut initial
                $payment->paymentMethod = 'stripe';
                $payment->transactionId = $decodedResponse['id']; // Session ID Stripe
                $payment->description = $description;
                $payment->metadata = json_encode([
                    'stripe_session_id' => $decodedResponse['id'],
                    'stripe_url' => $decodedResponse['url'],
                    'email' => $email
                ]);
                $payment->save();

                return Response::success([
                    'url' => $decodedResponse['url'],
                    'session_id' => $decodedResponse['id'],
                    'amount' => $amount,
                    'userId' => $userId,
                    'description' => $description,
                    'payment_id' => $payment->id
                ]);
            } else {
                // En cas d'erreur Stripe, retourner une erreur
                $errorMessage = $decodedResponse['error']['message'] ?? 'Erreur inconnue de Stripe';
                error_log('Erreur Stripe API: ' . $errorMessage . ' - Response: ' . $response);
                throw new \Exception("Erreur Stripe: " . $errorMessage);
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
            $paypalOrderId = $_GET['paypalOrderId'] ?? null;
            
            if (!$amount || !$userId) {
                return Response::error('Paramètres manquants', 400);
            }
            
            // Utiliser l'order ID de PayPal si fourni, sinon générer un ID temporaire
            $orderId = $paypalOrderId ?: "paypal_order_" . uniqid();
            
            // Enregistrer le paiement en base de données
            $payment = new Payment();
            $payment->userId = $userId;
            $payment->amount = $amount; // PayPal travaille déjà en euros
            $payment->currency = 'EUR';
            $payment->status = $paypalOrderId ? 'completed' : 'pending'; // Si order ID PayPal fourni, c'est déjà complet
            $payment->paymentMethod = 'paypal';
            $payment->transactionId = $orderId; // Order ID PayPal
            $payment->description = 'Paiement cours';
            $payment->metadata = json_encode([
                'paypal_order_id' => $orderId,
                'amount_original' => $amount
            ]);
            $payment->save();
            
            return Response::success([
                'id' => $orderId,
                'amount' => $amount,
                'userId' => $userId,
                'payment_id' => $payment->id
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
            // Trouver le paiement par order ID
            $payment = Payment::findBy('transactionId', $orderId);
            
            if ($payment) {
                // Mettre à jour le statut du paiement
                $payment->status = 'completed';
                $payment->updatedAt = date('Y-m-d H:i:s');
                $payment->save();
                
                return Response::success([
                    'captured' => true,
                    'orderId' => $orderId,
                    'payment_id' => $payment->id,
                    'status' => $payment->status
                ]);
            } else {
                return Response::error('Paiement non trouvé', 404);
            }
            
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
    public function getUserPaymentHistory($userId = null) {
        try {
            // Si $userId n'est pas fourni, l'extraire de l'URL
            if (!$userId) {
                $path = $_SERVER['REQUEST_URI'];
                $pathParts = explode('/', trim($path, '/'));
                $userId = end($pathParts);
            }

            if (!$userId || !is_numeric($userId)) {
                return Response::error('ID utilisateur invalide', 400);
            }

            // Récupérer l'historique des paiements depuis la base de données
            $payments = Payment::where(['userId' => intval($userId)]);
            
            // Convertir les objets Payment en tableaux
            $paymentsArray = [];
            foreach ($payments as $payment) {
                $paymentsArray[] = $payment->toArray();
            }

            return Response::success($paymentsArray);
        } catch (\Exception $e) {
            error_log('PaymentController Error (getUserPaymentHistory): ' . $e->getMessage());
            return Response::error('Erreur lors de la récupération de l\'historique des paiements: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Confirmer un paiement Stripe (appelé après succès)
     * POST /payment/confirm-stripe
     */
    public function confirmStripePayment() {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            $sessionId = $input['session_id'] ?? null;

            if (!$sessionId) {
                return Response::error('Session ID manquant', 400);
            }

            // Trouver le paiement par session ID
            $payment = Payment::findBy('transactionId', $sessionId);
            
            if (!$payment) {
                return Response::error('Paiement non trouvé', 404);
            }

            // Mettre à jour le statut du paiement
            $payment->status = 'completed';
            $payment->updatedAt = date('Y-m-d H:i:s');
            $payment->save();

            return Response::success([
                'message' => 'Paiement confirmé avec succès',
                'payment_id' => $payment->id,
                'status' => $payment->status
            ]);

        } catch (\Exception $e) {
            error_log('PaymentController Error (confirmStripePayment): ' . $e->getMessage());
            return Response::error('Erreur lors de la confirmation du paiement: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Gère la page de succès après un paiement
     * GET /payment/success
     */
    public function paymentSuccess() {
        // Rediriger vers la page de succès du frontend
        header('Location: https://centre-culturel-olivier.fr/mon-compte?payment=success');
        exit;
    }
    
    /**
     * Gère le callback de paiement
     * GET /payment/callback
     */
    public function paymentCallback() {
        // Récupérer le checkout_id depuis les paramètres GET
        $checkoutId = $_GET['checkout_id'] ?? null;
        
        if ($checkoutId) {
            // Traiter le callback SumUp si nécessaire
            // Ici on pourrait vérifier le statut du paiement avec SumUp
            
            // Rediriger vers la page de succès du frontend
            header('Location: https://centre-culturel-olivier.fr/mon-compte?payment=success&checkout_id=' . urlencode($checkoutId));
            exit;
        }
        
        // Fallback si pas de checkout_id
        header('Location: https://centre-culturel-olivier.fr/mon-compte?payment=success');
        exit;
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
                'sumup' => 'active',
                'database' => 'connected'
            ]
        ]);
    }
    
    /**
     * Créer un checkout SumUp
     * POST /payment/sumup-checkout
     */
    public function createSumUpCheckout() {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            // Validation
            if (!$input || !isset($input['amount']) || !isset($input['userId'])) {
                return Response::error('Données manquantes ou invalides', 400);
            }
            
            $amount = floatval($input['amount']);
            $userId = intval($input['userId']);
            $currency = $input['currency'] ?? 'EUR';
            $description = $input['description'] ?? 'Paiement cours';
            
            // Générer une référence unique
            $checkoutReference = 'CHECKOUT_' . $userId . '_' . time();
            
            // Créer le service SumUp
            $sumupService = new SumUpService();
            
            // Créer le checkout
            $result = $sumupService->createCheckout($amount, $currency, $checkoutReference, $description);
            
            if ($result['success']) {
                // Enregistrer le paiement en base de données
                $payment = new Payment();
                $payment->userId = $userId;
                $payment->amount = $amount; // SumUp travaille déjà en euros
                $payment->currency = $currency;
                $payment->status = 'pending'; // Statut initial
                $payment->paymentMethod = 'sumup';
                $payment->transactionId = $result['checkout_id']; // Checkout ID SumUp
                $payment->description = $description;
                $payment->metadata = json_encode([
                    'sumup_checkout_id' => $result['checkout_id'],
                    'checkout_reference' => $checkoutReference,
                    'merchant_code' => $result['merchant_code'],
                    'amount_original' => $amount
                ]);
                $payment->save();
                
                return Response::success([
                    'checkout_id' => $result['checkout_id'],
                    'checkout_url' => $result['checkout_url'],
                    'amount' => $result['amount'],
                    'currency' => $result['currency'],
                    'userId' => $userId,
                    'description' => $description,
                    'merchant_code' => $result['merchant_code'],
                    'status' => $result['status'],
                    'payment_id' => $payment->id
                ]);
            } else {
                return Response::error($result['error'], 400);
            }
            
        } catch (\Exception $e) {
            error_log('Erreur createSumUpCheckout: ' . $e->getMessage());
            return Response::error('Erreur lors de la création du checkout SumUp: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Traiter un webhook SumUp
     * POST /payment/sumup-webhook
     */
    public function processSumUpWebhook() {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input) {
                return Response::error('Payload webhook invalide', 400);
            }
            
            // Créer le service SumUp
            $sumupService = new SumUpService();
            
            // Traiter le webhook
            $result = $sumupService->processWebhook($input);
            
            if ($result['success']) {
                // Mettre à jour le statut du paiement en base
                if (isset($input['checkout_id'])) {
                    $payment = Payment::findBy('transactionId', $input['checkout_id']);
                    if ($payment) {
                        $payment->status = 'completed';
                        $payment->paidAt = date('Y-m-d H:i:s');
                        $payment->save();
                    }
                }
                
                return Response::success($result);
            } else {
                return Response::error($result['error'], 400);
            }
            
        } catch (\Exception $e) {
            error_log('Erreur processSumUpWebhook: ' . $e->getMessage());
            return Response::error('Erreur lors du traitement du webhook: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Afficher la page de paiement SumUp
     * GET /payment/sumup-pay?id=checkout_id
     */
    public function showSumUpPaymentPage() {
        try {
            $checkoutId = $_GET['id'] ?? '';
            
            if (!$checkoutId) {
                return Response::error('ID de checkout manquant', 400);
            }
            
            // Créer le service SumUp
            $sumupService = new SumUpService();
            
            // Récupérer les informations du checkout
            $checkout = $sumupService->getCheckoutStatus($checkoutId);
            
            if (!$checkout['success']) {
                return Response::error('Checkout non trouvé', 404);
            }
            
            // Afficher la page HTML de paiement
            $this->renderSumUpPaymentPage($checkoutId, $checkout['data']);
            
        } catch (\Exception $e) {
            error_log('Erreur showSumUpPaymentPage: ' . $e->getMessage());
            return Response::error('Erreur lors de l\'affichage de la page de paiement', 500);
        }
    }
    
    /**
     * Rendre la page HTML de paiement SumUp
     */
    private function renderSumUpPaymentPage($checkoutId, $checkoutData) {
        $amount = $checkoutData['amount'] ?? 0;
        $description = $checkoutData['description'] ?? 'Paiement';
        $merchantName = $checkoutData['merchant_name'] ?? 'CENTRE CULTUREL DE L\'OLIVIER';
        
        header('Content-Type: text/html; charset=utf-8');
        
        echo '<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Paiement SumUp - Centre Culturel Olivier</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            max-width: 500px;
            width: 100%;
            text-align: center;
        }
        .logo {
            width: 80px;
            height: 80px;
            background: #4CAF50;
            border-radius: 50%;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
            color: white;
        }
        h1 {
            color: #333;
            margin-bottom: 10px;
        }
        .subtitle {
            color: #666;
            margin-bottom: 30px;
        }
        .payment-info {
            background: #f8f9fa;
            border-radius: 15px;
            padding: 25px;
            margin: 20px 0;
        }
        .amount {
            font-size: 36px;
            font-weight: bold;
            color: #4CAF50;
            margin: 10px 0;
        }
        .details {
            color: #666;
            margin: 10px 0;
        }
        .instructions {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
            text-align: left;
        }
        .instructions h3 {
            margin-top: 0;
            color: #856404;
        }
        .instructions ol {
            margin: 10px 0;
            padding-left: 20px;
        }
        .instructions li {
            margin: 5px 0;
            color: #856404;
        }
        .contact {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
        }
        .contact a {
            color: #4CAF50;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">💳</div>
        <h1>Paiement SumUp</h1>
        <p class="subtitle">' . htmlspecialchars($merchantName) . '</p>
        
        <div class="payment-info">
            <div class="amount">' . number_format($amount, 2) . '€</div>
            <div class="details">' . htmlspecialchars($description) . '</div>
            <div class="details">ID: ' . htmlspecialchars($checkoutId) . '</div>
        </div>
        
        <div class="instructions">
            <h3>📱 Comment effectuer le paiement :</h3>
            <ol>
                <li>Contactez le commerçant pour effectuer le paiement</li>
                <li>Montrez cet écran au commerçant</li>
                <li>Le paiement sera traité via le terminal SumUp</li>
                <li>Vous recevrez une confirmation par email</li>
            </ol>
        </div>
        
        <div class="contact">
            <p>Besoin d\'aide ?</p>
            <p>Contactez-nous : <a href="mailto:centre.culturel.olivier@gmail.com">centre.culturel.olivier@gmail.com</a></p>
        </div>
    </div>
</body>
</html>';
        exit;
    }
}