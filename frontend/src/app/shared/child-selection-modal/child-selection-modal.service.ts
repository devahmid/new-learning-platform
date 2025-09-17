import { Injectable, signal } from '@angular/core';
import { ChildSelectionModalComponent } from './child-selection-modal.component';

@Injectable({
  providedIn: 'root'
})
export class ChildSelectionModalService {
  private modalComponent = signal<ChildSelectionModalComponent | null>(null);

  // Enregistrer le composant modal
  registerModal(modal: ChildSelectionModalComponent) {
    this.modalComponent.set(modal);
  }

  // Désenregistrer le composant modal
  unregisterModal() {
    this.modalComponent.set(null);
  }

  // Ouvrir le modal automatiquement
  openModalAutomatically() {
    const modal = this.modalComponent();
    if (modal) {
      modal.openModalAutomatically();
    }
  }

  // Vérifier si le modal est ouvert
  isModalOpen(): boolean {
    const modal = this.modalComponent();
    return modal ? modal.isOpen() : false;
  }
}
