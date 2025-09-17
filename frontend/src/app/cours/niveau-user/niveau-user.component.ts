import { CommonModule, Location } from '@angular/common';
import { Component, OnInit, OnDestroy, inject, effect, runInInjectionContext, Injector } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SubjectService } from '../../services/subject.service';
import { CourseService, Course, Lesson } from '../../services/course.service';
import { ChildContextService } from '../../_children-context/_children-context/child-context.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-niveau-user',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './niveau-user.component.html',
  styleUrl: './niveau-user.component.scss',
})
export class NiveauUserComponent implements OnInit, OnDestroy {
  classe = 1;
  progress = 0; // Progression réelle depuis l'API
  subjectData: any = null;
  vocabularyLessons: Lesson[] = [];
  grammarLessons: Lesson[] = [];
  courses: any[] = [];
  isLoading = true;
  error: string | null = null;
  totalLessons = 0;

  // Gestion du changement d'enfant
  private childContext = inject(ChildContextService);
  private injector = inject(Injector);
  private currentChildId: number | null = null;
  private routeSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private subjectService: SubjectService,
    private location: Location,
    private courseService: CourseService
  ) {}

  ngOnInit() {
    // Écouter les changements de paramètres de route
    this.routeSubscription = this.route.paramMap.subscribe(params => {
      const subjectName = params.get('subjectName');
      const classeParam = params.get('classe');
      this.classe = classeParam ? +classeParam : 1;

      // Gestion spéciale pour "replay"
      if (subjectName === 'replay') {
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
        this.subjectData = this.subjectService.getSubjectByName(subjectName!);
      }

      if (this.subjectData) {
        // Charger directement les vraies données depuis l'API
        this.loadCoursesAndLessons();
      } else {
        this.error = 'Matière non trouvée';
        this.isLoading = false;
      }
    });

    // Initialiser le suivi de l'enfant
    this.initializeChildTracking();
  }

  ngOnDestroy() {
    // Désinscription de l'observable de route
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  private initializeChildTracking() {
    // Récupérer l'enfant actuellement sélectionné
    const selectedChild = this.childContext.selectedChild();
    this.currentChildId = selectedChild?.id || null;
    console.log('NiveauUser - Enfant initial:', selectedChild, 'ID:', this.currentChildId);

    // Écouter les changements d'enfant avec effect dans le contexte d'injection
    runInInjectionContext(this.injector, () => {
      effect(() => {
        const child = this.childContext.selectedChild();
        console.log('NiveauUser Effect - Enfant actuel:', child, 'ID précédent:', this.currentChildId);
        
        // Si on a un enfant et que c'est différent du précédent
        if (child && child.id !== this.currentChildId) {
          console.log('NiveauUser - Changement d\'enfant détecté:', child);
          this.handleChildChange(child);
        }
        // Si on n'a plus d'enfant sélectionné
        else if (!child && this.currentChildId) {
          console.log('NiveauUser - Aucun enfant sélectionné - Redirection vers matières');
          this.router.navigate(['/matières']);
        }
      });
    });
  }

  private handleChildChange(newChild: any) {
    this.currentChildId = newChild.id;
    
    // Vérifier si le nouvel enfant a accès à la classe actuelle
    const childClasse = newChild.classe?.id || 1; // Classe par défaut si non définie
    const currentClasse = this.classe;
    
    console.log(`Nouvel enfant classe ${childClasse}, page classe ${currentClasse}`);
    console.log('Enfant complet:', newChild);
    
    // Rediriger vers matières pour forcer la sélection de la bonne classe
    console.log('Changement d\'enfant détecté - Redirection vers matières');
    // Forcer la navigation immédiatement
    window.location.href = '/matières';
  }

  private loadCoursesAndLessons() {
    this.isLoading = true;
    this.error = null;

    // Récupérer l'enfant sélectionné pour obtenir sa classe
    const selectedChild = this.childContext.selectedChild();
    console.log('Enfant sélectionné:', selectedChild);
    
    if (!selectedChild) {
      console.error('Aucun enfant sélectionné');
      this.error = 'Aucun enfant sélectionné';
      this.isLoading = false;
      return;
    }

    // Vérifier si l'enfant a une classe (classeId ou classe.id)
    const classeId = selectedChild.classeId || selectedChild.classe?.id;
    if (!classeId) {
      console.error('Classe manquante pour l\'enfant:', selectedChild);
      this.error = 'Classe non définie pour cet enfant';
      this.isLoading = false;
      return;
    }

    // Gestion spéciale pour les replays
    if (this.subjectData && this.subjectData.name === 'Replay') {
      this.loadReplayCourses(classeId);
      return;
    }

    // Récupérer les cours pour cette matière et cette classe
    if (this.subjectData && this.subjectData.id) {
      this.courseService
        .getCoursesByCategoryAndClasse(this.subjectData.id, classeId)
        .subscribe({
          next: (courses) => {
            console.log(
              "Cours récupérés depuis l'API pour",
              this.subjectData.name,
              'classe',
              classeId,
              ':',
              courses
            );
            this.courses = courses;

            // Toujours traiter les leçons, même si certaines sont vides
            this.processLessons();
            this.calculateProgress();
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Erreur lors du chargement des cours:', err);
            this.error = 'Erreur lors du chargement des cours';
            // Pas de données disponibles - afficher 0
            this.courses = [];
            this.progress = 0;
            this.isLoading = false;
          },
        });
    } else {
      console.error('SubjectData ou ID manquant:', this.subjectData);
      this.error = 'Matière non trouvée';
      this.isLoading = false;
    }
  }

  private loadReplayCourses(classeId: number) {
    // Pour les replays, on récupère tous les cours de la catégorie "Replay" (ID 14)
    // et on filtre par classe
    this.courseService
      .getCoursesByCategoryAndClasse(14, classeId) // ID 14 = catégorie Replay
      .subscribe({
        next: (courses) => {
          console.log(
            "Cours Replay récupérés depuis l'API pour classe",
            classeId,
            ':',
            courses
          );
          
          // Ajouter des exemples de cours bloqués pour tester
          this.courses = this.addBlockingExamples(courses);

          // Traiter les leçons
          this.processLessons();
          this.calculateProgress();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Erreur lors du chargement des cours Replay:', err);
          this.error = 'Erreur lors du chargement des replays';
          // Pas de données disponibles - afficher 0
          this.courses = [];
          this.progress = 0;
          this.isLoading = false;
        },
      });
  }

  // Méthode pour ajouter des exemples de cours bloqués (à supprimer en production)
  private addBlockingExamples(courses: any[]): any[] {
    const coursesWithBlocking = [...courses];
    
    // Ajouter des exemples de blocage pour tester
    if (coursesWithBlocking.length > 0) {
      // Premier cours : bloqué par date
      coursesWithBlocking[0] = {
        ...coursesWithBlocking[0],
        unlockDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Dans 7 jours
        lockedReason: 'Cours en préparation'
      };
    }
    
    if (coursesWithBlocking.length > 1) {
      // Deuxième cours : bloqué par prérequis
      coursesWithBlocking[1] = {
        ...coursesWithBlocking[1],
        requiresPreviousCourse: true,
        previousCourseCompleted: false,
        lockedReason: 'Terminez le cours précédent'
      };
    }
    
    if (coursesWithBlocking.length > 2) {
      // Troisième cours : bloqué par classe
      coursesWithBlocking[2] = {
        ...coursesWithBlocking[2],
        requiredClasse: this.classe + 1,
        lockedReason: `Classe ${this.classe + 1} requise`
      };
    }
    
    return coursesWithBlocking;
  }

  private processLessons() {
    // Plus besoin de traiter les leçons ici
    // On affiche directement les cours
    console.log('Cours récupérés pour affichage:', this.courses);

    // Calculer le total des cours
    this.totalLessons = this.courses.length;

    // Vider les leçons car on affiche les cours maintenant
    this.vocabularyLessons = [];
    this.grammarLessons = [];
  }

  private calculateProgress() {
    if (this.courses.length === 0) {
      this.progress = 0;
      return;
    }

    // Calculer la progression basée sur les cours et leçons disponibles
    const totalLessons = this.totalLessons;
    if (totalLessons === 0) {
      this.progress = 0;
      return;
    }

    // Pour l'instant, progression simulée basée sur le nombre de cours
    // Plus il y a de cours, plus la progression est élevée (simulation)
    const baseProgress = Math.min(20 + this.courses.length * 5, 80);
    this.progress = baseProgress;

    console.log('Progression calculée:', {
      courses: this.courses.length,
      lessons: totalLessons,
      progress: this.progress,
    });
  }

  // Méthode supprimée - plus de données mockées

  // Navigation vers les détails d'un cours
  // goToCourse(course: any) {
  //   console.log('Navigation vers le cours:', course);
    
  //   // Vérifier si le cours n'est pas bloqué avant de naviguer
  //   if (!this.isCourseLocked(course)) {
  //     this.router.navigate(['/cours', course.id]);
  //   }
  // }

  // Méthode pour vérifier si un cours est bloqué
  isCourseLocked(course: any): boolean {
    // Blocage par date de déverrouillage
    if (course.unlockDate && new Date() < new Date(course.unlockDate)) {
      return true;
    }
    
    // Blocage par prérequis (cours précédent non terminé)
    if (course.requiresPreviousCourse && !course.previousCourseCompleted) {
      return true;
    }
    
    // Blocage manuel
    if (course.isLocked) {
      return true;
    }
    
    // Blocage par classe (exemple: cours avancé nécessite classe intermédiaire)
    if (course.requiredClasse && this.classe < course.requiredClasse) {
      return true;
    }
    
    return false;
  }

  // Méthode pour obtenir la raison du blocage
  getLockReason(course: any): string {
    if (course.unlockDate && new Date() < new Date(course.unlockDate)) {
      const unlockDate = new Date(course.unlockDate);
      return `Disponible le ${unlockDate.toLocaleDateString('fr-FR')}`;
    }
    
    if (course.requiresPreviousCourse && !course.previousCourseCompleted) {
      return 'Terminez le cours précédent';
    }
    
    if (course.requiredClasse && this.classe < course.requiredClasse) {
      return `Classe ${course.requiredClasse} requise`;
    }
    
    return course.lockedReason || 'Bientôt disponible';
  }

  // Navigation vers les détails d'un cours
  goToCourse(course: any) {
    console.log('Navigation vers le cours:', course);
    
    // Navigation simple vers le cours
    this.router.navigate(['/cours', course.id]);
  }

  goBack() {
    // Retourner vers la page des classes pour cette matière
    this.router.navigate(['/matières', this.subjectData?.name?.toLowerCase()]);
  }

  onDisabledButtonClick(type: 'exercices' | 'quiz') {
    // Afficher un message pour les boutons désactivés
    const message = type === 'exercices' 
      ? 'Les exercices pratiques seront bientôt disponibles !'
      : 'Les quiz d\'évaluation seront bientôt disponibles !';
    
    // Ici tu peux ajouter une popup ou un toast si tu en as un
    console.log(message);
    alert(message);
  }
}
