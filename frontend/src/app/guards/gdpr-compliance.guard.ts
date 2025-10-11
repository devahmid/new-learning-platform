import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { ConsentService } from '../services/consent.service';
import { AuthService } from '../auth/auth.service';

@Injectable({
    providedIn: 'root'
})
export class GdprComplianceGuard implements CanActivate {

    constructor(
        private consentService: ConsentService,
        private authService: AuthService,
        private router: Router
    ) { }

    canActivate(): boolean {
        // Vérifier si l'utilisateur est connecté
        if (!this.authService.isLoggedIn()) {
            return true; // Laisser passer les utilisateurs non connectés
        }

        // Vérifier si l'utilisateur a déjà validé la conformité RGPD
        if (this.consentService.isGdprCompliant()) {
            return true;
        }

        // Vérifier si l'utilisateur a déjà donné un consentement moderne
        if (this.consentService.hasConsentBeenGiven()) {
            // Marquer comme conforme si un consentement moderne existe
            this.consentService.markGdprCompliant();
            return true;
        }

        // Rediriger vers la page de conformité RGPD
        this.router.navigate(['/gdpr-compliance']);
        return false;
    }
}