import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { catchError, throwError } from 'rxjs';

export const authErrorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      console.log('🔍 authErrorInterceptor - Erreur interceptée:', error.status, error.url);
      
      // Vérifier si c'est une erreur d'authentification (401 Unauthorized)
      if (error.status === 401) {
        console.warn('🚨 Token expiré ou invalide, déconnexion automatique');
        
        try {
          // Injecter les services dans le catchError
          const router = inject(Router);
          const authService = inject(AuthService);
          
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
        } catch (injectError) {
          console.error('❌ Erreur lors de l\'injection des services:', injectError);
          
          // Fallback: redirection manuelle
          localStorage.removeItem('token');
          window.location.href = '/login?reason=token-expired&message=Votre session a expiré. Veuillez vous reconnecter.';
        }
        
        return throwError(() => error);
      }
      
      // Pour les autres erreurs, les laisser passer
      return throwError(() => error);
    })
  );
};
