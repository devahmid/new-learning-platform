import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';


import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeroComponent } from '../hero/hero.component';
import { AuthService } from '../../../auth/auth.service';
import {
  REGISTRATIONS_CLOSED,
  REGISTRATIONS_CLOSED_MESSAGE,
} from '../../../config/registration.config';

@Component({
    selector: 'app-landing-page',
    standalone:true,
    imports: [
        CommonModule,
      RouterModule,
        HeroComponent,
    ],
    template: `
    <section class="mx-auto max-w-6xl px-4 pt-24 md:pt-28">
      <div *ngIf="registrationsClosed" class="rounded-[28px] border border-amber-200 bg-gradient-to-r from-amber-50 via-white to-amber-50 p-5 md:p-6 shadow-[0_20px_60px_rgba(15,23,42,.10)]">
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div class="flex items-start gap-4">
            <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white text-2xl shadow-lg shadow-amber-500/20">
              !
            </div>
            <div>
              <div class="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-amber-800">
                Inscriptions closes
              </div>
              <h2 class="mt-2 text-2xl md:text-3xl font-black text-slate-900 leading-tight">
                Les inscriptions et réinscriptions sont temporairement closes
              </h2>
              <p class="mt-2 text-sm md:text-base text-slate-600 max-w-3xl">
                {{ registrationsClosedMessage }}
              </p>
            </div>
          </div>
          <a routerLink="/contact" class="inline-flex shrink-0 items-center gap-3 rounded-2xl bg-amber-600 px-5 py-3 text-white font-semibold shadow-lg no-underline hover:bg-amber-700 transition">
            <span>Nous contacter</span>
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>

      <a *ngIf="!registrationsClosed" routerLink="/reinscription" class="block rounded-[28px] border border-amber-200 bg-gradient-to-r from-amber-50 via-white to-emerald-50 p-5 md:p-6 shadow-[0_20px_60px_rgba(15,23,42,.10)] hover:shadow-[0_25px_70px_rgba(15,23,42,.14)] transition-all duration-300 no-underline">
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div class="flex items-start gap-4">
            <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white text-2xl shadow-lg shadow-emerald-600/20">
              ↻
            </div>
            <div>
              <div class="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-amber-700">
                Réinscription cours 2026/2027
              </div>
              <h2 class="mt-2 text-2xl md:text-3xl font-black text-slate-900 leading-tight">
                Vous avez déjà un compte ? Validez l'inscription de vos enfants pour la prochaine année.
              </h2>
              <p class="mt-2 text-sm md:text-base text-slate-600 max-w-3xl">
                Connectez-vous pour récupérer automatiquement vos informations parent et la liste de vos enfants déjà connus, puis confirmer leur réinscription aux cours.
              </p>
              <p class="mt-2 text-sm">
                <a [routerLink]="['/reinscription']" [queryParams]="{mode: 'new'}" class="text-emerald-700 underline">Inscription ici</a>
              </p>
            </div>
          </div>
          <div class="flex shrink-0 items-center gap-3 rounded-2xl bg-slate-900 px-5 py-3 text-white font-semibold shadow-lg">
            <span>Ouvrir la réinscription</span>
            <span aria-hidden="true">→</span>
          </div>
        </div>
      </a>
    </section>
    <!-- <app-header></app-header> -->
    <app-hero></app-hero>
    <!-- <app-features></app-features> -->
    <!-- <app-age-groups></app-age-groups> -->
    <!-- <app-testimonials></app-testimonials> -->
    <!-- <app-cta></app-cta> -->
    <!-- <app-footer></app-footer> -->
  `
})
export class LandingPageComponent implements OnInit {
  readonly registrationsClosed = REGISTRATIONS_CLOSED;
  readonly registrationsClosedMessage = REGISTRATIONS_CLOSED_MESSAGE;

  private auth = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/cours']);
    }
  }
}
