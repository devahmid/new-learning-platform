import { Component, effect, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { HeaderComponent } from './pages/home/header/header.component';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth/auth.service';
import { LoaderComponent } from './shared/loader/loader.component';
import { LoaderService } from './shared/loader.service';
// import { AutoLogoutService } from './core/services/auto-logout.service'; // Désactivé pour éviter les déconnexions intempestives

import { ChildSelectionModalComponent } from './shared/child-selection-modal/child-selection-modal.component';
import { SupportButtonComponent } from './components/support-button/support-button.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    ToastModule,
    LoaderComponent,

    ChildSelectionModalComponent,
    SupportButtonComponent,
    HeaderComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  items: any[] = [];
  userRole: string | null = null;
  isLoggedIn: boolean = false;
  userFullName: string | null = null;
  loader = inject(LoaderService);

  get isLoading() {
    return this.loader.loading();
  }

  constructor(
    private router: Router,
    private authService: AuthService
    // private autoLogoutService: AutoLogoutService // Désactivé pour éviter les déconnexions intempestives
  ) {
    effect(() => {
      this.isLoggedIn = this.authService.isLoggedIn();
      this.userFullName = this.authService.fullName();
      this.userRole = this.authService.role();
      this.buildMenu();
    });
  }

  ngOnInit(): void {
    // Initialisation
  }

  logClick(menuItem: string) {
  }

  logout() {
    localStorage.removeItem('token');
    location.href = '/login';
  }

  buildMenu() {
    this.items = [];

    if (!this.isLoggedIn) {
      this.items = [
        { label: 'Accueil', icon: 'pi pi-home', routerLink: '/' },
        { label: 'Connexion', icon: 'pi pi-sign-in', routerLink: '/login' },
        {
          label: "S'inscrire",
          icon: 'pi pi-user-plus',
          routerLink: '/register',
        },
        {
          label: 'Réinscription',
          icon: 'pi pi-refresh',
          routerLink: '/reinscription',
        },
      ];
      return;
    }

    if (this.isLoggedIn) {
      this.items.push(
        { label: 'Cours', icon: 'pi pi-book', routerLink: '/cours' },
        { label: 'Quiz', icon: 'pi pi-question', routerLink: '/quiz/1' },
        { label: 'Chat', icon: 'pi pi-comments', routerLink: '/chat' },
        { label: 'Réinscription', icon: 'pi pi-refresh', routerLink: '/reinscription' }
      );

      if (this.userRole === 'admin') {
        this.items.push({
          label: 'Admin',
          icon: 'pi pi-shield',
          routerLink: '/admin',
        });
      }
    }
  }

  getInitials(name: string | null): string {
    if (!name) return '';
    const parts = name.trim().split(' ');
    const initials = parts
      .map((part) => part.charAt(0).toUpperCase())
      .slice(0, 2);
    return initials.join('');
  }
}
