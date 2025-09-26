<?php

/**
 * Routes pour les paiements Stripe et PayPal
 * À inclure dans le fichier principal de routage
 */

use App\Controllers\PaymentController;

$paymentController = new PaymentController();

// Routes pour les paiements Stripe
$router->post('/payment/stripe-session', function() use ($paymentController) {
    return $paymentController->createStripeSession();
});

$router->post('/payment/intent', function() use ($paymentController) {
    return $paymentController->createPaymentIntent();
});

$router->post('/payment/confirm-stripe', function() use ($paymentController) {
    return $paymentController->confirmStripePayment();
});

// Routes pour les paiements PayPal
$router->get('/payment/paypal-client-id', function() use ($paymentController) {
    return $paymentController->getPayPalClientId();
});

$router->get('/payment/paypal', function() use ($paymentController) {
    return $paymentController->createPayPalOrder();
});

$router->post('/payment/paypal-capture', function() use ($paymentController) {
    return $paymentController->capturePayPal();
});

// Routes pour les paiements SumUp
$router->post('/payment/sumup-checkout', function() use ($paymentController) {
    return $paymentController->createSumUpCheckout();
});

$router->post('/payment/sumup-webhook', function() use ($paymentController) {
    return $paymentController->processSumUpWebhook();
});

$router->get('/payment/sumup-pay', function() use ($paymentController) {
    return $paymentController->showSumUpPaymentPage();
});

// Routes générales
$router->get('/payment/status/{id}', function($paymentId) use ($paymentController) {
    return $paymentController->getPaymentStatus($paymentId);
});

$router->get('/payment/history/{userId}', function($userId) use ($paymentController) {
    return $paymentController->getUserPaymentHistory($userId);
});

// Pages de retour
$router->get('/payment/success', function() use ($paymentController) {
    return $paymentController->paymentSuccess();
});

$router->get('/payment/callback', function() use ($paymentController) {
    return $paymentController->paymentCallback();
});

// Route pour tester l'API (à supprimer en production)
$router->get('/payment/test', function() use ($paymentController) {
    return $paymentController->test();
});