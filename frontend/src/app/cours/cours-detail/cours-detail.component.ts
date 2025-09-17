// import { Component, OnInit } from '@angular/core';
// import { ActivatedRoute } from '@angular/router';
// import { CoursService } from '../cours.service';
// import { CommonModule } from '@angular/common';
// import { CardModule } from 'primeng/card';
// import { ButtonModule } from 'primeng/button';
// import { FileUploadModule } from 'primeng/fileupload';
// import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
// import { Course } from '../../models/course.model';
// import { environment } from '../../../environments/environment';
// import { NgClass } from '@angular/common';

// @Component({
//     selector: 'app-cours-detail',
//     standalone:true,
//     imports: [CommonModule, CardModule, ButtonModule, FileUploadModule, NgClass],
//     templateUrl: './cours-detail.component.html',
//     styleUrl: './cours-detail.component.scss'
// })
// export class CoursDetailComponent implements OnInit {

//   cours!: Course;
//   isEnrolled = false;
//   enrollmentId: number | null = null;
//   safeVideoUrl?: SafeResourceUrl;
//   safePdfUrl?: SafeResourceUrl;

//   constructor(
//     private route: ActivatedRoute,
//     private coursService: CoursService,
//     private sanitizer: DomSanitizer
//   ) {}

//   ngOnInit() {
//     const courseId = Number(this.route.snapshot.paramMap.get('id'));

//     this.coursService.getCoursById(courseId).subscribe(data => {
//       this.cours = {
//         ...data,
//         lessons: data.lessons.map(lesson => ({ ...lesson, expanded: false }))
//       };

//       if (this.cours.videoUrl?.trim()) {
//         const videoUrl = this.formatVideoUrl(this.cours.videoUrl);
//         this.safeVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(videoUrl);
//       }

//       if (this.cours.pdfUrl?.trim()) {
//         this.safePdfUrl = this.getFullUrl(this.cours.pdfUrl);

//       }
//     });

//     this.checkEnrollment(courseId);
//   }

//   checkEnrollment(courseId: number) {
//     this.coursService.isEnrolled(courseId).subscribe(res => {
//       this.isEnrolled = res?.enrolled;
//       this.enrollmentId = res?.enrollmentId ?? null;
//     });
//   }

//   toggleLesson(lesson: any) {
//     lesson.expanded = !lesson.expanded;
//   }

//   formatVideoUrl(url: string): string {
//     if (url.includes('youtube.com/watch?v=')) return url.replace('watch?v=', 'embed/');
//     if (url.includes('youtu.be/')) return url.replace('youtu.be/', 'www.youtube.com/embed/');
//     if (url.includes('vimeo.com/')) return url.replace('vimeo.com/', 'player.vimeo.com/video/');
//     return url;
//   }

//   getSafeLessonVideo(url: string): SafeResourceUrl {
//     return this.sanitizer.bypassSecurityTrustResourceUrl(this.formatVideoUrl(url));
//   }

//   getFullUrl(path: string): SafeResourceUrl {
//     const full = path.startsWith('http') ? path : `${environment.apiBaseUrl}${path}`;
//     return this.sanitizer.bypassSecurityTrustResourceUrl(full);
//   }
// }
import { Component, OnInit, OnDestroy, inject, effect, runInInjectionContext, Injector } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CourseService } from '../../services/course.service';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Course } from '../../models/course.model';
import { environment } from '../../../environments/environment';
import { NgClass } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConfettiComponent } from '../../components/confetti/confetti.component';
import { ChildContextService } from '../../_children-context/_children-context/child-context.service';

@Component({
  selector: 'app-cours-detail',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    FileUploadModule,
    NgClass,
    FormsModule,
    RouterModule,
    ConfettiComponent,
  ],
  templateUrl: './cours-detail.component.html',
  styleUrl: './cours-detail.component.scss',
})
export class CoursDetailComponent implements OnInit, OnDestroy {
  cours!: Course;
  isEnrolled = false;
  isLoadingEnroll = false;

  enrollmentId: number | null = null;
  progression: number = 0; // Progression réelle depuis l'API
  currentLesson: any;
  safeVideoUrl?: SafeResourceUrl;
  safePdfUrl?: SafeResourceUrl;
  showQuiz = false;
  selectedAnswers: { [questionId: number]: number } = {};
  resultMessage: string | null = null;
  showConfetti = false;

