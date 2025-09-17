import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { getDecodedToken } from './utils/jwt.utils';

export const authGuard: CanActivateFn = (route, state) => {
  const token = localStorage.getItem('token');

  if (token) {
    return true;
  } else {
    const router = inject(Router);
    router.navigate(['/login']);
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