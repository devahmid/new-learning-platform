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

  // Organisation des leçons par sous-catégories (dynamique)
  lessonsBySubcategory: { [key: string]: any[] } = {};
  subcategoryNames: string[] = [];

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

    this.courseService.getCourseById(id).subscribe((data: any) => {
      console.log('DEBUG - Données reçues de l\'API:', data);
      console.log('DEBUG - Leçons reçues:', data.lessons);
      
      this.cours = {
        ...data,
        lessons:
          data.lessons?.map((lesson: any) => {
            console.log('DEBUG - Leçon individuelle:', lesson);
            console.log('DEBUG - Sous-catégorie de la leçon:', lesson.subcategory);
            return {
              ...lesson,
              expanded: false,
              completed: false,
            };
          }) || [],
        enrollments: [],
        createdAt: (data as any).createdAt || '',
        updatedAt: (data as any).updatedAt || '',
        classe: data.classe || data.level || { id: 1, name: 'Classe par défaut' }, // ✅ Gérer la transition level → classe
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
    this.lessonsBySubcategory = {};
    this.subcategoryNames = [];

    // Utiliser seulement les leçons du cours actuel
    if (!this.cours || !this.cours.lessons) {
      console.log('Aucune leçon trouvée pour ce cours');
      return;
    }

    console.log(`Cours actuel "${this.cours.title}" - Catégorie: "${this.cours.category?.name}"`);

    // Trier les leçons par ordre
    const sortedLessons = [...this.cours.lessons].sort((a, b) => (a.order || 0) - (b.order || 0));
    
    // Organiser chaque leçon selon SA propre sous-catégorie
    sortedLessons.forEach(lesson => {
      const lessonSubcategoryName = lesson.subcategory?.name;
      
      if (lessonSubcategoryName) {
        // Leçon avec sous-catégorie
        if (!this.lessonsBySubcategory[lessonSubcategoryName]) {
          this.lessonsBySubcategory[lessonSubcategoryName] = [];
        }
        this.lessonsBySubcategory[lessonSubcategoryName].push(lesson);
      } else {
        // Leçon sans sous-catégorie - les mettre dans une section spéciale
        if (!this.lessonsBySubcategory['Leçons générales']) {
          this.lessonsBySubcategory['Leçons générales'] = [];
        }
        this.lessonsBySubcategory['Leçons générales'].push(lesson);
      }
    });

    // Créer la liste des noms de sous-catégories pour l'affichage
    // Mettre "Leçons générales" à la fin
    const allSubcategories = Object.keys(this.lessonsBySubcategory);
    this.subcategoryNames = allSubcategories
      .filter(name => name !== 'Leçons générales')
      .sort()
      .concat(allSubcategories.includes('Leçons générales') ? ['Leçons générales'] : []);

    console.log('Leçons organisées par sous-catégorie:', {
      subcategories: this.subcategoryNames,
      lessonsBySubcategory: this.lessonsBySubcategory
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
    if (this.cours && this.cours.category && this.cours.classe) {
      // Utiliser le nom de la catégorie comme nom de matière
      // Mapper les noms de catégories vers les noms de matières
      const categoryToSubjectMap: { [key: string]: string } = {
        'Langue Arabe': 'Arabe',
        'Langue Arabe ': 'Arabe', // Avec espace à la fin
        'Langue Arabe Admin': 'Arabe', // Ajout pour gérer le cas avec "Admin"
        Croyance: 'Croyance',
        'At-Tafsir': 'At-Tafsir',
        Fiqh: 'Fiqh',
        Hadith: 'Hadith',
        'Replay': 'replay', // Ajout pour les cours Replay
      };

      console.log('Catégorie du cours:', this.cours.category.name);
      console.log('Catégorie du cours (avec quotes):', `"${this.cours.category.name}"`);
      
      // Nettoyer le nom de catégorie avant le mapping
      const cleanCategoryName = this.cours.category.name.trim();
      const subjectName =
        categoryToSubjectMap[cleanCategoryName] ||
        categoryToSubjectMap[this.cours.category.name] ||
        this.cours.category.name;
      const classe = this.getFirstClasseId();

      // Normaliser le nom de la matière pour l'URL
      const normalizedSubjectName = this.normalizeForUrl(subjectName);
      const classeName = this.normalizeForUrl(this.getFirstClasseName()) || `classe-${classe}`;

      console.log('Navigation vers:', {
        categoryName: this.cours.category.name,
        subjectName,
        normalizedSubjectName,
        classe,
        classeName,
        lessonId: lesson.id,
      });

      console.log('URL finale:', `/cours/${normalizedSubjectName}/${classeName}/lesson/${lesson.id}`);
      this.router.navigate(['/cours', normalizedSubjectName, classeName, 'lesson', lesson.id]);
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
    // Retourner vers la page des classes pour cette matière
    const subjectName = this.getSubjectName();
    const normalizedSubjectName = this.normalizeForUrl(subjectName);
    const classeId = this.getFirstClasseId(); // Utiliser l'ID de la première classe
    console.log('Retour vers:', `/cours/${normalizedSubjectName}/${classeId}`);
    this.router.navigate(['/cours', normalizedSubjectName, classeId]);
  }


  getSubjectName(): string {
    // Utiliser les données du cours pour récupérer le nom de la matière
    if (this.cours && this.cours.category) {
      // Mapper les noms de catégories vers les noms de matières
      const categoryToSubjectMap: { [key: string]: string } = {
        'Langue Arabe': 'Arabe',
        'Langue Arabe ': 'Arabe', // Avec espace à la fin
        'Langue Arabe Admin': 'Arabe',
        Croyance: 'Croyance',
        'At-Tafsir': 'At-Tafsir',
        Fiqh: 'Fiqh',
        Hadith: 'Hadith',
      };
      
      // Nettoyer le nom de catégorie avant le mapping
      const cleanCategoryName = this.cours.category.name.trim();
      return categoryToSubjectMap[cleanCategoryName] || 
             categoryToSubjectMap[this.cours.category.name] || 
             this.cours.category.name;
    }
    
    // Fallback vers les paramètres de route si disponibles
    const subjectName = this.route.snapshot.paramMap.get('subjectName');
    if (subjectName) {
      return subjectName.charAt(0).toUpperCase() + subjectName.slice(1);
    }
    
    return 'Arabe'; // Valeur par défaut
  }

  getClasse(): string {
    // Utiliser les données du cours pour récupérer la classe
    const classeId = this.getFirstClasseId();
    if (classeId) {
      return classeId.toString();
    }
    
    // Fallback vers les paramètres de route si disponibles
    const classe = this.route.snapshot.paramMap.get('classe');
    if (classe) {
      return classe;
    }
    
    return '1'; // Valeur par défaut
  }

  // Méthodes helper pour gérer les classes multiples
  getFirstClasseId(): number | null {
    // Essayer de trouver la classe de l'enfant sélectionné
    const selectedChild = this.childContext.selectedChild();
    const selectedClasseId = selectedChild?.classe?.id;
    
    // Nouveau format : array de classes - chercher la classe de l'enfant
    if (this.cours?.classes && Array.isArray(this.cours.classes) && this.cours.classes.length > 0) {
      if (selectedClasseId) {
        const matchingClasse = this.cours.classes.find(classe => classe.id === selectedClasseId);
        if (matchingClasse) {
          return matchingClasse.id;
        }
      }
      // Fallback : première classe si pas de correspondance
      return this.cours.classes[0].id;
    }
    
    // Rétrocompatibilité : ancien format avec classe unique
    if (this.cours?.classe?.id) {
      return this.cours.classe.id;
    }
    
    // Fallback ultime : utiliser la classe de l'enfant sélectionné
    if (selectedClasseId) {
      return selectedClasseId;
    }
    
    return null;
  }

  getFirstClasseName(): string {
    // Essayer de trouver la classe de l'enfant sélectionné
    const selectedChild = this.childContext.selectedChild();
    const selectedClasseId = selectedChild?.classe?.id;
    
    // Nouveau format : array de classes - chercher la classe de l'enfant
    if (this.cours?.classes && Array.isArray(this.cours.classes) && this.cours.classes.length > 0) {
      if (selectedClasseId) {
        const matchingClasse = this.cours.classes.find(classe => classe.id === selectedClasseId);
        if (matchingClasse) {
          return matchingClasse.name;
        }
      }
      // Fallback : première classe si pas de correspondance
      return this.cours.classes[0].name;
    }
    
    // Rétrocompatibilité : ancien format avec classe unique
    if (this.cours?.classe?.name) {
      return this.cours.classe.name;
    }
    
    // Fallback ultime : utiliser la classe de l'enfant sélectionné
    if (selectedChild?.classe?.name) {
      return selectedChild.classe.name;
    }
    
    return 'Classe 1'; // Valeur par défaut
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
    const childClasse = newChild.classe?.id || 1;
    const courseClasse = this.cours?.classe?.id || 1;

    console.log(`Nouvel enfant classe ${childClasse}, cours classe ${courseClasse}`);

    // Rediriger vers matières pour forcer la sélection de la bonne classe
    console.log('Changement d\'enfant détecté - Redirection vers matières');
    // Forcer la navigation immédiatement
    window.location.href = '/matières';
  }

  private loadCourseData(courseId: number) {
    this.courseService.getCourseById(courseId).subscribe((data: any) => {
      this.cours = {
        ...data,
        lessons:
          data.lessons?.map((lesson: any) => ({
            ...lesson,
            expanded: false,
            completed: false,
          })) || [],
        enrollments: [],
        createdAt: (data as any).createdAt || '',
        updatedAt: (data as any).updatedAt || '',
        classe: data.classe || data.level || { id: 1, name: 'Classe par défaut' }, // ✅ Gérer la transition level → classe
      } as Course;

      this.organizeLessonsBySubcategory();
      this.mettreAJourProgression();
    });
  }

  // Méthodes helper pour les styles dynamiques des sous-catégories
  getSubcategoryIcon(subcategoryName: string): string {
    const iconMap: { [key: string]: string } = {
      // Arabe
      'Vocabulaire': 'fa-solid fa-book text-green-600',
      'Grammaire': 'fa-solid fa-pencil text-blue-600',
      'Lecture': 'fa-solid fa-book-open text-orange-600',
      'Écriture': 'fa-solid fa-pen-fancy text-purple-600',
      
      // Fiqh
      'Prière': 'fa-solid fa-mosque text-blue-600',
      'Jeûne': 'fa-solid fa-sun text-yellow-600',
      'Zakat': 'fa-solid fa-coins text-green-600',
      'Hajj': 'fa-solid fa-kaaba text-orange-600',
      
      // Croyance
      'Tawhid': 'fa-solid fa-star text-yellow-600',
      'Prophètes': 'fa-solid fa-user-tie text-blue-600',
      'Anges': 'fa-solid fa-dove text-white-600',
      'Destin': 'fa-solid fa-scroll text-purple-600',
      
      // Général
      'Replay': 'fa-solid fa-video text-indigo-600',
      'Leçons générales': 'fa-solid fa-graduation-cap text-gray-600'
    };

    // Recherche par correspondance partielle
    for (const [key, value] of Object.entries(iconMap)) {
      if (subcategoryName.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }

    // Icône par défaut pour toute sous-catégorie non mappée
    return 'fa-solid fa-graduation-cap text-gray-600';
  }

  getSubcategoryIconClass(subcategoryName: string, index: number): string {
    const colorClasses = [
      'bg-blue-100', 'bg-green-100', 'bg-orange-100', 'bg-purple-100', 
      'bg-indigo-100', 'bg-pink-100', 'bg-yellow-100', 'bg-red-100'
    ];
    
    return colorClasses[index % colorClasses.length];
  }

  getLessonButtonClass(subcategoryName: string, lessonIndex: number): string {
    const baseClasses = 'hover:bg-opacity-80';
    const colorMap: { [key: string]: string } = {
      // Arabe
      'Vocabulaire': 'bg-green-50 hover:bg-green-100',
      'Grammaire': 'bg-blue-50 hover:bg-blue-100',
      'Lecture': 'bg-orange-50 hover:bg-orange-100',
      'Écriture': 'bg-purple-50 hover:bg-purple-100',
      
      // Fiqh
      'Prière': 'bg-blue-50 hover:bg-blue-100',
      'Jeûne': 'bg-yellow-50 hover:bg-yellow-100',
      'Zakat': 'bg-green-50 hover:bg-green-100',
      'Hajj': 'bg-orange-50 hover:bg-orange-100',
      
      // Croyance
      'Tawhid': 'bg-yellow-50 hover:bg-yellow-100',
      'Prophètes': 'bg-blue-50 hover:bg-blue-100',
      'Anges': 'bg-indigo-50 hover:bg-indigo-100',
      'Destin': 'bg-purple-50 hover:bg-purple-100',
      
      // Général
      'Replay': 'bg-indigo-50 hover:bg-indigo-100',
      'Leçons générales': 'bg-gray-50 hover:bg-gray-100'
    };

    for (const [key, value] of Object.entries(colorMap)) {
      if (subcategoryName.toLowerCase().includes(key.toLowerCase())) {
        return `${value} ${baseClasses}`;
      }
    }

    // Couleur par défaut pour toute sous-catégorie non mappée
    return 'bg-gray-50 hover:bg-gray-100';
  }

  getLessonIconClass(subcategoryName: string): string {
    const colorMap: { [key: string]: string } = {
      // Arabe
      'Vocabulaire': 'text-green-600',
      'Grammaire': 'text-blue-600',
      'Lecture': 'text-orange-600',
      'Écriture': 'text-purple-600',
      
      // Fiqh
      'Prière': 'text-blue-600',
      'Jeûne': 'text-yellow-600',
      'Zakat': 'text-green-600',
      'Hajj': 'text-orange-600',
      
      // Croyance
      'Tawhid': 'text-yellow-600',
      'Prophètes': 'text-blue-600',
      'Anges': 'text-indigo-600',
      'Destin': 'text-purple-600',
      
      // Général
      'Replay': 'text-indigo-600',
      'Leçons générales': 'text-gray-600'
    };

    for (const [key, value] of Object.entries(colorMap)) {
      if (subcategoryName.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }

    // Couleur par défaut pour toute sous-catégorie non mappée
    return 'text-gray-600';
  }

  // Méthode pour normaliser les noms pour les URLs
  private normalizeForUrl(name: string): string {
    if (!name) return '';
    const normalized = name
      .toLowerCase()
      .replace(/\s+/g, '-')  // Remplacer les espaces par des tirets
      .replace(/[^a-z0-9-]/g, '')  // Enlever les caractères spéciaux
      .replace(/-+/g, '-')  // Remplacer les tirets multiples par un seul
      .replace(/^-|-$/g, '');  // Enlever les tirets en début/fin
    
    console.log(`normalizeForUrl("${name}") = "${normalized}"`);
    return normalized;
  }
}
