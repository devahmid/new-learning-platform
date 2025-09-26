import { Injectable, signal } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';

export type UserValidationStatus = 'pending' | 'approved' | 'rejected' | 'unknown';

@Injectable({
  providedIn: 'root'
})
export class UserValidationService {
  private _validationStatus = signal<UserValidationStatus>('unknown');
  private _isLoading = signal<boolean>(false);

  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) {
    // Initialiser le statut au démarrage (sans requêtes automatiques)
    this.initValidationStatus();
  }

  get validationStatus() {
    return this._validationStatus.asReadonly();
  }

  get isLoading() {
    return this._isLoading.asReadonly();
  }

  isPending() {
    return this._validationStatus() === 'pending';
  }

  isApproved() {
    return this._validationStatus() === 'approved';
  }

  isRejected() {
    return this._validationStatus() === 'rejected';
  }

  canAccessContent() {
    return this._validationStatus() === 'approved';
  }

  private initValidationStatus() {
    // Vérifier d'abord si l'utilisateur est connecté
    if (!this.authService.isLoggedIn()) {
      this._validationStatus.set('unknown');
      return;
    }

    // Utiliser le statut depuis le profil utilisateur déjà chargé (sans requête API)
    this.initStatusAfterLogin();
  }

  refreshValidationStatus(): void {
    this._isLoading.set(true);
    
    this.http.get<any>('https://centre-culturel-olivier.fr/api/users/me')
      .pipe(
        map(user => user.status as UserValidationStatus),
        catchError(error => {
          console.error('Erreur lors de la vérification du statut:', error);
          // L'intercepteur authErrorInterceptor va gérer les erreurs 401
          // Ici on gère seulement les autres cas
          if (error.status === 403) {
            if (error.error?.status === 'pending') {
              return of('pending' as UserValidationStatus);
            } else if (error.error?.status === 'rejected') {
              return of('rejected' as UserValidationStatus);
            } else if (error.error?.message?.includes('en attente de validation')) {
              return of('pending' as UserValidationStatus);
            } else if (error.error?.message?.includes('rejeté')) {
              return of('rejected' as UserValidationStatus);
            }
          }
          return of('unknown' as UserValidationStatus);
        })
      )
      .subscribe(status => {
        this._validationStatus.set(status);
        this._isLoading.set(false);
      });
  }

  // Méthode pour vérifier si un élément de menu doit être désactivé
  isMenuItemDisabled(menuItem: string): boolean {
    const status = this._validationStatus();
    
    // Tous les éléments de menu sont désactivés pour les utilisateurs en attente ou rejetés
    // Sauf les éléments publics comme login, register, etc.
    const publicMenuItems = [
      'login',
      'register',
      'connexion',
      'inscription',
      'accueil',
      'home',
      'contact',
      'about',
      'aide',
      'help'
    ];

    // Forcer le blocage de la progression et de la messagerie pour tous les utilisateurs
    const alwaysDisabledItems = [
      'progression',
      'messagerie',
      'progress',
      'messaging'
    ];

    if (alwaysDisabledItems.includes(menuItem.toLowerCase())) {
      return true; // Toujours bloquer ces éléments
    }

    if (status === 'pending' || status === 'rejected') {
      // Bloquer tout sauf les éléments publics
      return !publicMenuItems.includes(menuItem.toLowerCase());
    }

    return false;
  }

  // Méthode pour obtenir le message d'état
  getStatusMessage(): string {
    const status = this._validationStatus();
    
    switch (status) {
      case 'pending':
        return 'Votre compte est en attente de validation';
      case 'rejected':
        return 'Votre compte a été rejeté';
      case 'approved':
        return 'Compte validé';
      default:
        return 'Statut inconnu';
    }
  }

  // Méthode pour obtenir la classe CSS du statut
  getStatusClass(): string {
    const status = this._validationStatus();
    
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      case 'approved':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }

  // Méthode pour forcer la mise à jour du statut
  async forceUpdateStatus(): Promise<void> {
    await this.refreshValidationStatus();
  }

  // Méthode pour forcer la mise à jour immédiate (sans loading)
  async forceUpdateStatusImmediate(): Promise<void> {
    try {
      const response = await fetch('https://centre-culturel-olivier.fr/api/users/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        const user = await response.json();
        this._validationStatus.set(user.status as UserValidationStatus);
      } else if (response.status === 403) {
        // Vérifier le contenu de la réponse 403 pour déterminer le statut
        try {
          const errorData = await response.json();
          if (errorData.status === 'pending') {
            this._validationStatus.set('pending');
          } else if (errorData.status === 'rejected') {
            this._validationStatus.set('rejected');
          } else {
            // Si pas de statut spécifique dans la réponse 403, 
            // vérifier le statut depuis le profil utilisateur déjà chargé
            const currentUser = this.authService.getCurrentUser();
            currentUser.subscribe(user => {
              if (user && user.status) {
                this._validationStatus.set(user.status as UserValidationStatus);
              } else {
                // Pour un nouvel utilisateur, assume 'pending' par défaut
                this._validationStatus.set('pending');
              }
            });
          }
        } catch {
          this._validationStatus.set('pending'); // Si on ne peut pas parser la réponse
        }
      } else {
        this._validationStatus.set('unknown');
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du statut:', error);
      this._validationStatus.set('unknown');
    }
  }

  // Méthode pour initialiser le statut après connexion
  initStatusAfterLogin(): void {
    // Attendre que le profil utilisateur soit chargé
    const currentUser = this.authService.getCurrentUser();
    currentUser.subscribe(user => {
      if (user && user.status) {
        this._validationStatus.set(user.status as UserValidationStatus);
      } else {
        // Si pas de statut disponible, assume 'pending' pour un nouvel utilisateur
        this._validationStatus.set('pending');
      }
    });
  }

  // 🚫 Désactiver complètement les requêtes automatiques
  public disableAutoRefresh(): void {
    // Cette méthode peut être appelée pour désactiver les requêtes automatiques
    // Le service utilise maintenant uniquement les données du profil utilisateur
  }
}