  // Organisation des leçons par sous-catégories
  vocabularyLessons: any[] = [];
  grammarLessons: any[] = [];
  readingLessons: any[] = [];
  otherLessons: any[] = [];

  // Navigation de retour
  
  // Navigation properties (simplified)

  // Gestion du changement d'enfant
  private childContext = inject(ChildContextService);
  private injector = inject(Injector);
  private currentChildId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    // Initialiser le suivi de l'enfant
    this.initializeChildTracking();

    this.courseService.getCourseById(id).subscribe((data) => {
      this.cours = {
        ...data,
        lessons:
          data.lessons?.map((lesson) => ({
            ...lesson,
            expanded: false,
            completed: false,
          })) || [],
        enrollments: [],
        createdAt: (data as any).createdAt || '',
        updatedAt: (data as any).updatedAt || '',
      } as Course;

      if (this.cours.videoUrl?.trim()) {
        const videoUrl = this.formatVideoUrl(this.cours.videoUrl);
        this.safeVideoUrl =
          this.sanitizer.bypassSecurityTrustResourceUrl(videoUrl);
      }

      if (this.cours.pdfUrl?.trim()) {
        const fullUrl = this.getFullUrlRaw(this.cours.pdfUrl);
        this.loadPdf(fullUrl);
      }

      // Pour l'instant, on simule l'enrollment
      this.isEnrolled = true;
      this.progression = 0; // Progression réelle depuis l'API

      // Organiser les leçons par sous-catégories
      this.organizeLessonsBySubcategory();
    });
  }

  private organizeLessonsBySubcategory() {
    // Réinitialiser les tableaux
    this.vocabularyLessons = [];
    this.grammarLessons = [];
    this.readingLessons = [];
    this.otherLessons = [];

    // Utiliser seulement les leçons du cours actuel
    if (!this.cours || !this.cours.lessons) {
      console.log('Aucune leçon trouvée pour ce cours');
      return;
    }

    const currentSubcategoryName = (this.cours as any).subcategory?.name?.toLowerCase() || '';
    console.log(`Cours actuel "${this.cours.title}" - Sous-catégorie: "${currentSubcategoryName}"`);

    // Trier les leçons par ordre
    const sortedLessons = [...this.cours.lessons].sort((a, b) => (a.order || 0) - (b.order || 0));
    
    // Organiser les leçons selon la sous-catégorie du cours
    if (currentSubcategoryName.includes('vocabulaire')) {
      this.vocabularyLessons = sortedLessons;
    } else if (currentSubcategoryName.includes('grammaire')) {
      this.grammarLessons = sortedLessons;
    } else if (currentSubcategoryName.includes('lecture')) {
      this.readingLessons = sortedLessons;
    } else if (currentSubcategoryName.includes('replay')) {
      // Pour les cours Replay, créer une section spéciale
      this.otherLessons = sortedLessons;
    } else {
      // Pour les autres sous-catégories, les mettre dans "autres"
      this.otherLessons = sortedLessons;
    }

    console.log('Leçons organisées par sous-catégorie:', {
      vocabulary: this.vocabularyLessons.length,
      grammar: this.grammarLessons.length,
      reading: this.readingLessons.length,
      other: this.otherLessons.length
    });
  }

  private fallbackToCurrentCourseLessons() {
    // Fallback : utiliser seulement les leçons du cours actuel
    const sortedLessons = [...this.cours.lessons].sort((a, b) => (a.order || 0) - (b.order || 0));
    const subcategoryName = (this.cours as any).subcategory?.name?.toLowerCase() || '';

    // Réinitialiser tous les tableaux
    this.vocabularyLessons = [];
    this.grammarLessons = [];
    this.readingLessons = [];
    this.otherLessons = [];

    if (subcategoryName.includes('vocabulaire')) {
      this.vocabularyLessons = sortedLessons;
    } else if (subcategoryName.includes('grammaire')) {
      this.grammarLessons = sortedLessons;
    } else if (subcategoryName.includes('lecture')) {
      this.readingLessons = sortedLessons;
    } else {
      this.otherLessons = sortedLessons;
    }

    console.log('Fallback - Leçons du cours actuel:', {
      vocabulary: this.vocabularyLessons.length,
      grammar: this.grammarLessons.length,
      reading: this.readingLessons.length,
      other: this.otherLessons.length,
      subcategory: subcategoryName
    });
  }
  loadPdf(pdfUrl: string) {
    fetch(pdfUrl)
      .then((res) => res.blob())
      .then((blob) => {
        console.log('blob', blob);
        const blobUrl = URL.createObjectURL(blob);
        this.safePdfUrl =
          this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);
      });
  }

  checkEnrollment(courseId: number) {
    // Pour l'instant, on simule l'enrollment
    this.isEnrolled = true;
    this.enrollmentId = 1; // ID factice
    this.mettreAJourProgression();
  }

  enroll() {
    if (this.isLoadingEnroll) return;

    this.isLoadingEnroll = true;

    // Pour l'instant, on simule l'enrollment
    setTimeout(() => {
      this.isEnrolled = true;
      this.progression = 0; // Progression réelle depuis l'API
      this.isLoadingEnroll = false;
    }, 1000);
  }

  toggleLesson(lesson: any) {
    // Navigation vers LessonDetailComponent au lieu d'étendre dans le même composant
    console.log('Navigation vers la leçon:', lesson);

    // Récupérer les informations depuis les données du cours
    if (this.cours && this.cours.category && this.cours.level) {
      // Utiliser le nom de la catégorie comme nom de matière
      // Mapper les noms de catégories vers les noms de matières
      const categoryToSubjectMap: { [key: string]: string } = {
        'Langue Arabe': 'Arabe',
        'Langue Arabe Admin': 'Arabe', // Ajout pour gérer le cas avec "Admin"
        Croyance: 'Croyance',
        'At-Tafsir': 'At-Tafsir',
        Fiqh: 'Fiqh',
        Hadith: 'Hadith',
        'Replay': 'replay', // Ajout pour les cours Replay
      };

      console.log('Catégorie du cours:', this.cours.category.name);
      
      const subjectName =
        categoryToSubjectMap[this.cours.category.name] ||
        this.cours.category.name;
      const level = this.cours.level.id;

      console.log('Navigation vers:', {
        categoryName: this.cours.category.name,
        subjectName,
        level,
        lessonId: lesson.id,
      });

      // Naviguer vers LessonDetailComponent avec les bons paramètres
      this.router.navigate(['/cours', subjectName, level, 'lesson', lesson.id]);
    } else {
      console.error(
        'Données du cours manquantes pour la navigation:',
        this.cours
      );
    }
  }

  formatVideoUrl(url: string): string {
    if (url.includes('youtube.com/watch?v='))
      return url.replace('watch?v=', 'embed/');
    if (url.includes('youtu.be/'))
      return url.replace('youtu.be/', 'www.youtube.com/embed/');
    if (url.includes('vimeo.com/'))
      return url.replace('vimeo.com/', 'player.vimeo.com/video/');
    return url;
  }

  isReplayCourse(): boolean {
    return !!(this.cours && this.cours.category && this.cours.category.name === 'Replay');
  }

  getSafeLessonVideo(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      this.formatVideoUrl(url)
    );
  }

  getFullUrl(path: string): SafeResourceUrl {
    const full = path.startsWith('http')
      ? path
      : `${environment.apiUrl}${path}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(full);
  }

  getFullUrlRaw(path: string): string {
    return path.startsWith('http') ? path : `${environment.apiUrl}${path}`;
  }

  retourListe() {
    // Retourner vers la page des niveaux pour cette matière
    const subjectName = this.getSubjectName().toLowerCase();
    const level = this.getLevel();
    this.router.navigate(['/cours', subjectName, level]);
  }


  getSubjectName(): string {
    // Utiliser les données du cours pour récupérer le nom de la matière
    if (this.cours && this.cours.category) {
      // Mapper les noms de catégories vers les noms de matières
      const categoryToSubjectMap: { [key: string]: string } = {
        'Langue Arabe': 'Arabe',
        'Langue Arabe Admin': 'Arabe',
        Croyance: 'Croyance',
        'At-Tafsir': 'At-Tafsir',
        Fiqh: 'Fiqh',
        Hadith: 'Hadith',
      };
      
      return categoryToSubjectMap[this.cours.category.name] || this.cours.category.name;
    }
    
    // Fallback vers les paramètres de route si disponibles
    const subjectName = this.route.snapshot.paramMap.get('subjectName');
    if (subjectName) {
      return subjectName.charAt(0).toUpperCase() + subjectName.slice(1);
    }
    
    return 'Arabe'; // Valeur par défaut
  }

  getLevel(): string {
    // Utiliser les données du cours pour récupérer le niveau
    if (this.cours && this.cours.level && this.cours.level.id) {
      return this.cours.level.id.toString();
    }
    
    // Fallback vers les paramètres de route si disponibles
    const level = this.route.snapshot.paramMap.get('level');
    if (level) {
      return level;
    }
    
    return '1'; // Valeur par défaut
  }

  mettreAJourProgression() {
    const total = this.cours.lessons.length;
    const terminees = this.cours.lessons.filter((l) => l.completed).length;
    this.progression = Math.round((terminees / total) * 100);
  }

  toggleQuiz() {
    this.showQuiz = !this.showQuiz;
  }

  // Méthode pour bloquer le bouton exercice
  onDisabledExerciseClick() {
    alert('Les exercices pratiques seront bientôt disponibles !');
  }

  submitQuiz() {
    const quiz = this.cours.quizzes[0];
    let allCorrect = true;

    quiz.questions.forEach((q) => {
      const selectedId = this.selectedAnswers[q.id];
      const correctAnswer = q.answers.find((a) => a.isCorrect);
      if (!selectedId || selectedId !== correctAnswer?.id) {
        allCorrect = false;
      }
    });

    if (allCorrect) {
      this.resultMessage = '🌟 Bravo ! Tu es un génie ! 🎉';
      this.showConfetti = true;
      setTimeout(() => (this.showConfetti = false), 5000);
    } else {
      this.resultMessage = '🙁 Oops ! Réessaye encore, tu peux le faire !';
      this.showConfetti = false;
    }
  }

  ngOnDestroy() {
    // Nettoyage si nécessaire
  }

  private initializeChildTracking() {
    // Récupérer l'enfant actuellement sélectionné
    const selectedChild = this.childContext.selectedChild();
    this.currentChildId = selectedChild?.id || null;

    // Écouter les changements d'enfant avec effect dans le contexte d'injection
    runInInjectionContext(this.injector, () => {
      effect(() => {
        const child = this.childContext.selectedChild();
        console.log('Effect CoursDetail - Enfant actuel:', child);
        
        // Si on a un enfant et que c'est différent du précédent
        if (child && child.id !== this.currentChildId) {
          console.log('Changement d\'enfant détecté dans CoursDetail:', child);
          this.handleChildChange(child);
        }
        // Si on n'a plus d'enfant sélectionné
        else if (!child && this.currentChildId) {
          console.log('Aucun enfant sélectionné - Redirection vers matières');
          this.router.navigate(['/matières']);
        }
      });
    });
  }

  private handleChildChange(newChild: any) {
    this.currentChildId = newChild.id;
    
    // Vérifier si le nouvel enfant a accès au cours actuel
    const childLevel = newChild.level?.id || 1;
    const courseLevel = this.cours?.level?.id || 1;
    
    console.log(`Nouvel enfant niveau ${childLevel}, cours niveau ${courseLevel}`);
    
    // Rediriger vers matières pour forcer la sélection du bon niveau
    console.log('Changement d\'enfant détecté - Redirection vers matières');
    // Forcer la navigation immédiatement
    window.location.href = '/matières';
  }

  private loadCourseData(courseId: number) {
    this.courseService.getCourseById(courseId).subscribe((data) => {
      this.cours = {
        ...data,
        lessons:
          data.lessons?.map((lesson) => ({
            ...lesson,
            expanded: false,
            completed: false,
          })) || [],
        enrollments: [],
        createdAt: (data as any).createdAt || '',
        updatedAt: (data as any).updatedAt || '',
      } as Course;

      this.organizeLessonsBySubcategory();
      this.mettreAJourProgression();
    });
  }
}
