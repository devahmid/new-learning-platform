import {
  Component,
  inject,
  signal,
  computed,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChildContextService } from '../../_children-context/_children-context/child-context.service';
import { ParentService } from '../../_children-context/_children-context/parent.service';
import { User } from '../../models/user.model';
import { ChildSelectionModalService } from './child-selection-modal.service';
import { AuthService } from '../../auth/auth.service';
import { ChildStatsService } from '../../services/child-stats.service';

@Component({
  selector: 'app-child-selection-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './child-selection-modal.component.html',
  styleUrl: './child-selection-modal.component.scss',
})
export class ChildSelectionModalComponent implements OnInit, OnDestroy {
  private childContext = inject(ChildContextService);
  private parentService = inject(ParentService);
  private modalService = inject(ChildSelectionModalService);
  private authService = inject(AuthService);
  private childStatsService = inject(ChildStatsService);
  router = inject(Router);

  // État du modal
  isOpen = signal(false);
  isLoading = signal(false);
  children = signal<User[]>([]);
  selectedChild = this.childContext.selectedChild;
  childrenProgress = signal<Map<number, number>>(new Map());

  // État du drag and drop
  isDragging = false;
  dragOffset = { x: 0, y: 0 };
  modalPosition = { x: 0, y: 0 };

  // État du drag and drop pour le bouton
  isButtonDragging = false;
  buttonDragOffset = { x: 0, y: 0 };
  buttonPosition = { x: 0, y: 0 };

  // Computed pour l'affichage
  hasChildren = computed(() => this.children().length > 0);
  selectedChildName = computed(() => {
    const child = this.selectedChild();
    return child
      ? `${child.firstName} ${child.lastName}`
      : 'Aucun enfant sélectionné';
  });

  // Computed pour la visibilité du bouton (seulement si connecté)
  isUserLoggedIn = computed(() => this.authService.isLoggedIn());

  ngOnInit() {
    // Ne charger les enfants que si l'utilisateur est connecté
    if (this.authService.isLoggedIn()) {
      this.loadChildren();
    }
    // S'enregistrer dans le service
    this.modalService.registerModal(this);
    // Charger la position du bouton
    this.loadButtonPosition();
  }

  ngOnDestroy() {
    // Se désenregistrer du service
    this.modalService.unregisterModal();
  }

  async loadChildren() {
    // Ne charger les enfants que si l'utilisateur est connecté
    if (!this.authService.isLoggedIn()) {
      this.children.set([]);
      return;
    }

    try {
      this.isLoading.set(true);
      const children = await this.parentService
        .getChildrenOfLoggedInParent()
        .toPromise();
      this.children.set(children || []);
      
      // Charger les progressions pour chaque enfant
      if (children && children.length > 0) {
        await this.loadChildrenProgress(children);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des enfants:', error);
      this.children.set([]);
    } finally {
      this.isLoading.set(false);
    }
  }

  private async loadChildrenProgress(children: User[]) {
    const progressMap = new Map<number, number>();
    
    for (const child of children) {
      try {
        // Récupérer la vraie progression depuis l'API
        const stats = await this.childStatsService.getChildStats(child.id).toPromise();
        const progress = stats ? this.childStatsService.calculateProgress(stats) : 0;
        progressMap.set(child.id, progress);
      } catch (error) {
        console.error(`Erreur lors du chargement de la progression pour l'enfant ${child.id}:`, error);
        // Fallback vers une progression par défaut
        progressMap.set(child.id, 0);
      }
    }
    
    this.childrenProgress.set(progressMap);
  }

  openModal() {
    this.isOpen.set(true);
    // Recharger les enfants seulement si connecté
    if (this.authService.isLoggedIn()) {
      this.loadChildren();
    }
  }

  // Méthode pour ouvrir automatiquement le modal (appelée par le guard)
  openModalAutomatically() {
    this.isOpen.set(true);
    // Charger les enfants seulement si connecté
    if (this.authService.isLoggedIn()) {
      this.loadChildren();
    }
  }

  closeModal() {
    this.isOpen.set(false);
    // Réinitialiser la position quand le modal se ferme
    this.resetModalPosition();
  }

  selectChild(child: User) {
    this.childContext.setSelectedChild(child);
    this.saveToLocalStorage(child);
    this.closeModal();

    // Navigation intelligente
    this.navigateToAppropriatePage();
  }

  private saveToLocalStorage(child: User) {
    localStorage.setItem(
      'selectedChild',
      JSON.stringify({
        id: child.id,
        firstName: child.firstName,
        lastName: child.lastName,
        classe: child.classe,
      })
    );
  }

  private navigateToAppropriatePage() {
    const currentUrl = this.router.url;

    // Vérifier s'il y a des enfants disponibles
    if (!this.hasChildren()) {
      // Pas d'enfants → rediriger vers la page d'information
      this.router.navigate(['/no-children-info']);
      return;
    }

    // Si on est sur une page qui nécessite un enfant, rester sur la même page
    if (
      currentUrl.includes('/matières') ||
      currentUrl.includes('/cours') ||
      currentUrl.includes('/quiz')
    ) {
      // Recharger la page pour mettre à jour le contexte
      window.location.reload();
    } else {
      // Sinon, aller aux matières
      this.router.navigate(['/matières']);
    }
  }

  getChildInitials(child: User): string {
    return `${child.firstName?.charAt(0) || ''}${
      child.lastName?.charAt(0) || ''
    }`.toUpperCase();
  }

  getChildFullName(child: User): string {
    return `${child.firstName || ''} ${child.lastName || ''}`.trim();
  }

  getClasseBadgeClass(classe?: any): string {
    if (!classe) {
      return 'bg-gray-100 text-gray-800 border-gray-200';
    }
    
    // Utiliser la couleur définie dans l'objet classe si elle existe
    if (classe.color) {
      // Convertir la couleur hex en classes Tailwind appropriées
      return this.convertColorToTailwindClasses(classe.color);
    }
    
    // Fallback : utiliser l'ID de la classe pour déterminer la couleur
    const classeId = classe.id;
    
    // Logique de couleurs basée sur l'ID de classe
    if (classeId >= 1 && classeId <= 2) {
      return 'bg-green-100 text-green-800 border-green-200';
    } else if (classeId >= 3 && classeId <= 4) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    } else if (classeId >= 5 && classeId <= 6) {
      return 'bg-red-100 text-red-800 border-red-200';
    } else if (classeId >= 7 && classeId <= 8) {
      return 'bg-purple-100 text-purple-800 border-purple-200';
    } else if (classeId >= 9 && classeId <= 10) {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    } else if (classeId >= 11 && classeId <= 12) {
      return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    } else if (classeId >= 13 && classeId <= 14) {
      return 'bg-pink-100 text-pink-800 border-pink-200';
    } else {
      // Pour les IDs très élevés, utiliser une couleur basée sur le modulo
      const colorIndex = classeId % 6;
      const colors = [
        'bg-green-100 text-green-800 border-green-200',
        'bg-yellow-100 text-yellow-800 border-yellow-200',
        'bg-red-100 text-red-800 border-red-200',
        'bg-purple-100 text-purple-800 border-purple-200',
        'bg-blue-100 text-blue-800 border-blue-200',
        'bg-indigo-100 text-indigo-800 border-indigo-200'
      ];
      return colors[colorIndex];
    }
  }

