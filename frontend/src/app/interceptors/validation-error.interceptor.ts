import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const validationErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Vérifier si c'est une erreur 403 avec un message de validation
      if (error.status === 403 && error.error?.message) {
        const message = error.error.message;
        
        // Vérifier si c'est une erreur de validation d'utilisateur
        if (message.includes('en attente de validation') || 
            message.includes('Votre compte est en attente')) {
          // Rediriger vers la page d'attente
          router.navigate(['/waiting-approval']);
          return throwError(() => error);
        }
        
        if (message.includes('rejeté') || 
            message.includes('Votre compte a été rejeté')) {
          // Rediriger vers la page de compte rejeté
          router.navigate(['/account-rejected']);
          return throwError(() => error);
        }
      }
      
      // Pour les autres erreurs, les laisser passer
      return throwError(() => error);
    })
  );
};
