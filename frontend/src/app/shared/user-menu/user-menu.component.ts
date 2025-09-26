import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuModule } from 'primeng/menu';
import { UserBadgeComponent } from '../user-badge/user-badge.component';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';
import { ClickOutsideDirective } from '../click-outside.directive';
import { ChildContextService } from '../../_children-context/_children-context/child-context.service';
import { UserValidationService } from '../../services/user-validation.service';

@Component({
    selector: 'app-user-menu',
    standalone:true,
    imports: [CommonModule, MenuModule, UserBadgeComponent, ClickOutsideDirective],
    templateUrl: './user-menu.component.html'
})
export class UserMenuComponent {
  visible = signal(false);

  constructor(
    private auth: AuthService, 
    private router: Router,
    private childContext: ChildContextService,
    public validationService: UserValidationService
  ) {}

  toggleMenu() {
    this.visible.update(v => !v);
  }

  goToAccount() {
    // Vérifier si l'utilisateur peut accéder à son compte
    if (this.validationService.isMenuItemDisabled('mon-compte')) {
      return; // Bloquer l'accès
    }
    this.router.navigate(['/mon-compte']);
  }

  goToProgress() {
    // Vérifier si l'utilisateur peut accéder à la progression
    if (this.validationService.isMenuItemDisabled('progression')) {
      alert('La progression sera bientôt disponible !');
      return; // Bloquer l'accès
    }
    this.router.navigate(['/progress/parent']);
  }

  goToMessaging() {
    // Vérifier si l'utilisateur peut accéder à la messagerie
    if (this.validationService.isMenuItemDisabled('messagerie')) {
      alert('La messagerie sera bientôt disponible !');
      return; // Bloquer l'accès
    }
    this.router.navigate(['/messaging']);
  }

  goToZoom() {
    // Vérifier si l'utilisateur peut accéder aux cours en ligne
    if (this.validationService.isMenuItemDisabled('mon-compte')) {
      return; // Bloquer l'accès si le compte n'est pas validé
    }
    this.router.navigate(['/mon-compte'], { queryParams: { section: 'zoom' } });
  }

  logout() {
    this.auth.logout();
    this.childContext.clearAll(); // Nettoyer le contexte des enfants
    this.router.navigate(['/']);
  }

  get fullName() {
    return this.auth.fullName();
  }

  close() {
    this.visible.set(false);
  }
}