  private convertColorToTailwindClasses(hexColor: string): string {
    // Utiliser des classes Tailwind de base avec la couleur personnalisée en style inline
    return `text-white border-2 font-medium px-2 py-1 rounded-full text-xs`;
  }

  getClasseName(classe?: any): string {
    if (!classe) {
      return 'Non définie';
    }
    return classe.name || `Classe ${classe.id}`;
  }

  // Empêcher la fermeture du modal en cliquant sur le contenu
  onModalContentClick(event: Event) {
    event.stopPropagation();
  }

  // Exposer Math pour le template
  Math = Math;

  // TrackBy function pour ngFor
  trackByChildId(index: number, child: User): number {
    return child.id;
  }

  // Récupérer la vraie progression de l'enfant
  getChildProgress(child: User): number {
    const progressMap = this.childrenProgress();
    return progressMap.get(child.id) || 0;
  }

  // Méthodes pour le drag and drop
  onMouseDown(event: MouseEvent) {
    // Vérifier que le clic est sur le header (pas sur les boutons)
    const target = event.target as HTMLElement;
    if (target.closest('button')) {
      return; // Ne pas démarrer le drag si on clique sur un bouton
    }

    this.isDragging = true;
    this.dragOffset.x = event.clientX - this.modalPosition.x;
    this.dragOffset.y = event.clientY - this.modalPosition.y;

    // Empêcher la sélection de texte pendant le drag
    event.preventDefault();

    // Ajouter une classe CSS pour indiquer le drag
    const modal = document.querySelector('.modal-content') as HTMLElement;
    if (modal) {
      modal.classList.add('dragging');
    }

    // Ajouter les événements globaux
    document.addEventListener('mousemove', this.onMouseMove.bind(this));
    document.addEventListener('mouseup', this.onMouseUp.bind(this));
  }

  onMouseMove(event: MouseEvent) {
    if (!this.isDragging) return;

    this.modalPosition.x = event.clientX - this.dragOffset.x;
    this.modalPosition.y = event.clientY - this.dragOffset.y;

    // Limiter le déplacement dans la fenêtre
    const modal = document.querySelector('.modal-content') as HTMLElement;
    if (modal) {
      const rect = modal.getBoundingClientRect();
      const maxX = window.innerWidth - rect.width;
      const maxY = window.innerHeight - rect.height;

      this.modalPosition.x = Math.max(0, Math.min(this.modalPosition.x, maxX));
      this.modalPosition.y = Math.max(0, Math.min(this.modalPosition.y, maxY));
    }
  }

  onMouseUp() {
    this.isDragging = false;

    // Supprimer la classe CSS de drag
    const modal = document.querySelector('.modal-content') as HTMLElement;
    if (modal) {
      modal.classList.remove('dragging');
    }

    // Supprimer les événements globaux
    document.removeEventListener('mousemove', this.onMouseMove.bind(this));
    document.removeEventListener('mouseup', this.onMouseUp.bind(this));
  }

