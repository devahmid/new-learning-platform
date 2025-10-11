import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { catchError, throwError } from 'rxjs';

export const authErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      console.log('🔍 authErrorInterceptor - Erreur interceptée:', error.status, error.url);
      
      // Vérifier si c'est une erreur d'authentification (401 Unauthorized)
      if (error.status === 401) {
        // Ne pas intercepter les erreurs 401 qui viennent de la page de connexion
        // car ce sont des erreurs de mauvais identifiants, pas des tokens expirés
        const isLoginRequest = error.url && (
          error.url.includes('/auth/login') || 
          error.url.includes('/login') ||
          error.url.includes('login') ||
          error.url.endsWith('/auth/login') ||
          error.url.endsWith('/login')
        );
        
        
        if (isLoginRequest) {
          console.log('🔍 Erreur 401 de connexion détectée, laisser passer pour gestion dans le composant');
          return throwError(() => error);
        }
        
        console.warn('🚨 Token expiré ou invalide, déconnexion automatique');
        
        // Déconnecter l'utilisateur
        authService.logout();
        
        // Rediriger vers la page de connexion
        router.navigate(['/login'], { 
          queryParams: { 
            reason: 'token-expired',
            message: 'Votre session a expiré. Veuillez vous reconnecter.' 
          }
        });
        
        console.log('✅ Redirection vers /login effectuée');
        
        return throwError(() => error);
      }
      
      // Pour les autres erreurs, les laisser passer
      return throwError(() => error);
    })
  );
};
