import {
  Component,
  effect,
  HostListener,
  inject,
  OnInit,
  signal,
  ChangeDetectorRef,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../auth/auth.service';
import { UserMenuComponent } from '../../../shared/user-menu/user-menu.component';
import { ChildContextService } from '../../../_children-context/_children-context/child-context.service';
import { User } from '../../../models/user.model';
import { ChildSelectionModalService } from '../../../shared/child-selection-modal/child-selection-modal.service';
import { UserValidationService } from '../../../services/user-validation.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    UserMenuComponent,
  ],
  templateUrl: './header.component.html',
  styles: [
    `
      /* Styles pour le burger menu stylé */
      .burger-menu {
        position: relative;
        overflow: hidden;
      }

      .burger-menu:hover {
        transform: scale(1.05);
        box-shadow: 0 4px 15px rgba(16, 185, 129, 0.2);
      }

      .burger-menu span {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      /* Animation d'ouverture du burger */
      .burger-menu.open span:nth-child(1) {
        transform: rotate(45deg) translate(6px, 6px);
      }

      .burger-menu.open span:nth-child(2) {
        opacity: 0;
        transform: scale(0);
      }

      .burger-menu.open span:nth-child(3) {
        transform: rotate(-45deg) translate(6px, -6px);
      }

      /* Effet de hover avec rotation subtile */
      .burger-menu:hover span:nth-child(1) {
        transform: translateX(-2px);
      }

      .burger-menu:hover span:nth-child(3) {
        transform: translateX(2px);
      }
    `,
  ],
})
export class HeaderComponent implements OnInit {
  isLoggedIn = signal(false);
  role = signal<string | null>(null);
  fullName = signal<string | null>(null);
  menuOpen = signal(false);
  isDarkMode = signal(false);
  
  // Variable booléenne classique pour le menu
  menuOpenBoolean = false;

  childContext = inject(ChildContextService);
  modalService = inject(ChildSelectionModalService);
  validationService = inject(UserValidationService);

  selectedChild = this.childContext.selectedChild;
  children = this.childContext.children;

  constructor(
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    effect(
      () => {
        this.isLoggedIn.set(this.auth.isLoggedIn());
        this.role.set(this.auth.role());
        this.fullName.set(this.auth.fullName());
      },
      { allowSignalWrites: true }
    );
  }

  ngOnInit() {
    if (this.auth.isLoggedIn()) {
      this.childContext.loadChildren();
      // Forcer la mise à jour du statut de validation
      this.validationService.forceUpdateStatus();
      
      // Vérifier périodiquement le statut de validation (toutes les 30 secondes)
      setInterval(() => {
        if (this.auth.isLoggedIn()) {
          this.validationService.forceUpdateStatus();
        }
      }, 30000);
    }
    // Initialiser le thème
    this.initTheme();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const clickedInside =
      target.closest('.burger-menu') || target.closest('.mobile-menu');
      
    if (!clickedInside && this.menuOpenBoolean) {
      this.menuOpenBoolean = false;
      this.menuOpen.set(false);
    }
  }

  toggleMenu(event: MouseEvent) {
    event.stopPropagation();
    this.menuOpenBoolean = !this.menuOpenBoolean;
    this.menuOpen.set(this.menuOpenBoolean);
  }

  navigate(path: string) {
    this.router.navigate([path]);
    this.menuOpenBoolean = false;
    this.menuOpen.set(false);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
    this.menuOpenBoolean = false;
    this.menuOpen.set(false);
  }

  // Mode Focus
  isFocusMode = signal(false);
  focusTimer = signal(0);
  focusInterval: any = null;
  showFocusModal = signal(false);

  // Méthodes pour le mode focus
  openFocusModal() {
    this.showFocusModal.set(true);
  }

  closeFocusModal() {
    this.showFocusModal.set(false);
  }

  startFocusSession(minutes: number) {
    this.isFocusMode.set(true);
    this.focusTimer.set(minutes * 60);
    this.closeFocusModal();

    this.focusInterval = setInterval(() => {
      this.focusTimer.update((timer) => {
        if (timer <= 0) {
          this.stopFocusSession();
          return 0;
        }
        return timer - 1;
      });
    }, 1000);
  }

  stopFocusSession() {
    this.isFocusMode.set(false);
    this.focusTimer.set(0);
    if (this.focusInterval) {
      clearInterval(this.focusInterval);
      this.focusInterval = null;
    }
  }

  get focusTimeFormatted(): string {
    const minutes = Math.floor(this.focusTimer() / 60);
    const seconds = this.focusTimer() % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  }

  // Gestion du thème sombre
  toggleDarkMode(): void {
    this.isDarkMode.update((mode) => !mode);

    // Appliquer le thème au document
    if (this.isDarkMode()) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }

    // Sauvegarder la préférence
    localStorage.setItem('theme', this.isDarkMode() ? 'dark' : 'light');
  }

  // Initialiser le thème
  private initTheme(): void {
    const savedTheme = localStorage.getItem('theme') || 'light';
    this.isDarkMode.set(savedTheme === 'dark');

    if (this.isDarkMode()) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }

  // Méthodes pour le sélecteur d'enfant
  openChildSelectionModal() {
    this.modalService.openModalAutomatically();
  }

  getChildInitials(): string {
    const child = this.selectedChild();
    if (!child) return '?';
    return `${child.firstName?.charAt(0) || ''}${child.lastName?.charAt(0) || ''}`.toUpperCase();
  }

  getSelectedChildName(): string {
    const child = this.selectedChild();
    return child
      ? `${child.firstName} ${child.lastName}`
      : 'Aucun enfant sélectionné';
  }

  getLevelName(levelId?: any): string {
    console.log('[HEADER] Classe:', levelId);
    switch (levelId.id) {
      case 1:
        return 'Débutant';
      case 2:
        return 'Intermédiaire';
      case 3:
        return 'Avancé';
      default:
        return 'Non défini';
    }
  }
}
