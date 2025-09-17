import { Component, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';

@Component({
    selector: 'app-landing-header',
    standalone:true,
    imports: [CommonModule, RouterModule],
    templateUrl: './landing-header.component.html',
    styleUrls: ['./landing-header.component.scss']
})
export class LandingHeaderComponent {
  menuOpen = false;
  isLoggedIn = signal(false);

  constructor(private authService: AuthService) {
    effect(() => {
      this.isLoggedIn.set(this.authService.isLoggedIn());
    });
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
}
  

