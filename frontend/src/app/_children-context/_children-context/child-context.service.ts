// import { Injectable, signal } from '@angular/core';
// import { BehaviorSubject } from 'rxjs';
// import { User } from '../../models/user.model';

// @Injectable({
//   providedIn: 'root'
// })
// export class ChildContextService {

//   constructor() { }

//   private selectedChildSubject = new BehaviorSubject<any | null>(null);
//   selectedChild$ = this.selectedChildSubject.asObservable();

//   // setSelectedChild(child: any) {
//   //   this.selectedChildSubject.next(child);
//   // }

//   // getSelectedChild(): any | null {
//   //   return this.selectedChildSubject.value;
//   // }

//    private _selectedChild = signal<User | null>(null);

//   setSelectedChild(child: User) {
//     this._selectedChild.set(child);
//   }

//   getSelectedChild(): User | null {
//     return this._selectedChild();
//   }

//   selectedChild = this._selectedChild.asReadonly();
// }
import { Injectable, signal, computed } from '@angular/core';
import { ParentService } from './parent.service';
import { User } from '../../models/user.model';

@Injectable({ providedIn: 'root' })
export class ChildContextService {
  private _selectedChild = signal<User | null>(null);
  selectedChild = this._selectedChild.asReadonly();

  private _children = signal<User[]>([]);
  children = this._children.asReadonly();

  constructor(private parentService: ParentService) {}

  setSelectedChild(child: User) {
    this._selectedChild.set(child);
    // Sauvegarder dans localStorage
    localStorage.setItem(
      'selectedChild',
      JSON.stringify({
        id: child.id,
        firstName: child.firstName,
        lastName: child.lastName,
        level: child.level,
      })
    );
  }

  getSelectedChild(): User | null {
    return this._selectedChild();
  }

  private _loaded = signal(false);
  loaded = this._loaded.asReadonly();

  loadChildren() {
    this.parentService.getChildrenOfLoggedInParent().subscribe((children) => {
      this._children.set(children);
      this._loaded.set(true);

      // 💡 Restaurer depuis localStorage si disponible
      const savedChild = this.getSavedChild();
      if (savedChild) {
        const foundChild = children.find((c) => c.id === savedChild.id);
        if (foundChild) {
          this._selectedChild.set(foundChild);
          return; // Enfant restauré, on s'arrête ici
        }
      }

      // 💡 Reset le selectedChild s'il est plus dans la liste
      const current = this._selectedChild();
      const stillExists = children.some((c) => c.id === current?.id);

      if (!stillExists) {
        this._selectedChild.set(null);
      }

      // Ne sélectionne JAMAIS automatiquement un enfant
      // Même s'il n'y en a qu'un, forcer la sélection manuelle
      this._selectedChild.set(null);
    });
  }

  private getSavedChild(): any {
    try {
      const saved = localStorage.getItem('selectedChild');
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error("Erreur lors de la restauration de l'enfant:", error);
      return null;
    }
  }

  get niveauActuel() {
    return computed(() => this.selectedChild()?.level?.id || null);
  }

  // Méthode pour nettoyer complètement le service lors de la déconnexion
  clearAll() {
    this._selectedChild.set(null);
    this._children.set([]);
    this._loaded.set(false);
    localStorage.removeItem('selectedChild');
  }
}
