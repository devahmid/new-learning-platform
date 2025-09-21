import { Component, OnInit, inject, effect } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SubjectService } from '../services/subject.service';
import { CommonModule, Location } from '@angular/common';
import { ChildContextService } from '../_children-context/_children-context/child-context.service';

@Component({
  selector: 'app-level-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './level-page.component.html',
  styleUrl: './level-page.component.scss',
})
export class LevelPageComponent implements OnInit {
  subjectName!: string;
  subjectData: any;
  unlockedClasse = 1; // Par défaut, seule la classe 1 est débloquée

  private childContext = inject(ChildContextService);
  selectedChild = this.childContext.selectedChild;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private subjectService: SubjectService,
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

    // Déterminer la classe débloquée selon l'enfant sélectionné
    this.updateUnlockedClasse();
  }

  private updateUnlockedClasse() {
    const child = this.selectedChild();
    if (child && child.classe && child.classe.id) {
      // La classe débloquée correspond à la classe de l'enfant
      this.unlockedClasse = child.classe.id;
    
    } else {
      // Si aucun enfant sélectionné ou pas de classe, seule la classe 1 est accessible
      this.unlockedClasse = 1;
     
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
