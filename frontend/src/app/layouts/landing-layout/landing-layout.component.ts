import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { LandingHeaderComponent } from '../../pages/home/landing-header/landing-header.component';
import { FooterComponent } from '../../pages/home/footer/footer.component';
import { HeaderComponent } from '../../pages/home/header/header.component';

@Component({
    selector: 'app-landing-layout',
    standalone:true,
    imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent],
    templateUrl: './landing-layout.component.html'
})
export class LandingLayoutComponent {}
