import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { getDecodedToken } from './utils/jwt.utils';

export const authGuard: CanActivateFn = (route, state) => {
  const token = localStorage.getItem('token');
  const router = inject(Router);

  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  // Vérifier si le token est valide et non expiré
  try {
    const payload = getDecodedToken();
    if (!payload || !payload.exp) {
      console.warn('Token invalide, déconnexion');
      localStorage.removeItem('token');
      router.navigate(['/login'], { 
        queryParams: { 
          reason: 'invalid-token',
          message: 'Token invalide. Veuillez vous reconnecter.' 
        }
      });
      return false;
    }

    // Vérifier si le token est expiré
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      console.warn('Token expiré, déconnexion');
      localStorage.removeItem('token');
      router.navigate(['/login'], { 
        queryParams: { 
          reason: 'token-expired',
          message: 'Votre session a expiré. Veuillez vous reconnecter.' 
        }
      });
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erreur lors de la vérification du token:', error);
    localStorage.removeItem('token');
    router.navigate(['/login'], { 
      queryParams: { 
        reason: 'token-error',
        message: 'Erreur de session. Veuillez vous reconnecter.' 
      }
    });
    return false;
  }
};

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const decoded = getDecodedToken();

  if (decoded && decoded.role === 'admin') {
    return true;
  }

  router.navigate(['/login']); 
  return false;
};