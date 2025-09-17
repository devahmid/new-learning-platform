import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClasseService, Classe } from '../../services/classe.service';
import { ChildContextService } from '../../_children-context/_children-context/child-context.service';

@Component({
  selector: 'app-classe-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './classe-selector.component.html',
  styleUrls: ['./classe-selector.component.scss']
})
export class ClasseSelectorComponent implements OnInit {
  classes: Classe[] = [];
  selectedClasse: Classe | null = null;
  loading = false;
  error: string | null = null;
  
  @Output() classeSelected = new EventEmitter<Classe>();

  constructor(
    private classeService: ClasseService,
    private childContext: ChildContextService
  ) {}

  ngOnInit() {
    this.loadClasses();
  }

  loadClasses() {
    this.loading = true;
    this.error = null;
    
    this.classeService.findAll().subscribe({
      next: (classes) => {
        this.classes = classes.filter(c => c.isActive);
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des classes:', error);
        this.error = 'Erreur lors du chargement des classes';
        this.loading = false;
      }
    });
  }

  onClasseSelect(classe: Classe) {
    this.selectedClasse = classe;
    this.classeSelected.emit(classe);
  }

  // Méthode pour obtenir la classe de l'enfant sélectionné
  getChildClasse(): Classe | null {
    const selectedChild = this.childContext.selectedChild();
    if (selectedChild && selectedChild.classeId) {
      return this.classes.find(c => c.id === selectedChild.classeId) || null;
    }
    return null;
  }
}
