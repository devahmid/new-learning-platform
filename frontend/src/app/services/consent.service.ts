import { Injectable } from '@angular/core';

declare let gtag: Function;

export interface ConsentSettings {
  analytics_storage?: 'granted' | 'denied';
  ad_storage?: 'granted' | 'denied';
  functionality_storage?: 'granted' | 'denied';
  personalization_storage?: 'granted' | 'denied';
  security_storage?: 'granted' | 'denied';
}

@Injectable({
  providedIn: 'root'
})
export class ConsentService {
  private readonly CONSENT_KEY = 'user_consent_preferences';
  private readonly CONSENT_TIMESTAMP_KEY = 'user_consent_timestamp';
  
  constructor() {
    this.loadSavedConsent();
  }

  /**
   * Charge le consentement sauvegardé au démarrage
   */
  private loadSavedConsent() {
    const savedConsent = this.getSavedConsent();
    if (savedConsent && this.isConsentStillValid()) {
      this.updateGoogleConsent(savedConsent);
    }
  }

  /**
   * Vérifie si le consentement est encore valide (moins de 13 mois)
   */
  private isConsentStillValid(): boolean {
    const timestamp = localStorage.getItem(this.CONSENT_TIMESTAMP_KEY);
    if (!timestamp) return false;
    
    const consentDate = new Date(parseInt(timestamp));
    const now = new Date();
    const thirteenMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 13, now.getDate());
    
    return consentDate > thirteenMonthsAgo;
  }

  /**
   * Accepter tous les cookies
   */
  acceptAllCookies() {
    const consent: ConsentSettings = {
      analytics_storage: 'granted',
      ad_storage: 'granted',
      functionality_storage: 'granted',
      personalization_storage: 'granted',
      security_storage: 'granted'
    };
    
    this.saveConsent(consent);
    this.updateGoogleConsent(consent);
  }

  /**
   * Refuser tous les cookies (sauf essentiels)
   */
  rejectAllCookies() {
    const consent: ConsentSettings = {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      functionality_storage: 'denied',
      personalization_storage: 'denied',
      security_storage: 'granted' // Toujours autorisé pour la sécurité
    };
    
    this.saveConsent(consent);
    this.updateGoogleConsent(consent);
  }

  /**
   * Accepter seulement les cookies nécessaires + analytics
   */
  acceptAnalyticsOnly() {
    const consent: ConsentSettings = {
      analytics_storage: 'granted',
      ad_storage: 'denied',
      functionality_storage: 'denied',
      personalization_storage: 'denied',
      security_storage: 'granted'
    };
    
    this.saveConsent(consent);
    this.updateGoogleConsent(consent);
  }

  /**
   * Personnaliser le consentement
   */
  setCustomConsent(consent: ConsentSettings) {
    // Toujours garantir la sécurité
    consent.security_storage = 'granted';
    
    this.saveConsent(consent);
    this.updateGoogleConsent(consent);
  }

  /**
   * Sauvegarder le consentement dans le localStorage
   */
  private saveConsent(consent: ConsentSettings) {
    localStorage.setItem(this.CONSENT_KEY, JSON.stringify(consent));
    localStorage.setItem(this.CONSENT_TIMESTAMP_KEY, Date.now().toString());
  }

  /**
   * Récupérer le consentement sauvegardé
   */
  getSavedConsent(): ConsentSettings | null {
    const saved = localStorage.getItem(this.CONSENT_KEY);
    return saved ? JSON.parse(saved) : null;
  }

  /**
   * Mettre à jour le consentement Google Analytics
   */
  private updateGoogleConsent(consent: ConsentSettings) {
    if (typeof gtag !== 'undefined') {
      gtag('consent', 'update', consent);
      
      // Si analytics est accepté, réactiver les signaux Google
      if (consent.analytics_storage === 'granted') {
        gtag('config', 'G-72LB4RGGSN', {
          'allow_google_signals': true,
          'allow_ad_personalization_signals': consent.personalization_storage === 'granted'
        });
      }
    }
  }

  /**
   * Vérifier si le consentement a été donné
   */
  hasConsentBeenGiven(): boolean {
    return this.getSavedConsent() !== null && this.isConsentStillValid();
  }

  /**
   * Vérifier si Analytics est autorisé
   */
  isAnalyticsAllowed(): boolean {
    const consent = this.getSavedConsent();
    return consent?.analytics_storage === 'granted';
  }

  /**
   * Révoquer le consentement (réinitialiser)
   */
  revokeConsent() {
    localStorage.removeItem(this.CONSENT_KEY);
    localStorage.removeItem(this.CONSENT_TIMESTAMP_KEY);
    
    // Remettre le consentement par défaut
    if (typeof gtag !== 'undefined') {
      gtag('consent', 'update', {
        'analytics_storage': 'denied',
        'ad_storage': 'denied',
        'functionality_storage': 'denied',
        'personalization_storage': 'denied',
        'security_storage': 'granted'
      });
    }
  }

  /**
   * Obtenir le timestamp du consentement
   */
  getConsentTimestamp(): Date | null {
    const timestamp = localStorage.getItem(this.CONSENT_TIMESTAMP_KEY);
    return timestamp ? new Date(parseInt(timestamp)) : null;
  }

  /**
   * Vérifier si on doit afficher la bannière de consentement
   */
  shouldShowConsentBanner(): boolean {
    return !this.hasConsentBeenGiven();
  }
}