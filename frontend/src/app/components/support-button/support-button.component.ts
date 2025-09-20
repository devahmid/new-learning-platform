import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-support-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Bouton de support flottant - visible seulement si connecté -->
    <div *ngIf="isLoggedIn()" class="fixed bottom-6 right-6 z-50">
      <button 
        (click)="toggleSupportMenu()"
        class="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
        </svg>
        <span class="sr-only">Support</span>
      </button>

      <!-- Menu de support -->
      <div *ngIf="showSupportMenu" 
           class="absolute bottom-16 right-0 w-80 bg-white rounded-lg shadow-xl border border-gray-200 p-4 animate-in slide-in-from-bottom-2 duration-200">
        
        <!-- Header -->
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Support & Aide</h3>
          <button (click)="toggleSupportMenu()" class="text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Options de contact -->
        <div class="space-y-3">
          <!-- Contact rapide -->
          <button 
            (click)="openContactPage()"
            class="w-full flex items-center p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
            </div>
            <div>
              <div class="font-medium text-gray-900">Contactez-nous</div>
              <div class="text-sm text-gray-500">Formulaire de contact complet</div>
            </div>
          </button>

          <!-- Email direct -->
          <a 
            href="mailto:centre.culturel.olivier@gmail.com?subject=Support technique"
            class="w-full flex items-center p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
            <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
              <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
            </div>
            <div>
              <div class="font-medium text-gray-900">Email direct</div>
              <div class="text-sm text-gray-500">centre.culturel.olivier&#64;gmail.com</div>
            </div>
          </a>

          <!-- FAQ -->
          <button 
            (click)="scrollToFAQ()"
            class="w-full flex items-center p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
            <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
              <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div>
              <div class="font-medium text-gray-900">FAQ</div>
              <div class="text-sm text-gray-500">Questions fréquemment posées</div>
            </div>
          </button>

          <!-- Cours Zoom -->
          <button 
            (click)="joinZoomClass()"
            class="w-full flex items-center p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
            <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
              <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
              </svg>
            </div>
            <div>
              <div class="font-medium text-gray-900">Cours en ligne</div>
              <div class="text-sm text-gray-500">Rejoindre Zoom</div>
            </div>
          </button>
        </div>

        <!-- Footer -->
        <div class="mt-4 pt-4 border-t border-gray-200">
          <p class="text-xs text-gray-500 text-center">
            Réponse sous 24-48h
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-in {
      animation: slideInFromBottom 0.2s ease-out;
    }
    
    @keyframes slideInFromBottom {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class SupportButtonComponent implements OnInit {
  showSupportMenu = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {}

  isLoggedIn() {
    return this.authService.isLoggedIn();
  }

  toggleSupportMenu() {
    this.showSupportMenu = !this.showSupportMenu;
  }

  openContactPage() {
    this.router.navigate(['/contact']);
    this.showSupportMenu = false;
  }

  scrollToFAQ() {
    // Scroll vers la section FAQ de la page contact
    this.router.navigate(['/contact']).then(() => {
      setTimeout(() => {
        const faqElement = document.getElementById('faq-section');
        if (faqElement) {
          faqElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    });
    this.showSupportMenu = false;
  }

  joinZoomClass() {
    const zoomUrl = 'https://us02web.zoom.us/j/2432586827?pwd=RkpwaVhlcElXWjQxZmt6UkI5SmRiQT09';
    window.open(zoomUrl, '_blank');
    this.showSupportMenu = false;
  }
}
