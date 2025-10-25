import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { ChildContextService } from './child-context.service';
import { NotificationService } from '../../services/notification.service';
import { ChildSelectionModalService } from '../../shared/child-selection-modal/child-selection-modal.service';

// Variable pour éviter les redirections multiples
let isRedirecting = false;

export const childGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const childContext = inject(ChildContextService);
  const router = inject(Router);
  const popup = inject(NotificationService);
  const modalService = inject(ChildSelectionModalService);

  // Charger les enfants s'ils ne sont pas encore chargés
  const children = childContext.children();
  const loaded = childContext.loaded();
  

  // Si pas encore chargé, charger et laisser passer temporairement
  if (!loaded) {
    childContext.loadChildren();
    return true; // Laisser passer temporairement pour éviter la boucle
  }

  // Si chargé mais aucun enfant
  if (children.length === 0) {
    if (!isRedirecting) {
      isRedirecting = true;
      router.navigate(['/no-children-info']).then(() => {
        isRedirecting = false;
      });
    }
    return false;
  }

  // Vérifier s'il y a un enfant sélectionné
  const selected = childContext.selectedChild();
  
  // TOUJOURS forcer la sélection d'enfant, même s'il n'y en a qu'un
  if (!selected) {
    if (!isRedirecting) {
      isRedirecting = true;
      router.navigate(['/no-children-info']).then(() => {
        isRedirecting = false;
      });
    }
    return false;
  }
  
  return true;
};