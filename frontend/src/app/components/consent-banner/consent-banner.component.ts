import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConsentService } from '../../services/consent.service';

@Component({
  selector: 'app-consent-banner',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="showBanner" class="consent-banner fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 shadow-lg z-50">
      <div class="container mx-auto max-w-6xl">
        <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          
          <!-- Message principal -->
          <div class="flex-1">
            <h3 class="text-lg font-semibold mb-2">🍪 Respect de votre vie privée</h3>
            <p class="text-sm text-gray-300 mb-2">
              Nous utilisons des cookies et technologies similaires pour améliorer votre expérience d'apprentissage, 
              analyser le trafic et personnaliser le contenu. Vous pouvez choisir quels cookies accepter.
            </p>
            <div class="text-xs text-gray-400">
              <a href="/privacy-policy" class="underline hover:text-white" target="_blank">Politique de confidentialité</a> | 
              <a href="/cookie-policy" class="underline hover:text-white ml-2" target="_blank">Politique des cookies</a>
            </div>
          </div>

          <!-- Boutons d'action -->
          <div class="flex flex-col sm:flex-row gap-2 min-w-fit">
            
            <!-- Boutons principaux -->
            <div class="flex gap-2">
              <button 
                (click)="rejectAll()"
                class="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm font-medium transition-colors">
                Refuser tout
              </button>
              
              <button 
                (click)="acceptAnalyticsOnly()"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm font-medium transition-colors">
                Analytics seulement
              </button>
              
              <button 
                (click)="acceptAll()"
                class="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded text-sm font-medium transition-colors">
                Tout accepter
              </button>
            </div>

            <!-- Bouton personnaliser -->
            <button 
              (click)="toggleCustomize()"
              class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm border border-gray-500 transition-colors">
              {{ showCustomize ? 'Masquer' : 'Personnaliser' }}
            </button>
          </div>
        </div>

        <!-- Panel de personnalisation -->
        <div *ngIf="showCustomize" class="mt-4 p-4 bg-gray-800 rounded-lg">
          <h4 class="text-md font-semibold mb-3">Personnaliser vos préférences</h4>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            <!-- Cookies essentiels -->
            <div class="flex items-center justify-between p-3 bg-gray-700 rounded">
              <div>
                <div class="font-medium text-sm">Cookies essentiels</div>
                <div class="text-xs text-gray-300">Requis pour le fonctionnement</div>
              </div>
              <div class="text-green-400 text-sm font-medium">Toujours actif</div>
            </div>

            <!-- Analytics -->
            <div class="flex items-center justify-between p-3 bg-gray-700 rounded">
              <div>
                <div class="font-medium text-sm">Analytics</div>
                <div class="text-xs text-gray-300">Mesure d'audience anonyme</div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  [(ngModel)]="customConsent.analytics"
                  class="sr-only peer">
                <div class="w-9 h-5 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <!-- Fonctionnalités -->
            <div class="flex items-center justify-between p-3 bg-gray-700 rounded">
              <div>
                <div class="font-medium text-sm">Fonctionnalités</div>
                <div class="text-xs text-gray-300">Préférences et paramètres</div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  [(ngModel)]="customConsent.functionality"
                  class="sr-only peer">
                <div class="w-9 h-5 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <!-- Personnalisation -->
            <div class="flex items-center justify-between p-3 bg-gray-700 rounded">
              <div>
                <div class="font-medium text-sm">Personnalisation</div>
                <div class="text-xs text-gray-300">Contenu adapté</div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  [(ngModel)]="customConsent.personalization"
                  class="sr-only peer">
                <div class="w-9 h-5 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <!-- Publicité -->
            <div class="flex items-center justify-between p-3 bg-gray-700 rounded">
              <div>
                <div class="font-medium text-sm">Publicité</div>
                <div class="text-xs text-gray-300">Annonces personnalisées</div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  [(ngModel)]="customConsent.advertising"
                  class="sr-only peer">
                <div class="w-9 h-5 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          <!-- Bouton sauvegarder personnalisé -->
          <div class="mt-4 text-center">
            <button 
              (click)="saveCustomConsent()"
              class="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium transition-colors">
              Sauvegarder mes préférences
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .consent-banner {
      animation: slideUp 0.3s ease-out;
    }
    
    @keyframes slideUp {
      from {
        transform: translateY(100%);
      }
      to {
        transform: translateY(0);
      }
    }

    /* Styles pour les toggles */
    input:checked + div {
      background-color: #2563eb;
    }
  `]
})
export class ConsentBannerComponent implements OnInit {
  showBanner = false;
  showCustomize = false;
  
  customConsent = {
    analytics: false,
    functionality: false,
    personalization: false,
    advertising: false
  };

  constructor(private consentService: ConsentService) {}

  ngOnInit() {
    this.showBanner = this.consentService.shouldShowConsentBanner();
  }

  acceptAll() {
    this.consentService.acceptAllCookies();
    this.hideBanner();
  }

  rejectAll() {
    this.consentService.rejectAllCookies();
    this.hideBanner();
  }

  acceptAnalyticsOnly() {
    this.consentService.acceptAnalyticsOnly();
    this.hideBanner();
  }

  toggleCustomize() {
    this.showCustomize = !this.showCustomize;
  }

  saveCustomConsent() {
    this.consentService.setCustomConsent({
      analytics_storage: this.customConsent.analytics ? 'granted' : 'denied',
      functionality_storage: this.customConsent.functionality ? 'granted' : 'denied',
      personalization_storage: this.customConsent.personalization ? 'granted' : 'denied',
      ad_storage: this.customConsent.advertising ? 'granted' : 'denied'
    });
    this.hideBanner();
  }

  private hideBanner() {
    this.showBanner = false;
  }
}