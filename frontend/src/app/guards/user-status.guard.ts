import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { Observable, map, take } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserStatusGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.authService.getCurrentUser().pipe(
      take(1),
      map(user => {
        if (!user) {
          this.router.navigate(['/login']);
          return false;
        }

        if (user.status === 'pending') {
          this.router.navigate(['/waiting-approval']);
          return false;
        }

        if (user.status === 'rejected') {
          this.router.navigate(['/account-rejected']);
          return false;
        }

        // Utilisateur approuvé
        return true;
      })
    );
  }
}
