import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ConsentService } from '../../../services/consent.service';
import { AuthService } from '../../../auth/auth.service';
import { GoogleAnalyticsService } from '../../../services/google-analytics.service';

@Component({
    selector: 'app-gdpr-compliance',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white shadow-xl rounded-lg overflow-hidden">
          
          <!-- Header -->
          <div class="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 text-white">
            <div class="flex items-center">
              <span class="text-3xl mr-4">🛡️</span>
              <div>
                <h1 class="text-2xl font-bold">Mise à jour importante - Protection de vos données</h1>
                <p class="text-blue-100 mt-1">Conformité au Règlement Général sur la Protection des Données (RGPD)</p>
              </div>
            </div>
          </div>

          <div class="p-8">
            <!-- Message d'accueil personnalisé -->
            <div class="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-8">
              <div class="flex">
                <div class="flex-shrink-0">
                  <span class="text-2xl">👋</span>
                </div>
                <div class="ml-3">
                  <h2 class="text-lg font-semibold text-yellow-800">
                    Bonjour {{ userFullName }},
                  </h2>
                  <p class="text-yellow-700 mt-1">
                    Nous devons mettre à jour nos pratiques de protection des données. Votre confiance est importante pour nous.
                  </p>
                </div>
              </div>
            </div>

            <!-- Pourquoi cette démarche -->
            <section class="mb-8">
              <h2 class="text-xl font-bold text-gray-900 mb-4">🇪🇺 Pourquoi cette mise à jour ?</h2>
              <div class="bg-gray-50 rounded-lg p-6">
                <p class="text-gray-700 mb-4">
                  Le <strong>RGPD (Règlement Général sur la Protection des Données)</strong> renforce vos droits sur vos données personnelles. 
                  Bien que vous soyez déjà inscrit sur notre plateforme, nous devons maintenant obtenir votre <strong>consentement explicite</strong> 
                  pour certains traitements de données.
                </p>
                <div class="grid md:grid-cols-2 gap-4 mt-4">
                  <div class="flex items-start">
                    <span class="text-green-500 mr-2">✅</span>
                    <span class="text-sm">Vos données sont déjà protégées et sécurisées</span>
                  </div>
                  <div class="flex items-start">
                    <span class="text-green-500 mr-2">✅</span>
                    <span class="text-sm">Aucun changement dans nos services</span>
                  </div>
                  <div class="flex items-start">
                    <span class="text-green-500 mr-2">✅</span>
                    <span class="text-sm">Plus de transparence sur l'utilisation de vos données</span>
                  </div>
                  <div class="flex items-start">
                    <span class="text-green-500 mr-2">✅</span>
                    <span class="text-sm">Contrôle renforcé sur vos préférences</span>
                  </div>
                </div>
              </div>
            </section>

            <!-- Vos données actuelles -->
            <section class="mb-8">
              <h2 class="text-xl font-bold text-gray-900 mb-4">📊 Vos données sur notre plateforme</h2>
              
              <div class="space-y-4">
                <div class="border border-green-200 bg-green-50 p-4 rounded-lg">
                  <h3 class="font-semibold text-green-800 mb-2">✅ Données nécessaires au service (toujours autorisées)</h3>
                  <ul class="text-sm text-green-700 space-y-1">
                    <li>• Informations de compte : {{ userEmail }}</li>
                    <li>• Progression dans vos cours</li>
                    <li>• Résultats de quiz et évaluations</li>
                    <li>• Historique des paiements (si applicable)</li>
                    <li>• Communications de support</li>
                  </ul>
                  <p class="text-xs text-green-600 mt-2">
                    <strong>Base légale :</strong> Exécution du contrat - Ces données sont indispensables pour vous fournir nos services.
                  </p>
                </div>

                <div class="border border-blue-200 bg-blue-50 p-4 rounded-lg">
                  <h3 class="font-semibold text-blue-800 mb-2">🔍 Données d'analyse (consentement requis)</h3>
                  <ul class="text-sm text-blue-700 space-y-1">
                    <li>• Statistiques d'utilisation de la plateforme</li>
                    <li>• Temps passé sur les cours</li>
                    <li>• Analyse des parcours d'apprentissage</li>
                    <li>• Données techniques (navigateur, résolution d'écran)</li>
                    <li>• Adresse IP (anonymisée)</li>
                  </ul>
                  <p class="text-xs text-blue-600 mt-2">
                    <strong>Finalité :</strong> Améliorer notre plateforme et personnaliser votre expérience d'apprentissage.
                  </p>
                </div>

                <div class="border border-purple-200 bg-purple-50 p-4 rounded-lg">
                  <h3 class="font-semibold text-purple-800 mb-2">🎯 Données marketing (consentement requis)</h3>
                  <ul class="text-sm text-purple-700 space-y-1">
                    <li>• Recommandations de cours personnalisées</li>
                    <li>• Communications commerciales ciblées</li>
                    <li>• Offres spéciales adaptées à votre profil</li>
                    <li>• Retargeting publicitaire</li>
                  </ul>
                  <p class="text-xs text-purple-600 mt-2">
                    <strong>Finalité :</strong> Vous proposer du contenu éducatif pertinent et des offres adaptées.
                  </p>
                </div>
              </div>
            </section>

            <!-- Vos nouveaux droits -->
            <section class="mb-8">
              <h2 class="text-xl font-bold text-gray-900 mb-4">⚖️ Vos droits RGPD</h2>
              
              <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div class="border p-4 rounded-lg text-center">
                  <span class="text-2xl mb-2 block">👁️</span>
                  <h4 class="font-semibold mb-1">Droit d'accès</h4>
                  <p class="text-xs text-gray-600">Voir toutes vos données</p>
                </div>
                <div class="border p-4 rounded-lg text-center">
                  <span class="text-2xl mb-2 block">✏️</span>
                  <h4 class="font-semibold mb-1">Droit de rectification</h4>
                  <p class="text-xs text-gray-600">Corriger vos informations</p>
                </div>
                <div class="border p-4 rounded-lg text-center">
                  <span class="text-2xl mb-2 block">🗑️</span>
                  <h4 class="font-semibold mb-1">Droit à l'effacement</h4>
                  <p class="text-xs text-gray-600">Supprimer vos données</p>
                </div>
                <div class="border p-4 rounded-lg text-center">
                  <span class="text-2xl mb-2 block">📦</span>
                  <h4 class="font-semibold mb-1">Droit à la portabilité</h4>
                  <p class="text-xs text-gray-600">Récupérer vos données</p>
                </div>
                <div class="border p-4 rounded-lg text-center">
                  <span class="text-2xl mb-2 block">⏸️</span>
                  <h4 class="font-semibold mb-1">Droit de limitation</h4>
                  <p class="text-xs text-gray-600">Limiter le traitement</p>
                </div>
                <div class="border p-4 rounded-lg text-center">
                  <span class="text-2xl mb-2 block">🚫</span>
                  <h4 class="font-semibold mb-1">Droit d'opposition</h4>
                  <p class="text-xs text-gray-600">Refuser le traitement</p>
                </div>
              </div>
              
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <p class="text-blue-800 text-sm">
                  <strong>📧 Exercer vos droits :</strong> Contactez-nous à 
                  <a href="mailto:dpo@centre-culturel-olivier.com" class="underline">dpo&#64;centre-culturel-olivier.com</a> 
                  ou directement depuis votre compte dans la section "Mes données personnelles".
                </p>
              </div>
            </section>

            <!-- Formulaire de consentement -->
            <section class="mb-8">
              <h2 class="text-xl font-bold text-gray-900 mb-4">✋ Vos choix pour l'avenir</h2>
              
              <form (ngSubmit)="submitConsent()" class="space-y-6">
                
                <!-- Consentement Analytics -->
                <div class="border border-gray-200 rounded-lg p-6">
                  <div class="flex items-start">
                    <input 
                      type="checkbox" 
                      id="analytics" 
                      [(ngModel)]="consents.analytics"
                      name="analytics"
                      class="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
                    <div class="ml-3 flex-1">
                      <label for="analytics" class="font-semibold text-gray-900 cursor-pointer">
                        📊 Analyser l'utilisation de la plateforme
                      </label>
                      <p class="text-sm text-gray-600 mt-1">
                        Nous aide à comprendre comment vous utilisez notre plateforme pour l'améliorer. 
                        Données anonymisées, aucune identification personnelle transmise à des tiers.
                      </p>
                      <div class="mt-2 text-xs text-gray-500">
                        <strong>Exemples :</strong> Temps passé sur un cours, parcours d'apprentissage, erreurs techniques
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Consentement Fonctionnel -->
                <div class="border border-gray-200 rounded-lg p-6">
                  <div class="flex items-start">
                    <input 
                      type="checkbox" 
                      id="functional" 
                      [(ngModel)]="consents.functional"
                      name="functional"
                      class="mt-1 h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500">
                    <div class="ml-3 flex-1">
                      <label for="functional" class="font-semibold text-gray-900 cursor-pointer">
                        ⚙️ Mémoriser mes préférences
                      </label>
                      <p class="text-sm text-gray-600 mt-1">
                        Sauvegarde vos préférences d'affichage, thème, dernière position dans un cours, etc. 
                        Améliore votre confort d'utilisation.
                      </p>
                      <div class="mt-2 text-xs text-gray-500">
                        <strong>Exemples :</strong> Thème sombre/clair, taille de police, préférences d'accessibilité
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Consentement Marketing -->
                <div class="border border-gray-200 rounded-lg p-6">
                  <div class="flex items-start">
                    <input 
                      type="checkbox" 
                      id="marketing" 
                      [(ngModel)]="consents.marketing"
                      name="marketing"
                      class="mt-1 h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500">
                    <div class="ml-3 flex-1">
                      <label for="marketing" class="font-semibold text-gray-900 cursor-pointer">
                        🎯 Recevoir du contenu personnalisé
                      </label>
                      <p class="text-sm text-gray-600 mt-1">
                        Recommandations de cours adaptées à votre niveau, offres spéciales, communications marketing ciblées. 
                        Vous pouvez vous désabonner à tout moment.
                      </p>
                      <div class="mt-2 text-xs text-gray-500">
                        <strong>Exemples :</strong> Cours recommandés, newsletters personnalisées, offres de réduction
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Acceptation des politiques -->
                <div class="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <div class="flex items-start">
                    <input 
                      type="checkbox" 
                      id="policies" 
                      [(ngModel)]="consents.policies"
                      name="policies"
                      required
                      class="mt-1 h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500">
                    <div class="ml-3 flex-1">
                      <label for="policies" class="font-semibold text-gray-900 cursor-pointer">
                        📋 J'accepte les politiques mises à jour <span class="text-red-500">*</span>
                      </label>
                      <p class="text-sm text-gray-600 mt-1">
                        J'ai pris connaissance et j'accepte la 
                        <a routerLink="/privacy-policy" class="text-blue-600 underline" target="_blank">Politique de confidentialité</a> 
                        et la 
                        <a routerLink="/cookie-policy" class="text-blue-600 underline" target="_blank">Politique des cookies</a> 
                        mises à jour.
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Rappels importants -->
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 class="font-semibold text-blue-800 mb-2">ℹ️ Important à retenir</h4>
                  <ul class="text-sm text-blue-700 space-y-1">
                    <li>• Vous pouvez modifier ces choix à tout moment dans votre compte</li>
                    <li>• Refuser ces options n'affecte pas l'accès à vos cours</li>
                    <li>• Vos données d'apprentissage restent toujours protégées</li>
                    <li>• En cas de question, notre équipe est à votre disposition</li>
                  </ul>
                </div>

                <!-- Boutons d'action -->
                <div class="flex flex-col sm:flex-row gap-4 pt-6 border-t">
                  <button 
                    type="submit"
                    [disabled]="!consents.policies"
                    class="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors">
                    ✅ Confirmer mes choix
                  </button>
                  
                  <button 
                    type="button"
                    (click)="acceptMinimal()"
                    class="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                    🔒 Minimal (essentiels seulement)
                  </button>
                </div>

                <p class="text-xs text-gray-500 text-center">
                  En confirmant, vous régularisez votre statut RGPD. Un email de confirmation vous sera envoyé.
                </p>
              </form>
            </section>

            <!-- Contact et support -->
            <section class="bg-gray-50 rounded-lg p-6">
              <h3 class="font-semibold text-gray-900 mb-3">🤝 Besoin d'aide ?</h3>
              <p class="text-sm text-gray-600 mb-4">
                Notre équipe est là pour répondre à toutes vos questions sur cette mise à jour.
              </p>
              <div class="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>📧 Email :</strong> <a href="mailto:support@centre-culturel-olivier.com" class="text-blue-600 underline">support&#64;centre-culturel-olivier.com</a>
                </div>
                <div>
                  <strong>📞 Téléphone :</strong> +33 (0)X XX XX XX XX
                </div>
                <div>
                  <strong>🔒 DPO :</strong> <a href="mailto:dpo@centre-culturel-olivier.com" class="text-blue-600 underline">dpo&#64;centre-culturel-olivier.com</a>
                </div>
                <div>
                  <strong>💬 Chat :</strong> Disponible dans votre compte
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    input[type="checkbox"]:focus {
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    
    .border {
      transition: border-color 0.2s ease;
    }
    
    .border:hover {
      border-color: #9ca3af;
    }
    
    input[type="checkbox"]:checked + div label {
      color: #059669;
    }
  `]
})
export class GdprComplianceComponent implements OnInit {
    userFullName: string = '';
    userEmail: string = '';

    consents = {
        analytics: false,
        functional: false,
        marketing: false,
        policies: false
    };

    constructor(
        private consentService: ConsentService,
        private authService: AuthService,
        private analytics: GoogleAnalyticsService
    ) { }

    ngOnInit() {
        // Récupérer les informations utilisateur
        this.userFullName = this.authService.fullName() || 'Utilisateur';
        this.userEmail = this.authService.email() || '';

        // Tracker cette page importante
        this.analytics.trackEvent('gdpr_compliance_view', {
            category: 'legal_compliance',
            label: 'existing_user_gdpr_update'
        });
    }

  async submitConsent() {
    if (!this.consents.policies) {
      alert('Vous devez accepter les politiques mises à jour pour continuer.');
      return;
    }

    try {
      // Récupérer l'ID utilisateur depuis le service d'authentification
      const userId = this.authService.id();
      if (!userId) {
        alert('❌ Erreur : Utilisateur non connecté. Veuillez vous reconnecter.');
        return;
      }

      // Préparer les données de consentement pour l'API
      const consentData = {
        analytics: this.consents.analytics,
        functional: this.consents.functional,
        marketing: this.consents.marketing,
        essential: true // Toujours requis
      };

      // Sauvegarder le consentement en base de données ET localStorage
      const success = await this.consentService.saveUserConsent(userId, consentData);

      if (!success) {
        alert('❌ Erreur lors de l\'enregistrement de vos préférences. Veuillez réessayer.');
        return;
      }

      // Marquer comme conforme RGPD
      this.consentService.markGdprCompliant();

      // Tracker la completion (seulement si analytics autorisé)
      if (this.consents.analytics) {
        this.analytics.trackEvent('gdpr_compliance_completed', {
          category: 'legal_compliance',
          analytics_consent: this.consents.analytics,
          functional_consent: this.consents.functional,
          marketing_consent: this.consents.marketing
        });
      }

      // Rediriger vers le dashboard
      alert('✅ Merci ! Vos préférences ont été enregistrées avec succès. Vous allez être redirigé vers votre tableau de bord.');
      window.location.href = '/dashboard';

    } catch (error) {
      console.error('Erreur lors de la sauvegarde du consentement:', error);
      alert('❌ Erreur technique lors de l\'enregistrement. Veuillez réessayer ou contacter le support.');
    }
  }

    acceptMinimal() {
        this.consents.analytics = false;
        this.consents.functional = false;
        this.consents.marketing = false;
        this.consents.policies = true;

        this.submitConsent();
    }
}