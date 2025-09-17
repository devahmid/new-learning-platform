import { Component, OnInit, inject, effect } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SubjectService } from '../services/subject.service';
import { ClasseService, Classe } from '../services/classe.service';
import { CommonModule, Location } from '@angular/common';
import { ChildContextService } from '../_children-context/_children-context/child-context.service';

@Component({
  selector: 'app-classe-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './classe-page.component.html',
  styleUrl: './classe-page.component.scss',
})
export class ClassePageComponent implements OnInit {
  subjectName!: string;
  subjectData: any;
  classes: Classe[] = [];
  classesLoading = true;
  unlockedClasseId = 1; // Par défaut, seule la classe 1 est débloquée

  private childContext = inject(ChildContextService);
  selectedChild = this.childContext.selectedChild;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private subjectService: SubjectService,
    private classeService: ClasseService,
    private location: Location
  ) {
    // Réagir aux changements d'enfant sélectionné
    effect(() => {
      const child = this.selectedChild();
      if (child) {
        this.updateUnlockedClasse();
      }
    });
  }

  ngOnInit() {
    const name = this.route.snapshot.paramMap.get('name');
    console.log('[CLASSE-PAGE] Subject name:', name);
    
    // Gestion spéciale pour "replay"
    if (name === 'replay') {
      this.subjectData = {
        name: 'Replay',
        ar: '🎬',
        color: 'bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600',
        innerColor: 'bg-gradient-to-r from-purple-600 to-indigo-600',
        icon: 'fa-video',
        iconColor: 'text-purple-600',
        fr: 'Cours enregistrés'
      };
    } else {
      this.subjectData = this.subjectService
        .getSubjects()
        .find((s) => s.name.toLowerCase() === name);
    }

    // Charger les classes depuis l'API
    this.loadClasses();
    
    // Déterminer la classe débloquée selon l'enfant sélectionné
    this.updateUnlockedClasse();
  }

  private loadClasses() {
    this.classesLoading = true;
    this.classeService.getAllClasses().subscribe({
      next: (classes) => {
        this.classes = classes.filter(c => c.isActive);
        console.log('[CLASSE-PAGE] Classes chargées:', this.classes);
        this.classesLoading = false;
      },
      error: (error) => {
        console.error('[CLASSE-PAGE] Erreur lors du chargement des classes:', error);
        // Fallback vers les classes par défaut en cas d'erreur
        this.classes = [
          { id: 1, name: 'Classe 1', isActive: true },
          { id: 2, name: 'Classe 2', isActive: true },
          { id: 3, name: 'Classe 3', isActive: true }
        ];
        this.classesLoading = false;
      }
    });
  }

  private updateUnlockedClasse() {
    const child = this.selectedChild();
    if (child && child.classe && child.classe.id) {
      // La classe débloquée correspond à la classe de l'enfant
      this.unlockedClasseId = child.classe.id;
      console.log(
        `[CLASSE-PAGE] Enfant sélectionné: ${child.firstName} ${child.lastName}, Classe: ${child.classe.id}`
      );
    } else {
      // Si aucun enfant sélectionné ou pas de classe, seule la classe 1 est accessible
      this.unlockedClasseId = 1;
      console.log(
        '[CLASSE-PAGE] Aucun enfant sélectionné ou classe non définie, classe 1 uniquement'
      );
    }
  }

  isClasseUnlocked(classe: Classe): boolean {
    return classe.id === this.unlockedClasseId;
  }

  getClasseStatus(classe: Classe): string {
    if (classe.id === this.unlockedClasseId) {
      return 'Disponible';
    } else {
      return 'Non disponible';
    }
  }

  goBack() {
    this.router.navigate(['/matières']);
  }

  getGradient(color: string): string {
    switch (color) {
      case 'bg-green-800':
        return 'from-green-300 to-green-600';
      case 'bg-yellow-500':
        return 'from-yellow-200 to-yellow-500';
      case 'bg-red-600':
        return 'from-red-300 to-red-600';
      case 'bg-blue-900':
        return 'from-blue-300 to-blue-700';
      case 'bg-blue-400':
        return 'from-blue-200 to-blue-500';
      case 'bg-pink-500':
        return 'from-pink-300 to-pink-500';
      case 'bg-green-600':
        return 'from-green-200 to-green-500';
      default:
        return 'from-gray-200 to-gray-400';
    }
  }

  getGradientClass(subjectColor: string): string {
    const map: { [key: string]: string } = {
      'bg-green-800': 'from-green-300 to-green-600',
      'bg-yellow-500': 'from-yellow-300 to-yellow-500',
      'bg-red-600': 'from-red-400 to-red-700',
      'bg-blue-900': 'from-blue-400 to-blue-700',
      'bg-blue-400': 'from-blue-200 to-blue-500',
      'bg-pink-500': 'from-pink-300 to-pink-500',
      'bg-green-600': 'from-green-300 to-green-600',
    };

    return map[subjectColor] || 'from-gray-200 to-gray-400';
  }
}
