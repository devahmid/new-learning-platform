import { Component, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';
import {
  REGISTRATIONS_CLOSED,
  REGISTRATIONS_CLOSED_MESSAGE,
} from '../../../config/registration.config';

@Component({
    selector: 'app-landing-header',
    standalone:true,
    imports: [CommonModule, RouterModule],
    templateUrl: './landing-header.component.html',
    styleUrls: ['./landing-header.component.scss']
})
export class LandingHeaderComponent {
  readonly registrationsClosed = REGISTRATIONS_CLOSED;
  readonly registrationsClosedMessage = REGISTRATIONS_CLOSED_MESSAGE;

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
  

