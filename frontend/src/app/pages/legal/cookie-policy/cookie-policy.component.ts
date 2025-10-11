import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ConsentService } from '../../../services/consent.service';

@Component({
    selector: 'app-cookie-policy',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <div class="min-h-screen bg-gray-50 py-12">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white shadow-lg rounded-lg p-8">
          
          <!-- Header -->
          <div class="text-center mb-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-4">🍪 Politique des Cookies</h1>
            <p class="text-gray-600">Centre Culturel - Plateforme d'Apprentissage en Ligne</p>
            <p class="text-sm text-gray-500 mt-2">Dernière mise à jour : {{ lastUpdate }}</p>
          </div>

          <!-- Gestion rapide des cookies -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 class="text-xl font-semibold text-blue-800 mb-4">⚙️ Gérer mes cookies maintenant</h2>
            <p class="text-blue-700 mb-4">Vous pouvez modifier vos préférences de cookies à tout moment :</p>
            <div class="flex flex-wrap gap-3">
              <button (click)="acceptAll()" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium">
                ✅ Tout accepter
              </button>
              <button (click)="acceptAnalyticsOnly()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium">
                📊 Analytics seulement
              </button>
              <button (click)="rejectAll()" class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded font-medium">
                ❌ Tout refuser
              </button>
            </div>
            <p class="text-sm text-blue-600 mt-2">Statut actuel : <span class="font-medium">{{ currentConsentStatus }}</span></p>
          </div>

          <!-- Contenu principal -->
          <div class="prose max-w-none">
            
            <!-- Introduction -->
            <section class="mb-8">
              <h2 class="text-2xl font-bold mb-4">Qu'est-ce qu'un cookie ?</h2>
              <p class="mb-4">
                Un cookie est un petit fichier texte stocké sur votre appareil (ordinateur, smartphone, tablette) 
                lorsque vous visitez un site web. Les cookies permettent au site de mémoriser vos actions et préférences 
                (comme votre identifiant de connexion, langue, taille de police et autres préférences d'affichage) 
                pendant une certaine période.
              </p>
              <p class="mb-4">
                Notre plateforme d'apprentissage utilise différents types de cookies pour vous offrir la meilleure expérience possible.
              </p>
            </section>

            <!-- Types de cookies -->
            <section class="mb-8">
              <h2 class="text-2xl font-bold mb-4">Types de cookies que nous utilisons</h2>
              
              <div class="space-y-6">
                <!-- Cookies essentiels -->
                <div class="border border-green-200 bg-green-50 p-6 rounded-lg">
                  <div class="flex items-center mb-4">
                    <span class="text-2xl mr-3">🔒</span>
                    <h3 class="text-xl font-semibold text-green-800">Cookies essentiels (toujours actifs)</h3>
                  </div>
                  <p class="text-green-700 mb-4">
                    Ces cookies sont indispensables au fonctionnement de notre plateforme. Ils ne peuvent pas être désactivés.
                  </p>
                  <div class="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 class="font-semibold mb-2">Authentification</h4>
                      <ul class="text-sm space-y-1">
                        <li>• Maintien de votre session de connexion</li>
                        <li>• Sécurisation de votre compte</li>
                        <li>• Protection contre les attaques CSRF</li>
                      </ul>
                    </div>
                    <div>
                      <h4 class="font-semibold mb-2">Fonctionnement</h4>
                      <ul class="text-sm space-y-1">
                        <li>• Équilibrage de charge des serveurs</li>
                        <li>• Préférences de langue</li>
                        <li>• Panier d'achat (si applicable)</li>
                      </ul>
                    </div>
                  </div>
                  <p class="text-xs text-green-600 mt-4">Base légale : Intérêt légitime (fonctionnement du service)</p>
                </div>

                <!-- Cookies analytics -->
                <div class="border border-blue-200 bg-blue-50 p-6 rounded-lg">
                  <div class="flex items-center mb-4">
                    <span class="text-2xl mr-3">📊</span>
                    <h3 class="text-xl font-semibold text-blue-800">Cookies d'analyse et de performance</h3>
                    <span class="ml-auto px-3 py-1 bg-blue-200 text-blue-800 text-xs rounded-full">{{ analyticsStatus }}</span>
                  </div>
                  <p class="text-blue-700 mb-4">
                    Ces cookies nous aident à comprendre comment vous utilisez notre plateforme pour l'améliorer.
                  </p>
                  <div class="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 class="font-semibold mb-2">Google Analytics 4</h4>
                      <ul class="text-sm space-y-1">
                        <li>• Nombre de visiteurs et pages vues</li>
                        <li>• Temps passé sur la plateforme</li>
                        <li>• Parcours d'apprentissage</li>
                        <li>• Sources de trafic</li>
                      </ul>
                    </div>
                    <div>
                      <h4 class="font-semibold mb-2">Données collectées</h4>
                      <ul class="text-sm space-y-1">
                        <li>• Progression dans les cours</li>
                        <li>• Résultats de quiz (anonymisés)</li>
                        <li>• Erreurs techniques</li>
                        <li>• Performance de l'application</li>
                      </ul>
                    </div>
                  </div>
                  <div class="bg-blue-100 p-3 rounded">
                    <p class="text-sm text-blue-800">
                      <strong>Protection :</strong> Les IP sont anonymisées et aucune donnée personnelle identifiable n'est transmise à Google.
                    </p>
                  </div>
                  <p class="text-xs text-blue-600 mt-4">Base légale : Consentement (RGPD)</p>
                </div>

                <!-- Cookies fonctionnels -->
                <div class="border border-purple-200 bg-purple-50 p-6 rounded-lg">
                  <div class="flex items-center mb-4">
                    <span class="text-2xl mr-3">⚙️</span>
                    <h3 class="text-xl font-semibold text-purple-800">Cookies fonctionnels</h3>
                    <span class="ml-auto px-3 py-1 bg-purple-200 text-purple-800 text-xs rounded-full">{{ functionalStatus }}</span>
                  </div>
                  <p class="text-purple-700 mb-4">
                    Ces cookies améliorent votre expérience en mémorisant vos préférences.
                  </p>
                  <div class="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 class="font-semibold mb-2">Préférences utilisateur</h4>
                      <ul class="text-sm space-y-1">
                        <li>• Thème sombre/clair</li>
                        <li>• Taille de police préférée</li>
                        <li>• Préférences d'accessibilité</li>
                        <li>• Dernière position dans un cours</li>
                      </ul>
                    </div>
                    <div>
                      <h4 class="font-semibold mb-2">Fonctionnalités avancées</h4>
                      <ul class="text-sm space-y-1">
                        <li>• Chat en direct</li>
                        <li>• Notifications push</li>
                        <li>• Contenu personnalisé</li>
                        <li>• Historique de navigation</li>
                      </ul>
                    </div>
                  </div>
                  <p class="text-xs text-purple-600 mt-4">Base légale : Consentement (RGPD)</p>
                </div>

                <!-- Cookies marketing -->
                <div class="border border-orange-200 bg-orange-50 p-6 rounded-lg">
                  <div class="flex items-center mb-4">
                    <span class="text-2xl mr-3">🎯</span>
                    <h3 class="text-xl font-semibold text-orange-800">Cookies marketing et publicitaires</h3>
                    <span class="ml-auto px-3 py-1 bg-orange-200 text-orange-800 text-xs rounded-full">{{ marketingStatus }}</span>
                  </div>
                  <p class="text-orange-700 mb-4">
                    Ces cookies permettent de vous proposer du contenu et des publicités pertinents.
                  </p>
                  <div class="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 class="font-semibold mb-2">Personnalisation</h4>
                      <ul class="text-sm space-y-1">
                        <li>• Cours recommandés</li>
                        <li>• Publicités ciblées</li>
                        <li>• Contenu adapté au niveau</li>
                        <li>• Offres personnalisées</li>
                      </ul>
                    </div>
                    <div>
                      <h4 class="font-semibold mb-2">Partenaires</h4>
                      <ul class="text-sm space-y-1">
                        <li>• Google Ads</li>
                        <li>• Facebook Pixel</li>
                        <li>• Réseaux publicitaires</li>
                        <li>• Plateformes de remarketing</li>
                      </ul>
                    </div>
                  </div>
                  <p class="text-xs text-orange-600 mt-4">Base légale : Consentement (RGPD)</p>
                </div>
              </div>
            </section>

            <!-- Durée de vie -->
            <section class="mb-8">
              <h2 class="text-2xl font-bold mb-4">⏰ Durée de vie des cookies</h2>
              
              <div class="overflow-x-auto">
                <table class="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr class="bg-gray-100">
                      <th class="border border-gray-300 px-4 py-2 text-left">Type de cookie</th>
                      <th class="border border-gray-300 px-4 py-2 text-left">Durée</th>
                      <th class="border border-gray-300 px-4 py-2 text-left">Suppression</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td class="border border-gray-300 px-4 py-2">Session (essentiels)</td>
                      <td class="border border-gray-300 px-4 py-2">Jusqu'à la fermeture du navigateur</td>
                      <td class="border border-gray-300 px-4 py-2">Automatique</td>
                    </tr>
                    <tr class="bg-gray-50">
                      <td class="border border-gray-300 px-4 py-2">Authentification</td>
                      <td class="border border-gray-300 px-4 py-2">30 jours</td>
                      <td class="border border-gray-300 px-4 py-2">Déconnexion manuelle</td>
                    </tr>
                    <tr>
                      <td class="border border-gray-300 px-4 py-2">Analytics (Google)</td>
                      <td class="border border-gray-300 px-4 py-2">26 mois maximum</td>
                      <td class="border border-gray-300 px-4 py-2">Gestion du consentement</td>
                    </tr>
                    <tr class="bg-gray-50">
                      <td class="border border-gray-300 px-4 py-2">Préférences utilisateur</td>
                      <td class="border border-gray-300 px-4 py-2">12 mois</td>
                      <td class="border border-gray-300 px-4 py-2">Paramètres du compte</td>
                    </tr>
                    <tr>
                      <td class="border border-gray-300 px-4 py-2">Marketing</td>
                      <td class="border border-gray-300 px-4 py-2">90 jours</td>
                      <td class="border border-gray-300 px-4 py-2">Gestion du consentement</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <!-- Gestion des cookies -->
            <section class="mb-8">
              <h2 class="text-2xl font-bold mb-4">🛠️ Comment gérer vos cookies</h2>
              
              <h3 class="text-lg font-semibold mb-3">Sur notre plateforme</h3>
              <div class="bg-gray-50 p-4 rounded-lg mb-4">
                <ol class="list-decimal list-inside space-y-2">
                  <li>Utilisez les boutons en haut de cette page pour un changement immédiat</li>
                  <li>Allez dans "Mon compte" → "Confidentialité et cookies"</li>
                  <li>Cliquez sur "Gérer les cookies" dans le footer de notre site</li>
                  <li>La bannière réapparaîtra si vous effacez vos cookies</li>
                </ol>
              </div>

              <h3 class="text-lg font-semibold mb-3">Dans votre navigateur</h3>
              <div class="grid md:grid-cols-2 gap-4">
                <div class="border p-4 rounded">
                  <h4 class="font-semibold text-blue-600 mb-2">🌐 Chrome</h4>
                  <p class="text-sm">Paramètres → Confidentialité et sécurité → Cookies et autres données de sites</p>
                </div>
                <div class="border p-4 rounded">
                  <h4 class="font-semibold text-orange-600 mb-2">🦊 Firefox</h4>
                  <p class="text-sm">Options → Vie privée et sécurité → Cookies et données de sites</p>
                </div>
                <div class="border p-4 rounded">
                  <h4 class="font-semibold text-blue-500 mb-2">🧭 Safari</h4>
                  <p class="text-sm">Préférences → Confidentialité → Gérer les données de sites web</p>
                </div>
                <div class="border p-4 rounded">
                  <h4 class="font-semibold text-blue-800 mb-2">🔷 Edge</h4>
                  <p class="text-sm">Paramètres → Cookies et autorisations de site → Cookies et données stockées</p>
                </div>
              </div>

              <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4">
                <p class="text-yellow-800">
                  <strong>⚠️ Attention :</strong> Bloquer tous les cookies peut affecter le fonctionnement de notre plateforme 
                  (impossibilité de se connecter, perte des préférences, etc.).
                </p>
              </div>
            </section>

            <!-- Technologies similaires -->
            <section class="mb-8">
              <h2 class="text-2xl font-bold mb-4">📱 Technologies similaires</h2>
              
              <p class="mb-4">En plus des cookies, nous utilisons d'autres technologies pour améliorer votre expérience :</p>
              
              <div class="space-y-4">
                <div class="border p-4 rounded">
                  <h4 class="font-semibold mb-2">📦 Local Storage / Session Storage</h4>
                  <p class="text-sm">Stockage local de données temporaires pour améliorer les performances</p>
                </div>
                <div class="border p-4 rounded">
                  <h4 class="font-semibold mb-2">🎯 Pixels de suivi</h4>
                  <p class="text-sm">Images invisibles pour mesurer l'engagement et les conversions</p>
                </div>
                <div class="border p-4 rounded">
                  <h4 class="font-semibold mb-2">🔍 Empreinte numérique</h4>
                  <p class="text-sm">Collecte d'informations techniques pour la sécurité et la prévention de la fraude</p>
                </div>
              </div>
            </section>

            <!-- Cookies tiers -->
            <section class="mb-8">
              <h2 class="text-2xl font-bold mb-4">🤝 Cookies de services tiers</h2>
              
              <p class="mb-4">Certains cookies sont déposés par des services tiers que nous utilisons :</p>
              
              <div class="overflow-x-auto">
                <table class="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr class="bg-gray-100">
                      <th class="border border-gray-300 px-4 py-2 text-left">Service</th>
                      <th class="border border-gray-300 px-4 py-2 text-left">Finalité</th>
                      <th class="border border-gray-300 px-4 py-2 text-left">Politique</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td class="border border-gray-300 px-4 py-2">Google Analytics</td>
                      <td class="border border-gray-300 px-4 py-2">Mesure d'audience</td>
                      <td class="border border-gray-300 px-4 py-2">
                        <a href="https://policies.google.com/privacy" class="text-blue-600 underline text-sm">
                          Politique Google
                        </a>
                      </td>
                    </tr>
                    <tr class="bg-gray-50">
                      <td class="border border-gray-300 px-4 py-2">PayPal</td>
                      <td class="border border-gray-300 px-4 py-2">Traitement des paiements</td>
                      <td class="border border-gray-300 px-4 py-2">
                        <a href="https://www.paypal.com/privacy" class="text-blue-600 underline text-sm">
                          Politique PayPal
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td class="border border-gray-300 px-4 py-2">Vimeo</td>
                      <td class="border border-gray-300 px-4 py-2">Lecteur vidéo</td>
                      <td class="border border-gray-300 px-4 py-2">
                        <a href="https://vimeo.com/privacy" class="text-blue-600 underline text-sm">
                          Politique Vimeo
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <!-- Contact -->
            <section class="mb-8">
              <h2 class="text-2xl font-bold mb-4">📞 Questions sur les cookies</h2>
              
              <p class="mb-4">Pour toute question concernant notre utilisation des cookies :</p>
              
              <div class="bg-gray-50 p-6 rounded-lg">
                <div class="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 class="font-semibold mb-2">📧 Contact technique</h4>
                    <p class="text-sm">cookies&#64;centre-culturel-olivier.com</p>
                  </div>
                  <div>
                    <h4 class="font-semibold mb-2">🔒 Délégué à la Protection des Données</h4>
                    <p class="text-sm">dpo&#64;centre-culturel-olivier.com</p>
                  </div>
                </div>
              </div>
            </section>

          </div>

          <!-- Actions rapides -->
          <div class="bg-gray-50 p-6 rounded-lg mt-8">
            <h3 class="text-lg font-semibold mb-4">⚡ Actions rapides</h3>
            <div class="flex flex-wrap gap-3">
              <button (click)="goBack()" class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded">
                ← Retour
              </button>
              <a routerLink="/privacy-policy" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded inline-block">
                📋 Politique de confidentialité
              </a>
              <button (click)="clearAllCookies()" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">
                🗑️ Effacer tous les cookies
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .prose h2 {
      color: #1f2937;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 0.5rem;
    }
    
    .prose h3 {
      color: #374151;
      margin-top: 1.5rem;
    }
    
    .prose a {
      color: #2563eb;
      text-decoration: underline;
    }
    
    .prose a:hover {
      color: #1d4ed8;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
    }
    
    th, td {
      text-align: left;
      padding: 0.75rem;
      border: 1px solid #d1d5db;
    }
    
    th {
      background-color: #f9fafb;
      font-weight: 600;
    }
  `]
})
export class CookiePolicyComponent {
    lastUpdate = '5 octobre 2025';

    constructor(private consentService: ConsentService) { }

    get currentConsentStatus(): string {
        if (!this.consentService.hasConsentBeenGiven()) {
            return 'Aucun consentement donné';
        }

        const consent = this.consentService.getSavedConsent();
        if (consent?.analytics_storage === 'granted' && consent?.ad_storage === 'granted') {
            return 'Tous les cookies acceptés';
        } else if (consent?.analytics_storage === 'granted') {
            return 'Analytics seulement';
        } else {
            return 'Cookies essentiels seulement';
        }
    }

    get analyticsStatus(): string {
        const consent = this.consentService.getSavedConsent();
        return consent?.analytics_storage === 'granted' ? 'Activé' : 'Désactivé';
    }

    get functionalStatus(): string {
        const consent = this.consentService.getSavedConsent();
        return consent?.functionality_storage === 'granted' ? 'Activé' : 'Désactivé';
    }

    get marketingStatus(): string {
        const consent = this.consentService.getSavedConsent();
        return consent?.ad_storage === 'granted' ? 'Activé' : 'Désactivé';
    }

    acceptAll() {
        this.consentService.acceptAllCookies();
        alert('✅ Tous les cookies ont été acceptés');
    }

    acceptAnalyticsOnly() {
        this.consentService.acceptAnalyticsOnly();
        alert('📊 Seuls les cookies d\'analyse ont été acceptés');
    }

    rejectAll() {
        this.consentService.rejectAllCookies();
        alert('❌ Tous les cookies non-essentiels ont été refusés');
    }

    clearAllCookies() {
        if (confirm('Êtes-vous sûr de vouloir effacer tous les cookies ? Vous serez déconnecté.')) {
            // Effacer tous les cookies
            document.cookie.split(";").forEach(function (c) {
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
            });

            // Effacer le localStorage
            localStorage.clear();

            // Effacer le sessionStorage
            sessionStorage.clear();

            alert('🗑️ Tous les cookies ont été effacés');

            // Recharger la page
            window.location.reload();
        }
    }

    goBack() {
        window.history.back();
    }
}