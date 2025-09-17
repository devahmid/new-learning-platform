import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Injectable({ providedIn: 'root' })
export class AutoLogoutService {
  private timeout: any;
  private readonly inactivityTime = 15 * 60 * 1000;
  private readonly checkInterval = 30 * 1000;
  constructor(private router: Router, private ngZone: NgZone, private auth: AuthService) {
    this.initListener();
    this.startTokenCheck();
  }

  private initListener() {
    ['click', 'mousemove', 'keydown', 'scroll', 'touchstart'].forEach(event => {
      window.addEventListener(event, () => this.resetTimer());
    });
    this.resetTimer();
  }

  private resetTimer() {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => this.logout('inactivité'), this.inactivityTime);
  }

  private startTokenCheck() {
    this.ngZone.runOutsideAngular(() => {
      setInterval(() => {
        const token = localStorage.getItem('token');
        if (!token) return;
        const payload = this.decodeToken(token);
        const now = Math.floor(Date.now() / 1000);
        if (payload?.exp && payload.exp < now) {
          this.ngZone.run(() => this.logout('token expiré'));
        }
      }, this.checkInterval);
    });
  }

  private decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  }

  private logout(reason: string) {
    this.auth.logout();
    console.warn(`Déconnecté pour cause de ${reason}`);
    this.router.navigate(['/']);
  }
}
