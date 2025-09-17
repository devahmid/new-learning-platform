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

  getLevelName(): string {
    const child = this.selectedChild();
    const levelId = child?.level?.id;
    switch (levelId) {
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

  onSubjectClick(subject: any, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    
    // Désactiver le clic sur toutes les matières sauf Replay
    this.popupMessage = 'Cette matière sera bientôt disponible !';
    this.showPopup = true;
    
    // Auto-masquer après 3 secondes
    setTimeout(() => {
      this.showPopup = false;
    }, 3000);
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
