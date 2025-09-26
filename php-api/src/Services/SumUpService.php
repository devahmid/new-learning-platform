<?php

namespace App\Services;

/**
 * Service SumUp - Gestion des paiements via l'API SumUp
 * Compatible avec hébergement mutualisé (sans Composer)
 */
class SumUpService {
    private $appId;
    private $appSecret;
    private $baseUrl;
    private $merchantCode;
    private $accessToken = null;
    private $tokenExpiry = null;
    
    public function __construct() {
        // Charger la configuration SumUp
        require_once __DIR__ . '/../../config/sumup.php';
        
        $this->appId = \SumUpConfig::APP_ID;
        $this->appSecret = \SumUpConfig::APP_SECRET;
        $this->baseUrl = \SumUpConfig::getBaseUrl();
        $this->merchantCode = \SumUpConfig::MERCHANT_CODE;
    }
    
    /**
     * Créer un checkout SumUp
     */
    public function createCheckout($amount, $currency, $checkoutReference, $description = 'Paiement cours') {
        try {
            // Valider le montant
            $validAmount = \SumUpConfig::validateAmount($amount);
            
            $data = [
                'checkout_reference' => $checkoutReference,
                'amount' => $validAmount,
                'currency' => $currency,
                'merchant_code' => $this->merchantCode,
                'description' => $description,
                'return_url' => \SumUpConfig::getReturnUrl(),
                'redirect_url' => \SumUpConfig::getCallbackUrl()
            ];
            
            $response = $this->makeRequest('POST', 'checkouts', $data);
            
            if (isset($response['id'])) {
                return [
                    'success' => true,
                    'checkout_id' => $response['id'],
                    'checkout_url' => $this->generateCheckoutUrl($response['id']),
                    'status' => $response['status'] ?? 'PENDING',
                    'merchant_code' => $this->merchantCode,
                    'merchant_name' => $response['merchant_name'] ?? 'CENTRE CULTUREL DE L\'OLIVIER',
                    'amount' => $validAmount,
                    'currency' => $currency
                ];
            }
            
            throw new \Exception('Réponse invalide de SumUp: ' . json_encode($response));
            
        } catch (\Exception $e) {
            error_log('Erreur SumUp createCheckout: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Récupérer le statut d'un checkout
     */
    public function getCheckoutStatus($checkoutId) {
        try {
            $response = $this->makeRequest('GET', 'checkouts/' . $checkoutId);
            
            return [
                'success' => true,
                'status' => $response['status'] ?? 'unknown',
                'data' => $response
            ];
            
        } catch (\Exception $e) {
            error_log('Erreur SumUp getCheckoutStatus: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Traiter un webhook SumUp
     */
    public function processWebhook($payload) {
        try {
            // Vérifier la signature du webhook (si configurée)
            if (!$this->verifyWebhookSignature($payload)) {
                throw new \Exception('Signature webhook invalide');
            }
            
            $eventType = $payload['event_type'] ?? '';
            $checkoutId = $payload['checkout_id'] ?? $payload['id'] ?? '';
            
            switch ($eventType) {
                case 'checkout.completed':
                case 'PAID':
                    return $this->handleCheckoutCompleted($checkoutId, $payload);
                    
                case 'checkout.failed':
                case 'FAILED':
                    return $this->handleCheckoutFailed($checkoutId, $payload);
                    
                default:
                    error_log('Event type SumUp non géré: ' . $eventType);
                    return ['success' => true, 'message' => 'Event type non géré: ' . $eventType];
            }
            
        } catch (\Exception $e) {
            error_log('Erreur SumUp processWebhook: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Effectuer une requête HTTP vers l'API SumUp
     */
    private function makeRequest($method, $endpoint, $data = null) {
        $url = $this->baseUrl . $endpoint;
        
        $headers = [
            'Authorization: Bearer ' . $this->getAccessToken(),
            'Content-Type: application/json',
            'Accept: application/json',
            'User-Agent: CentreCulturelOlivier/1.0'
        ];
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        
        if ($method === 'POST' && $data) {
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);
        
        if ($error) {
            throw new \Exception('Erreur cURL: ' . $error);
        }
        
        $decodedResponse = json_decode($response, true);
        
        // Log pour debug
        error_log('SumUp API Request: ' . $method . ' ' . $url);
        error_log('SumUp API Response (' . $httpCode . '): ' . $response);
        
        if ($httpCode >= 400) {
            $errorMessage = 'Erreur HTTP ' . $httpCode;
            if ($decodedResponse && isset($decodedResponse['message'])) {
                $errorMessage .= ': ' . $decodedResponse['message'];
            }
            if ($decodedResponse && isset($decodedResponse['error_description'])) {
                $errorMessage .= ': ' . $decodedResponse['error_description'];
            }
            throw new \Exception($errorMessage);
        }
        
        if (!$decodedResponse) {
            throw new \Exception('Réponse JSON invalide de SumUp');
        }
        
        return $decodedResponse;
    }
    
    /**
     * Obtenir un token d'accès OAuth2
     */
    private function getAccessToken() {
        // Si on a déjà un token valide, le retourner
        if ($this->accessToken && $this->tokenExpiry && time() < $this->tokenExpiry) {
            return $this->accessToken;
        }
        
        // Obtenir un nouveau token
        $tokenUrl = 'https://api.sumup.com/token';
        
        $data = [
            'grant_type' => 'client_credentials',
            'client_id' => $this->appId,
            'client_secret' => $this->appSecret,
            'scope' => 'payments'
        ];
        
        $headers = [
            'Content-Type: application/x-www-form-urlencoded',
            'Accept: application/json',
            'User-Agent: CentreCulturelOlivier/1.0'
        ];
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $tokenUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);
        
        if ($error) {
            throw new \Exception("Erreur cURL lors de l'obtention du token: " . $error);
        }
        
        $decodedResponse = json_decode($response, true);
        
        // Log pour debug
        error_log('SumUp Token Request - HTTP Code: ' . $httpCode);
        error_log('SumUp Token Response: ' . $response);
        
        if ($httpCode >= 200 && $httpCode < 300 && isset($decodedResponse['access_token'])) {
            $this->accessToken = $decodedResponse['access_token'];
            // Calculer l'expiration (généralement 1 heure)
            $expiresIn = $decodedResponse['expires_in'] ?? 3600;
            $this->tokenExpiry = time() + $expiresIn - 60; // 1 minute de marge
            
            return $this->accessToken;
        } else {
            $errorMessage = 'Erreur SumUp OAuth (' . $httpCode . ')';
            if (isset($decodedResponse['error_description'])) {
                $errorMessage .= ': ' . $decodedResponse['error_description'];
            }
            if (isset($decodedResponse['error'])) {
                $errorMessage .= ' (' . $decodedResponse['error'] . ')';
            }
            $errorMessage .= ' - Response: ' . $response;
            
            throw new \Exception($errorMessage);
        }
    }
    
    /**
     * Générer une URL de checkout SumUp directe
     */
    private function generateCheckoutUrl($checkoutId) {
        // Utiliser l'URL de paiement SumUp directe pour les paiements en ligne
        return 'https://checkout.sumup.com/pay/' . $checkoutId;
    }
    
    /**
     * Vérifier la signature du webhook (optionnel)
     */
    private function verifyWebhookSignature($payload) {
        // Pour l'instant, on accepte tous les webhooks
        // Vous pouvez implémenter une vérification de signature ici
        return true;
    }
    
    /**
     * Gérer un checkout complété
     */
    private function handleCheckoutCompleted($checkoutId, $payload) {
        // TODO: Implémenter la logique métier
        // - Marquer le paiement comme réussi en base de données
        // - Envoyer un email de confirmation
        // - Débloquer l'accès aux cours
        
        error_log('SumUp: Checkout complété - ID: ' . $checkoutId);
        
        return [
            'success' => true,
            'message' => 'Paiement traité avec succès',
            'checkout_id' => $checkoutId
        ];
    }
    
    /**
     * Gérer un checkout échoué
     */
    private function handleCheckoutFailed($checkoutId, $payload) {
        // TODO: Implémenter la logique métier
        // - Marquer le paiement comme échoué
        // - Notifier l'utilisateur
        
        error_log('SumUp: Checkout échoué - ID: ' . $checkoutId);
        
        return [
            'success' => true,
            'message' => 'Paiement échoué traité',
            'checkout_id' => $checkoutId
        ];
    }
}
?>