  // Réinitialiser la position du modal
  resetModalPosition() {
    this.modalPosition = { x: 0, y: 0 };
  }

  // Méthodes pour le drag and drop du bouton
  onButtonMouseDown(event: MouseEvent) {
    // Empêcher l'ouverture du modal si on commence à drag
    event.preventDefault();
    event.stopPropagation();

    this.isButtonDragging = true;

    // Si le bouton n'est pas encore déplacé, commencer à la position actuelle
    if (this.buttonPosition.x === 0 && this.buttonPosition.y === 0) {
      const button = document.querySelector(
        '.child-selector-btn'
      ) as HTMLElement;
      if (button) {
        const rect = button.getBoundingClientRect();
        this.buttonPosition.x = rect.left;
        this.buttonPosition.y = rect.top;
      }
    }

    this.buttonDragOffset.x = event.clientX - this.buttonPosition.x;
    this.buttonDragOffset.y = event.clientY - this.buttonPosition.y;

    // Ajouter la classe CSS de drag
    const button = document.querySelector('.child-selector-btn') as HTMLElement;
    if (button) {
      button.classList.add('dragging');
    }

    // Ajouter les événements globaux
    document.addEventListener('mousemove', this.onButtonMouseMove.bind(this));
    document.addEventListener('mouseup', this.onButtonMouseUp.bind(this));
  }

  onButtonMouseMove(event: MouseEvent) {
    if (!this.isButtonDragging) return;

    this.buttonPosition.x = event.clientX - this.buttonDragOffset.x;
    this.buttonPosition.y = event.clientY - this.buttonDragOffset.y;

    // Limiter le déplacement dans la fenêtre
    const button = document.querySelector('.child-selector-btn') as HTMLElement;
    if (button) {
      const rect = button.getBoundingClientRect();
      const maxX = window.innerWidth - rect.width;
      const maxY = window.innerHeight - rect.height;

      this.buttonPosition.x = Math.max(
        0,
        Math.min(this.buttonPosition.x, maxX)
      );
      this.buttonPosition.y = Math.max(
        0,
        Math.min(this.buttonPosition.y, maxY)
      );

      // Forcer la mise à jour des styles
      button.style.position = 'fixed';
      button.style.left = this.buttonPosition.x + 'px';
      button.style.top = this.buttonPosition.y + 'px';
      button.style.zIndex = '9999';
      button.style.transform = 'none';
      button.style.margin = '0';
    }
  }

  onButtonMouseUp() {
    this.isButtonDragging = false;

    // Supprimer la classe CSS de drag
    const button = document.querySelector('.child-selector-btn') as HTMLElement;
    if (button) {
      button.classList.remove('dragging');

      // S'assurer que les styles sont appliqués
      if (this.isButtonMoved()) {
        button.style.position = 'fixed';
        button.style.left = this.buttonPosition.x + 'px';
        button.style.top = this.buttonPosition.y + 'px';
        button.style.zIndex = '9999';
        button.style.transform = 'none';
        button.style.margin = '0';
      }
    }

    // Supprimer les événements globaux
    document.removeEventListener(
      'mousemove',
      this.onButtonMouseMove.bind(this)
    );
    document.removeEventListener('mouseup', this.onButtonMouseUp.bind(this));

    // Sauvegarder la position
    this.saveButtonPosition();
  }

  // Sauvegarder la position du bouton
  private saveButtonPosition() {
    localStorage.setItem(
      'childModalButtonPosition',
      JSON.stringify(this.buttonPosition)
    );
  }

  // Charger la position du bouton
  private loadButtonPosition() {
    const saved = localStorage.getItem('childModalButtonPosition');
    if (saved) {
      const position = JSON.parse(saved);
      // Vérifier que la position est valide
      if (position.x > 0 || position.y > 0) {
        this.buttonPosition = position;

        // Appliquer les styles après un délai pour s'assurer que le DOM est prêt
        setTimeout(() => {
          const button = document.querySelector(
            '.child-selector-btn'
          ) as HTMLElement;
          if (button) {
            button.style.position = 'fixed';
            button.style.left = this.buttonPosition.x + 'px';
            button.style.top = this.buttonPosition.y + 'px';
            button.style.zIndex = '9999';
            button.style.transform = 'none';
            button.style.margin = '0';
          }
        }, 100);
      }
    }
  }

  // Vérifier si le bouton est déplacé
  isButtonMoved(): boolean {
    return this.buttonPosition.x !== 0 || this.buttonPosition.y !== 0;
  }

  // Réinitialiser la position du bouton
  resetButtonPosition() {
    this.buttonPosition = { x: 0, y: 0 };
    this.saveButtonPosition();

    // Forcer la mise à jour de l'affichage
    setTimeout(() => {
      const button = document.querySelector(
        '.child-selector-btn'
      ) as HTMLElement;
      if (button) {
        button.style.position = 'relative';
        button.style.left = 'auto';
        button.style.top = 'auto';
        button.style.zIndex = 'auto';
        button.style.transform = 'auto';
        button.style.margin = 'auto';
      }
    }, 0);
  }
}
