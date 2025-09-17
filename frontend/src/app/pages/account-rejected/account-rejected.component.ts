import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { ChildContextService } from '../../_children-context/_children-context/child-context.service';

@Component({
  selector: 'app-account-rejected',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div class="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <!-- Icône d'erreur -->
        <div class="mb-6">
          <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
        </div>

        <!-- Titre -->
        <h1 class="text-2xl font-bold text-gray-900 mb-4">
          Compte rejeté
        </h1>

        <!-- Message principal -->
        <div class="mb-6">
          <p class="text-gray-600 mb-4">
            Votre compte a été rejeté par un administrateur.
          </p>
          
          <!-- Raison du rejet si disponible -->
          <div *ngIf="rejectionReason" class="bg-red-50 rounded-lg p-4 mb-4">
            <h3 class="font-semibold text-red-900 mb-2">Raison du rejet :</h3>
            <p class="text-sm text-red-700">{{ rejectionReason }}</p>
          </div>
          
          <p class="text-sm text-gray-500">
            Si vous pensez qu'il s'agit d'une erreur, contactez-nous pour plus d'informations.
          </p>
        </div>

        <!-- Informations de contact -->
        <div class="bg-blue-50 rounded-lg p-4 mb-6">
          <h3 class="font-semibold text-blue-900 mb-2">Besoin d'aide ?</h3>
          <p class="text-sm text-blue-700 mb-2">
            Contactez-nous pour plus d'informations :
          </p>
          <p class="text-sm text-blue-700">
            <a href="mailto:admin&#64;centre-culturel-olivier.fr" class="underline">admin&#64;centre-culturel-olivier.fr</a>
          </p>
        </div>

        <!-- Actions -->
        <div class="space-y-3">
          <button 
            (click)="logout()" 
            class="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors">
            Se déconnecter
          </button>
          
          <button 
            (click)="goToRegister()" 
            class="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors">
            Créer un nouveau compte
          </button>
        </div>
      </div>
    </div>
  `
})
export class AccountRejectedComponent implements OnInit {
  rejectionReason: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private childContext: ChildContextService
  ) {}

  ngOnInit() {
    this.getRejectionReason();
  }

  private async getRejectionReason() {
    try {
      const user = await this.authService.getCurrentUser().toPromise();
      if (user && user.rejection_reason) {
        this.rejectionReason = user.rejection_reason;
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de la raison du rejet:', error);
    }
  }

  logout() {
    this.authService.logout();
    this.childContext.clearAll(); // Nettoyer le contexte des enfants
    this.router.navigate(['/login']);
  }

  goToRegister() {
    this.authService.logout();
    this.childContext.clearAll(); // Nettoyer le contexte des enfants
    this.router.navigate(['/register']);
  }
}
