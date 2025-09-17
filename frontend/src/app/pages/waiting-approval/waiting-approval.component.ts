import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { ChildContextService } from '../../_children-context/_children-context/child-context.service';

@Component({
  selector: 'app-waiting-approval',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div class="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <!-- Icône d'attente -->
        <div class="mb-6">
          <div class="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-10 h-10 text-yellow-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        </div>

        <!-- Titre -->
        <h1 class="text-2xl font-bold text-gray-900 mb-4">
          Compte en attente de validation
        </h1>

        <!-- Message principal -->
        <div class="mb-6">
          <p class="text-gray-600 mb-4">
            Votre compte a été créé avec succès ! Il est actuellement en attente de validation par un administrateur.
          </p>
          <p class="text-sm text-gray-500">
            Vous recevrez un email de confirmation une fois votre compte approuvé.
          </p>
        </div>

        <!-- Informations de contact -->
        <div class="bg-blue-50 rounded-lg p-4 mb-6">
          <h3 class="font-semibold text-blue-900 mb-2">Besoin d'aide ?</h3>
          <p class="text-sm text-blue-700">
            Contactez-nous à <a href="mailto:admin&#64;centre-culturel-olivier.fr" class="underline">admin&#64;centre-culturel-olivier.fr</a>
          </p>
        </div>

        <!-- Actions -->
        <div class="space-y-3">
          <button 
            (click)="refreshStatus()" 
            [disabled]="isRefreshing"
            class="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            <span *ngIf="!isRefreshing">Vérifier le statut</span>
            <span *ngIf="isRefreshing" class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Vérification...
            </span>
          </button>
          
          <button 
            (click)="logout()" 
            class="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors">
            Se déconnecter
          </button>
        </div>

        <!-- Message de statut -->
        <div *ngIf="statusMessage" class="mt-4 p-3 rounded-lg" 
             [class]="statusMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
          {{ statusMessage.text }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
  `]
})
export class WaitingApprovalComponent implements OnInit {
  isRefreshing = false;
  statusMessage: { type: 'success' | 'error', text: string } | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private childContext: ChildContextService
  ) {}

  ngOnInit() {
    // Ne pas vérifier automatiquement le statut au chargement
    // L'utilisateur doit cliquer sur "Vérifier le statut" manuellement
  }

  async refreshStatus() {
    this.isRefreshing = true;
    this.statusMessage = null;
    
    try {
      await this.checkUserStatus();
    } catch (error) {
      this.statusMessage = {
        type: 'error',
        text: 'Erreur lors de la vérification du statut'
      };
    } finally {
      this.isRefreshing = false;
    }
  }

  private async checkUserStatus() {
    try {
      // Faire un appel API pour vérifier le statut réel
      const response = await fetch('https://centre-culturel-olivier.fr/api/users/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        const user = await response.json();
        
        if (user.status === 'approved') {
          this.statusMessage = {
            type: 'success',
            text: 'Votre compte a été approuvé ! Redirection...'
          };
          
          // Rediriger vers le dashboard après 2 secondes
          setTimeout(() => {
            this.router.navigate(['/no-children-info']);
          }, 2000);
        } else if (user.status === 'rejected') {
          this.statusMessage = {
            type: 'error',
            text: 'Votre compte a été rejeté. Contactez l\'administrateur.'
          };
        } else {
          this.statusMessage = {
            type: 'error',
            text: 'Votre compte est toujours en attente de validation.'
          };
        }
      } else if (response.status === 403) {
        // L'utilisateur est toujours bloqué
        this.statusMessage = {
          type: 'error',
          text: 'Votre compte est toujours en attente de validation par un administrateur.'
        };
      } else {
        this.statusMessage = {
          type: 'error',
          text: 'Erreur lors de la vérification du statut.'
        };
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du statut:', error);
      this.statusMessage = {
        type: 'error',
        text: 'Erreur de connexion. Vérifiez votre connexion internet.'
      };
    }
  }

  logout() {
    this.authService.logout();
    this.childContext.clearAll(); // Nettoyer le contexte des enfants
    this.router.navigate(['/login']);
  }
}
