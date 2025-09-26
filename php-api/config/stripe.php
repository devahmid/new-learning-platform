<?php
/**
 * Configuration Stripe
 * Suit le même pattern que database.php et email.php
 */

class StripeConfig {
    // Configuration Stripe - Clés de production
    const SECRET_KEY = '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'; // Clé secrète Stripe
    const PUBLISHABLE_KEY = 'pk_live_your_stripe_publishable_key'; // Clé publique Stripe (à récupérer dans votre dashboard)
    const WEBHOOK_SECRET = 'whsec_kCRq8Gdmz62ke4lTN91tnnWLkNTsgoh8'; // Secret webhook
    
    // Configuration pour test (décommentez si vous voulez tester en mode sandbox)
    // const SECRET_KEY = 'sk_test_your_stripe_secret_key';
    // const PUBLISHABLE_KEY = 'pk_test_your_stripe_publishable_key';
    // const WEBHOOK_SECRET = 'whsec_your_webhook_secret';
    
    // URLs de l'API Stripe
    const API_URL = 'https://api.stripe.com/v1/';
    
    // Configuration des paiements
    const DEFAULT_CURRENCY = 'eur';
    
    // URLs de retour (à adapter selon votre domaine)
    const SUCCESS_URL = 'https://centre-culturel-olivier.fr/mon-compte?payment=success&session_id={CHECKOUT_SESSION_ID}';
    const CANCEL_URL = 'https://centre-culturel-olivier.fr/mon-compte?payment=cancel';
    
    /**
     * Obtenir la clé secrète
     */
    public static function getSecretKey() {
        return self::SECRET_KEY;
    }
    
    /**
     * Obtenir la clé publique
     */
    public static function getPublishableKey() {
        return self::PUBLISHABLE_KEY;
    }
    
    /**
     * Obtenir le secret webhook
     */
    public static function getWebhookSecret() {
        return self::WEBHOOK_SECRET;
    }
    
    /**
     * Obtenir l'URL de succès
     */
    public static function getSuccessUrl() {
        return self::SUCCESS_URL;
    }
    
    /**
     * Obtenir l'URL d'annulation
     */
    public static function getCancelUrl() {
        return self::CANCEL_URL;
    }
    
    /**
     * Vérifier si on est en mode test
     */
    public static function isTestMode() {
        return strpos(self::SECRET_KEY, 'sk_test_') === 0;
    }
    
    /**
     * Vérifier si on est en mode production
     */
    public static function isProductionMode() {
        return strpos(self::SECRET_KEY, 'sk_live_') === 0;
    }
}
?>
