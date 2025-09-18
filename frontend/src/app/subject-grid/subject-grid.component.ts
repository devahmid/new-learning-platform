import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { SubjectService } from '../services/subject.service';
import { RouterModule, Router } from '@angular/router';
import { ChildContextService } from '../_children-context/_children-context/child-context.service';

@Component({
  selector: 'app-subject-grid',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './subject-grid.component.html',
  styleUrl: './subject-grid.component.scss'
})
export class SubjectGridComponent implements OnInit {
  levels = [1, 2, 3];
  level: number = 1;
  completion = 70;
  subjects : any;
  
  // Popup simple
  showPopup = false;
  popupMessage = '';
  
  private childContext = inject(ChildContextService);
  private router = inject(Router);
  selectedChild = this.childContext.selectedChild;
  
  constructor(private subjetcService: SubjectService) { }

  ngOnInit(): void {
  this.subjects  =  this.subjetcService.getSubjects()
  }
  


  goToLevel(level: number) {
    // par ex. pour plus tard : router.navigate(['/subject', this.subject.name, 'level', level]);
    console.log(`On va lancer le niveau ${level}`);
  }
  go(section: string) {
    console.log(`Naviguer vers ${section} du niveau ${this.level}`);
    // this.router.navigate(['/subject', this.subject.name, 'level', this.level, section]);
  }

  // Méthodes pour l'indicateur d'enfant
  getChildInitials(): string {
    const child = this.selectedChild();
    if (!child) return '?';
    return `${child.firstName?.charAt(0) || ''}${child.lastName?.charAt(0) || ''}`.toUpperCase();
  }

  getSelectedChildName(): string {
    const child = this.selectedChild();
    return child ? `${child.firstName} ${child.lastName}` : 'Aucun enfant sélectionné';
  }

  getClasseName(): string {
    const child = this.selectedChild();
    const classe = child?.classe;
    if (classe) {
      return classe.name || `Classe ${classe.id}`;
    }
    return 'Non définie';
  }

  onSubjectClick(subject: any, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    
    // Vérifier si la matière est débloquée
    if (this.isSubjectUnlocked(subject)) {
      // Navigation vers la page des niveaux pour cette matière
      this.router.navigate(['/matières', subject.name.toLowerCase()]);
    } else {
      // Désactiver le clic sur les matières non débloquées
      this.popupMessage = 'Cette matière sera bientôt disponible !';
      this.showPopup = true;
      
      // Auto-masquer après 3 secondes
      setTimeout(() => {
        this.showPopup = false;
      }, 3000);
    }
  }

  // Méthode pour vérifier si une matière est débloquée
  isSubjectUnlocked(subject: any): boolean {
    // Débloquer "Arabe" et "Croyance"
    const unlockedSubjects = ['Arabe', 'Croyance', 'Fiqh'];
    return unlockedSubjects.includes(subject.name);
  }

  onReplayClick(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    
    const child = this.selectedChild();
    
    if (!child) {
      // Afficher une popup simple
      this.popupMessage = 'Veuillez d\'abord sélectionner un enfant pour accéder aux replays';
      this.showPopup = true;
      
      // Auto-masquer après 3 secondes
      setTimeout(() => {
        this.showPopup = false;
      }, 3000);
      
      return;
    }
    
    // Navigation vers la page des niveaux pour les replays
    // On utilise 'replay' comme nom de matière pour déclencher le filtrage
    this.router.navigate(['/matières', 'replay']);
  }
}
