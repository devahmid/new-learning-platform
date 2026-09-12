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
    <!-- Popup avis (arrivée sur le site) -->
    <div *ngIf="showSurveyPopup" class="fixed inset-0 z-50 bg-black/50 px-4 py-10 flex items-center justify-center">
      <div class="w-full max-w-xl rounded-[28px] bg-white shadow-[0_30px_90px_rgba(15,23,42,.25)] border border-slate-200 overflow-hidden">
        <div class="p-6 md:p-8">
          <div class="flex items-start justify-between gap-4">
            <div>
              <div class="inline-flex rounded-full bg-emerald-100 px-4 py-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
                Votre avis compte
              </div>
              <h2 class="mt-3 text-2xl md:text-3xl font-black text-slate-900 leading-tight">
                Aidez-nous à améliorer le site
              </h2>
              <p class="mt-3 text-sm md:text-base text-slate-600">
                1 minute, anonyme, et très utile pour améliorer l’expérience pour le plus grand nombre.
              </p>
            </div>
            <button (click)="closeSurveyPopup()" class="h-10 w-10 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 transition">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <button (click)="closeSurveyPopup()" class="rounded-full border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 hover:border-emerald-300 hover:text-emerald-700 transition">
              Plus tard
            </button>
            <a routerLink="/avis" (click)="closeSurveyPopup()" class="rounded-full bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700 transition no-underline text-center">
              Donner mon avis
            </a>
          </div>
        </div>
      </div>
    </div>

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

  showSurveyPopup = false;

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/cours']);
      return;
    }

    try {
      const key = 'darsi_survey_popup_v1';
      const alreadyClosed = localStorage.getItem(key) === '1';
      if (!alreadyClosed) {
        // small delay to avoid being too aggressive on initial render
        setTimeout(() => (this.showSurveyPopup = true), 700);
      }
    } catch {
      // ignore storage issues
      setTimeout(() => (this.showSurveyPopup = true), 700);
    }
  }

  closeSurveyPopup() {
    this.showSurveyPopup = false;
    try {
      localStorage.setItem('darsi_survey_popup_v1', '1');
    } catch {
      // ignore
    }
  }
}
