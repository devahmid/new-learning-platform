import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

declare let gtag: Function;

export interface ConsentSettings {
    analytics_storage?: 'granted' | 'denied';
    ad_storage?: 'granted' | 'denied';
    functionality_storage?: 'granted' | 'denied';
    personalization_storage?: 'granted' | 'denied';
    security_storage?: 'granted' | 'denied';
}

export interface ConsentData {
    analytics: boolean;
    functional: boolean;
    marketing: boolean;
    essential: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class ConsentService {
    private readonly CONSENT_KEY = 'user_consent_preferences';
    private readonly CONSENT_TIMESTAMP_KEY = 'user_consent_timestamp';
    private readonly apiUrl = environment.apiUrl;

    // Subject pour notifier les changements de consentement
    private consentSubject = new BehaviorSubject<ConsentData | null>(null);
    public consent$ = this.consentSubject.asObservable();

    constructor(private http: HttpClient) {
        this.loadSavedConsent();
    }

    /**
     * Charge le consentement sauvegardé au démarrage
     */
    private loadSavedConsent() {
        // Charger d'abord depuis localStorage pour les non-connectés
        const savedConsent = this.getSavedConsent();
        if (savedConsent && this.isConsentStillValid()) {
            this.updateGoogleConsent(savedConsent);
            this.consentSubject.next(this.convertToConsentData(savedConsent));
        }
    }

    /**
     * Charger le consentement depuis la base de données (utilisateur connecté)
     */
    async loadUserConsentFromDatabase(userId: number): Promise<ConsentData | null> {
        try {
            const response = await this.http.get<any>(`${this.apiUrl}/gdpr/consent/${userId}`).toPromise();

            if (response?.success && response.data) {
                const consentData = response.data.consent;

                // Synchroniser avec localStorage pour performances
                this.saveConsentLocally(consentData);

                // Mettre à jour Google Analytics
                this.updateGoogleConsent(this.convertToConsentSettings(consentData));

                // Notifier les composants
                this.consentSubject.next(consentData);

                return consentData;
            }

            return null;
        } catch (error) {
            console.error('Erreur lors du chargement du consentement:', error);
            return null;
        }
    }

    /**
     * Sauvegarder le consentement en base de données ET localStorage
     */
    async saveUserConsent(userId: number, consents: ConsentData): Promise<boolean> {
        try {
            // Sauvegarder en base de données
            const response = await this.http.post<any>(`${this.apiUrl}/gdpr/consent`, {
                userId,
                analytics: consents.analytics,
                functional: consents.functional,
                marketing: consents.marketing,
                essential: consents.essential
            }).toPromise();

            if (response?.success) {
                // Sauvegarder localement pour performances
                this.saveConsentLocally(consents);

                // Mettre à jour Google Analytics
                this.updateGoogleConsent(this.convertToConsentSettings(consents));

                // Notifier les composants
                this.consentSubject.next(consents);

                return true;
            }

            return false;
        } catch (error) {
            console.error('Erreur lors de la sauvegarde du consentement:', error);
            return false;
        }
    }

    /**
     * Vérifier la conformité RGPD d'un utilisateur
     */
    async checkUserCompliance(userId: number): Promise<boolean> {
        try {
            const response = await this.http.get<any>(`${this.apiUrl}/gdpr/compliance/${userId}`).toPromise();
            return response?.success && response.data?.isCompliant;
        } catch (error) {
            console.error('Erreur lors de la vérification de conformité:', error);
            return false;
        }
    }

    /**
     * Révoquer le consentement (utilisateur connecté)
     */
    async revokeUserConsent(userId: number, reason: string = 'user_request'): Promise<boolean> {
        try {
            const response = await this.http.delete<any>(`${this.apiUrl}/gdpr/consent/${userId}`, {
                body: { reason }
            }).toPromise();

            if (response?.success) {
                // Nettoyer localStorage
                this.revokeConsent();

                // Notifier les composants
                this.consentSubject.next(null);

                return true;
            }

            return false;
        } catch (error) {
            console.error('Erreur lors de la révocation du consentement:', error);
            return false;
        }
    }

    /**
     * Convertir ConsentData vers ConsentSettings pour Google Analytics
     */
    private convertToConsentSettings(consent: ConsentData): ConsentSettings {
        return {
            analytics_storage: consent.analytics ? 'granted' : 'denied',
            ad_storage: consent.marketing ? 'granted' : 'denied',
            functionality_storage: consent.functional ? 'granted' : 'denied',
            personalization_storage: consent.marketing ? 'granted' : 'denied',
            security_storage: 'granted'
        };
    }

    /**
     * Convertir ConsentSettings vers ConsentData
     */
    private convertToConsentData(settings: ConsentSettings): ConsentData {
        return {
            analytics: settings.analytics_storage === 'granted',
            functional: settings.functionality_storage === 'granted',
            marketing: settings.ad_storage === 'granted',
            essential: true
        };
    }

    /**
     * Sauvegarder le consentement localement (cache)
     */
    private saveConsentLocally(consent: ConsentData): void {
        const settings = this.convertToConsentSettings(consent);
        localStorage.setItem(this.CONSENT_KEY, JSON.stringify(settings));
        localStorage.setItem(this.CONSENT_TIMESTAMP_KEY, Date.now().toString());
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

    /**
     * Marque l'utilisateur comme conforme RGPD
     */
    markGdprCompliant(): void {
        const compliance = {
            isCompliant: true,
            completedAt: new Date().toISOString(),
            version: '1.0'
        };

        localStorage.setItem('gdpr_compliance', JSON.stringify(compliance));
    }

    /**
     * Vérifie si l'utilisateur est conforme RGPD
     */
    isGdprCompliant(): boolean {
        const compliance = localStorage.getItem('gdpr_compliance');
        if (!compliance) return false;

        try {
            const parsed = JSON.parse(compliance);
            return parsed.isCompliant === true;
        } catch {
            return false;
        }
    }

    /**
     * Obtient les informations de conformité RGPD
     */
    getGdprCompliance(): any {
        const compliance = localStorage.getItem('gdpr_compliance');
        if (!compliance) return null;

        try {
            return JSON.parse(compliance);
        } catch {
            return null;
        }
    }
}