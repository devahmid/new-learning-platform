import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import {
  REGISTRATIONS_CLOSED,
  REGISTRATIONS_CLOSED_MESSAGE,
} from '../../../config/registration.config';

@Component({
    selector: 'app-hero',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './hero.component.html',
    styleUrl: './hero.component.scss'
})
export class HeroComponent {
  readonly registrationsClosed = REGISTRATIONS_CLOSED;
  readonly registrationsClosedMessage = REGISTRATIONS_CLOSED_MESSAGE;

    constructor(private router: Router) { }

    navigate(path: string) {
        this.router.navigate([path]);
    }
}
