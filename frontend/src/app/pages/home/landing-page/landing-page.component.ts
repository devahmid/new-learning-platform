import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';


import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { HeroComponent } from '../hero/hero.component';
import { FeaturesComponent } from '../features/features.component';
import { AgeGroupsComponent } from '../age-groups/age-groups.component';
import { TestimonialsComponent } from '../testimonials/testimonials.component';
import { CtaComponent } from '../cta/cta.component';
import { FooterComponent } from '../footer/footer.component';
import { AuthService } from '../../../auth/auth.service';
import { LandingHeaderComponent } from '../landing-header/landing-header.component';

@Component({
    selector: 'app-landing-page',
    standalone:true,
    imports: [
        CommonModule,
        LandingHeaderComponent,
        HeaderComponent,
        HeroComponent,
        FeaturesComponent,
        AgeGroupsComponent,
        TestimonialsComponent,
        CtaComponent,
        FooterComponent
    ],
    template: `
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
  private auth = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/cours']);
    }
  }
}
