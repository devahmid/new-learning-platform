<?php
/**
 * Configuration SumUp
 * Suit le même pattern que database.php et stripe.php
 */

class SumUpConfig {
    // Configuration SumUp - Clés de production
    const APP_ID = 'cc_classic_j4Y3p9tE9ft8hYjhUQqBeC7nXFNuC';
    const APP_SECRET = 'cc_sk_classic_amJFN4kAU56hkzSbrv1ruBVySaC7R5s7LDK10xokVudATZ2NKf';
    const MERCHANT_CODE = 'MCR7N7AA'; // À vérifier dans votre dashboard SumUp
    const ENVIRONMENT = 'sandbox'; // 'sandbox' ou 'live'
    
    // URLs de l'API SumUp
    const BASE_URL_SANDBOX = 'https://api.sumup.com/v0.1/';
    const BASE_URL_LIVE = 'https://api.sumup.com/v0.1/';
    
    // Configuration des paiements
    const DEFAULT_CURRENCY = 'EUR';
    const MIN_AMOUNT = 0.50; // Montant minimum SumUp
    
    // URLs de retour (adaptez selon votre domaine)
    const RETURN_URL = 'https://centre-culturel-olivier.fr/api/payment/success';
    const CALLBACK_URL = 'https://centre-culturel-olivier.fr/api/payment/callback';
    const WEBHOOK_URL = 'https://centre-culturel-olivier.fr/api/payment/sumup-webhook';
    
    /**
     * Obtenir l'URL de base selon l'environnement
     */
    public static function getBaseUrl() {
        return self::ENVIRONMENT === 'live' ? self::BASE_URL_LIVE : self::BASE_URL_SANDBOX;
    }
    
    /**
     * Obtenir l'URL de retour
     */
    public static function getReturnUrl() {
        return self::RETURN_URL;
    }
    
    /**
     * Obtenir l'URL de callback
     */
    public static function getCallbackUrl() {
        return self::CALLBACK_URL;
    }
    
    /**
     * Obtenir l'URL de webhook
     */
    public static function getWebhookUrl() {
        return self::WEBHOOK_URL;
    }
    
    /**
     * Vérifier si on est en mode sandbox
     */
    public static function isSandbox() {
        return self::ENVIRONMENT === 'sandbox';
    }
    
    /**
     * Vérifier si on est en mode production
     */
    public static function isProduction() {
        return self::ENVIRONMENT === 'live';
    }
    
    /**
     * Valider un montant pour SumUp
     */
    public static function validateAmount($amount) {
        $numericAmount = floatval($amount);
        if ($numericAmount < self::MIN_AMOUNT) {
            throw new \Exception('Montant minimum : ' . self::MIN_AMOUNT . ' EUR');
        }
        return $numericAmount;
    }
}
?>