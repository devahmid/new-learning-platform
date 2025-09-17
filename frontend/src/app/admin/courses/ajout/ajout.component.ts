import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AdminService } from '../../admin.service';

interface CourseForm {
  title: string;
  description: string;
  categoryId: number;
  subcategoryId: number;
  levelId: number;
  videoUrl?: string;
  pdfUrl?: string;
  instructorId?: number;
  status: 'draft' | 'published';
  lessons: LessonForm[];
  quizzes: QuizForm[];
  exercises: ExerciseForm[];
}

interface LessonForm {
  title: string;
  description: string;
  content: string;
  duration: number;
  videoUrl?: string;
  fileUrl?: string;
  order: number;
}

interface QuizForm {
  title: string;
  description: string;
  timeLimit: number;
  passingScore: number;
  questions: QuestionForm[];
}

interface QuestionForm {
  text: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  options?: string[];
  correctAnswer: string;
  points: number;
}

interface ExerciseForm {
  title: string;
  description: string;
  type: 'practice' | 'assignment' | 'project';
  estimatedTime: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructions: string;
}

@Component({
  selector: 'app-ajout',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './ajout.component.html',
  styleUrl: './ajout.component.scss',
})
export class AjoutComponent implements OnInit {
  courseForm: FormGroup;
  isLoading = false;
  hasError = false;
  errorMessage = '';
  isSubmitting = false;

  // Mode édition
  isEditMode = false;
  courseId: number | null = null;
  courseToEdit: any = null;

  // Données de référence
  categories: any[] = [];
  subcategories: any[] = [];
  levels: any[] = [];
  instructors: any[] = [];

  // Étapes du formulaire
  currentStep = 1;
  totalSteps = 4;

  // Prévisualisation
  showPreview = false;

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    public router: Router,
    private route: ActivatedRoute
  ) {
    this.courseForm = this.createCourseForm();
  }

  ngOnInit() {
    // Vérifier si on est en mode édition
    this.courseId = this.route.snapshot.paramMap.get('id') ? Number(this.route.snapshot.paramMap.get('id')) : null;
    this.isEditMode = !!this.courseId;
    
    this.loadFormData();
    
    // Si en mode édition, charger les données du cours
    if (this.isEditMode && this.courseId) {
      this.loadCourseForEdit(this.courseId);
    }
  }

  // 🚀 Créer le formulaire
  private createCourseForm(): FormGroup {
    return this.fb.group({
      title: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
        ],
      ],
      description: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(500),
        ],
      ],
      categoryId: [null, Validators.required],
      subcategoryId: [null, Validators.required],
      levelId: [null, Validators.required],
      videoUrl: [''],
      pdfUrl: [''],
      instructorId: [null],
      status: ['draft'],
      lessons: this.fb.array([]),
      quizzes: this.fb.array([]),
      exercises: this.fb.array([]),
    });
  }

  // 📂 Charger les données de référence
  async loadFormData() {
    try {
      this.isLoading = true;

      // Charger les catégories, sous-catégories et niveaux depuis l'API
      const [categories, subcategories, levels] = await Promise.all([
        this.adminService.getCategories().toPromise(),
        this.adminService.getSubcategories().toPromise(),
        this.adminService.getLevels().toPromise(),
      ]);

      this.categories = categories || [];
      this.subcategories = subcategories || [];
      this.levels = levels || [];

      // Instructeurs simulés pour l'instant
      this.instructors = [
        { id: 1, name: 'Ahmed Benali', specialty: 'Langues' },
        { id: 2, name: 'Marie Dubois', specialty: 'Mathématiques' },
        { id: 3, name: 'Pierre Martin', specialty: 'Sciences' },
      ];
    } catch (error) {
      console.error('Erreur API, utilisation des données par défaut:', error);
      // Fallback vers les données simulées
      this.categories = [
        { id: 1, name: 'Langues' },
        { id: 2, name: 'Sciences' },
        { id: 3, name: 'Mathématiques' },
        { id: 4, name: 'Histoire' },
        { id: 5, name: 'Géographie' },
      ];

      this.subcategories = [
        { id: 1, name: 'Arabe', categoryId: 1 },
        { id: 2, name: 'Français', categoryId: 1 },
        { id: 3, name: 'Anglais', categoryId: 1 },
        { id: 4, name: 'Physique', categoryId: 2 },
        { id: 5, name: 'Chimie', categoryId: 2 },
        { id: 6, name: 'Algèbre', categoryId: 3 },
        { id: 7, name: 'Géométrie', categoryId: 3 },
      ];

      this.levels = [
        { id: 1, name: 'Débutant' },
        { id: 2, name: 'Intermédiaire' },
        { id: 3, name: 'Avancé' },
      ];

      this.instructors = [
        { id: 1, name: 'Ahmed Benali', specialty: 'Langues' },
        { id: 2, name: 'Marie Dubois', specialty: 'Mathématiques' },
        { id: 3, name: 'Pierre Martin', specialty: 'Sciences' },
      ];

      this.hasError = true;
      this.errorMessage =
        "Erreur lors du chargement des données depuis l'API, utilisation des données par défaut";
    } finally {
      this.isLoading = false;
    }
  }

  // 📁 Gérer l'upload de fichiers
  onFileSelected(event: any, field: 'videoUrl' | 'pdfUrl') {
    const file = event.target.files[0];
    if (file) {
      // Ici vous pouvez implémenter l'upload vers votre serveur
      // Pour l'instant, on simule avec une URL locale
      const fileUrl = URL.createObjectURL(file);
      this.courseForm.patchValue({ [field]: fileUrl });
      console.log(`Fichier sélectionné pour ${field}:`, file.name);
    }
  }

  // 📁 Gérer l'upload de fichiers pour les leçons
  onLessonFileSelected(event: any, lessonIndex: number, field: 'videoUrl' | 'fileUrl') {
    const file = event.target.files[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      this.lessonsArray.at(lessonIndex).patchValue({ [field]: fileUrl });
      console.log(`Fichier sélectionné pour leçon ${lessonIndex} ${field}:`, file.name);
    }
  }

  // 📖 Charger un cours pour édition
  private async loadCourseForEdit(courseId: number) {
    try {
      this.isLoading = true;
      this.errorMessage = '';

      const course = await this.adminService.getCourseById(courseId).toPromise();
      this.courseToEdit = course;

      console.log('Cours récupéré pour édition:', course);
      console.log('URLs trouvées - videoUrl:', course.videoUrl, 'pdfUrl:', course.pdfUrl);

      // Remplir le formulaire avec les données du cours
      this.courseForm.patchValue({
        title: course.title,
        description: course.description,
        categoryId: course.category?.id || course.categoryId,
        subcategoryId: course.subcategory?.id || course.subcategoryId,
        levelId: course.level?.id || course.levelId,
        videoUrl: course.videoUrl || course.video_url || course.video || '',
        pdfUrl: course.pdfUrl || course.fileUrl || course.pdf_url || course.file_url || course.file || '',
        instructorId: course.instructor?.id || course.instructorId,
        status: course.status || 'draft'
      });

      console.log('Formulaire rempli avec:', this.courseForm.value);

      // Charger les leçons si elles existent
      if (course.lessons && course.lessons.length > 0) {
        console.log('Leçons trouvées:', course.lessons);
        this.lessonsArray.clear();
        course.lessons.forEach((lesson: any, index: number) => {
          this.addLesson();
          const lastIndex = this.lessonsArray.length - 1;
          console.log(`Chargement leçon ${index}:`, lesson);
          this.lessonsArray.at(lastIndex).patchValue({
            title: lesson.title || '',
            description: lesson.description || '',
            content: lesson.content || '',
            duration: lesson.duration || 0,
            videoUrl: lesson.videoUrl || lesson.video_url || lesson.video || '',
            fileUrl: lesson.fileUrl || lesson.file_url || lesson.file || '',
            order: lesson.order || lastIndex + 1
          });
        });
        console.log('Leçons chargées dans le formulaire:', this.lessonsArray.value);
      }

      // Charger les quiz si ils existent
      if (course.quizzes && course.quizzes.length > 0) {
        this.quizzesArray.clear();
        course.quizzes.forEach((quiz: any) => {
          this.addQuiz();
          const lastIndex = this.quizzesArray.length - 1;
          this.quizzesArray.at(lastIndex).patchValue({
            title: quiz.title,
            description: quiz.description || '',
            timeLimit: quiz.timeLimit || 30,
            passingScore: quiz.passingScore || 70
          });
        });
      }

      console.log('Cours chargé pour édition:', course);
    } catch (error) {
      console.error('Erreur lors du chargement du cours:', error);
      this.errorMessage = 'Erreur lors du chargement du cours à modifier';
    } finally {
      this.isLoading = false;
    }
  }

  // 🔄 Navigation entre étapes
  nextStep() {
    if (
      this.currentStep < this.totalSteps &&
      this.isStepValid(this.currentStep)
    ) {
      this.currentStep++;
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  goToStep(step: number) {
    if (step >= 1 && step <= this.totalSteps) {
      this.currentStep = step;
    }
  }

  // ✅ Validation des étapes
  isStepValid(step: number): boolean {
    switch (step) {
      case 1: // Informations de base
        return !!(
          this.courseForm.get('title')?.valid &&
          this.courseForm.get('description')?.valid &&
          this.courseForm.get('categoryId')?.valid &&
          this.courseForm.get('subcategoryId')?.valid &&
          this.courseForm.get('levelId')?.valid
        );

      case 2: // Leçons
        return this.lessonsArray.length > 0 && this.lessonsArray.valid;

      case 3: // Quiz et exercices
        return true; // Optionnel

      case 4: // Révision
        return this.courseForm.valid;

      default:
        return false;
    }
  }

  // 📚 Gestion des leçons
  get lessonsArray(): FormArray {
    return this.courseForm.get('lessons') as FormArray;
  }

  addLesson() {
    const lesson = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      content: ['', [Validators.required, Validators.minLength(20)]],
      duration: [
        30,
        [Validators.required, Validators.min(5), Validators.max(180)],
      ],
      videoUrl: [''],
      fileUrl: [''],
      order: [this.lessonsArray.length + 1],
    });

    this.lessonsArray.push(lesson);
  }

  removeLesson(index: number) {
    this.lessonsArray.removeAt(index);
    this.updateLessonOrder();
  }

  updateLessonOrder() {
    this.lessonsArray.controls.forEach((control, index) => {
      control.patchValue({ order: index + 1 });
    });
  }

  // 🎯 Gestion des quiz
  get quizzesArray(): FormArray {
    return this.courseForm.get('quizzes') as FormArray;
  }

  addQuiz() {
    const quiz = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      timeLimit: [
        30,
        [Validators.required, Validators.min(5), Validators.max(120)],
      ],
      passingScore: [
        70,
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      questions: this.fb.array([]),
    });

    this.quizzesArray.push(quiz);
  }

  removeQuiz(index: number) {
    this.quizzesArray.removeAt(index);
  }

  // ❓ Gestion des questions
  getQuestionsArray(quizIndex: number): FormArray {
    return this.quizzesArray.at(quizIndex).get('questions') as FormArray;
  }

  addQuestion(quizIndex: number) {
    const question = this.fb.group({
      text: ['', [Validators.required, Validators.minLength(5)]],
      type: ['multiple_choice', Validators.required],
      options: this.fb.array(['', '', '', '']),
      correctAnswer: ['', Validators.required],
      points: [1, [Validators.required, Validators.min(1), Validators.max(10)]],
    });

    this.getQuestionsArray(quizIndex).push(question);
  }

  removeQuestion(quizIndex: number, questionIndex: number) {
    this.getQuestionsArray(quizIndex).removeAt(questionIndex);
  }

  // 🏃 Gestion des exercices
  get exercisesArray(): FormArray {
    return this.courseForm.get('exercises') as FormArray;
  }

  addExercise() {
    const exercise = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      type: ['practice', Validators.required],
      estimatedTime: [
        60,
        [Validators.required, Validators.min(15), Validators.max(480)],
      ],
      difficulty: ['beginner', Validators.required],
      instructions: ['', [Validators.required, Validators.minLength(20)]],
    });

    this.exercisesArray.push(exercise);
  }

  removeExercise(index: number) {
    this.exercisesArray.removeAt(index);
  }

  // 💾 Sauvegarder le cours
  async saveCourse() {
    if (this.courseForm.valid) {
      try {
        this.isSubmitting = true;
        this.hasError = false;

        const courseData = this.courseForm.value;

        // Nettoyer les données pour l'API
        const cleanedData = {
          title: courseData.title,
          description: courseData.description,
          categoryId: courseData.categoryId,
          subcategoryId: courseData.subcategoryId,
          levelId: courseData.levelId,
          instructorId: courseData.instructorId,
          videoUrl: courseData.videoUrl || null,
          pdfUrl: courseData.pdfUrl || null,
          status: courseData.status,
          // Convertir les leçons au format attendu par l'API
          lessons: courseData.lessons?.map((lesson: any) => ({
            title: lesson.title,
            description: lesson.description || '',
            content: lesson.content || '',
            duration: lesson.duration || 0,
            videoUrl: lesson.videoUrl || null,
            fileUrl: lesson.fileUrl || null,
            order: lesson.order || 0
          })) || [],
          // Convertir les quiz au format attendu par l'API
          quizzes: courseData.quizzes?.map((quiz: any) => ({
            title: quiz.title,
            description: quiz.description || '',
            timeLimit: quiz.timeLimit || 30,
            passingScore: quiz.passingScore || 70
          })) || []
        };

        console.log('Données nettoyées pour l\'API:', cleanedData);

        let savedCourse;
        
        if (this.isEditMode && this.courseId) {
          // Mode édition - mettre à jour le cours existant
          console.log('Mise à jour du cours:', cleanedData);
          savedCourse = await this.adminService
            .updateCourse(this.courseId, cleanedData)
            .toPromise();
          console.log('Cours mis à jour avec succès:', savedCourse);
        } else {
          // Mode création - créer un nouveau cours
          console.log('Création du cours:', cleanedData);
          savedCourse = await this.adminService
            .createCourse(cleanedData)
            .toPromise();
          console.log('Cours créé avec succès:', savedCourse);
        }

        // Redirection vers la liste des cours
        this.router.navigate(['/admin/courses/liste']);
      } catch (error) {
        this.hasError = true;
        this.errorMessage =
          'Erreur lors de la sauvegarde du cours: ' + (error as any)?.message ||
          'Erreur inconnue';
        console.error('Erreur saveCourse:', error);
      } finally {
        this.isSubmitting = false;
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  // 🔍 Marquer tous les champs comme touchés
  private markFormGroupTouched() {
    Object.keys(this.courseForm.controls).forEach((key) => {
      const control = this.courseForm.get(key);
      if (control instanceof FormGroup) {
        this.markFormGroupTouched();
      } else {
        control?.markAsTouched();
      }
    });
  }

  // 📊 Prévisualisation
  togglePreview() {
    this.showPreview = !this.showPreview;
  }

  // 🎨 Utilitaires
  getStepClass(step: number): string {
    if (step < this.currentStep) {
      return 'bg-green-500 text-white';
    } else if (step === this.currentStep) {
      return 'bg-blue-500 text-white';
    } else {
      return 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300';
    }
  }

  getStepIcon(step: number): string {
    if (step < this.currentStep) {
      return 'fa-solid fa-check';
    } else if (step === this.currentStep) {
      return 'fa-solid fa-edit';
    } else {
      return 'fa-solid fa-circle';
    }
  }

  // 🔄 Filtrage des sous-catégories
  get filteredSubcategories(): any[] {
    const categoryId = this.courseForm.get('categoryId')?.value;
    if (!categoryId) return [];
    return this.subcategories.filter((sub) => sub.categoryId === categoryId);
  }

  // 📝 Validation des URLs
  isValidUrl(url: string): boolean {
    if (!url) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Méthodes helper pour le template
  getCategoryName(categoryId: number | null): string {
    if (!categoryId) return 'Non définie';
    const category = this.categories.find((c) => c.id === categoryId);
    return category?.name || 'Non définie';
  }

  getSubcategoryName(subcategoryId: number | null): string {
    if (!subcategoryId) return 'Non définie';
    const subcategory = this.subcategories.find((s) => s.id === subcategoryId);
    return subcategory?.name || 'Non définie';
  }

  getLevelName(levelId: number | null): string {
    if (!levelId) return 'Non défini';
    const level = this.levels.find((l) => l.id === levelId);
    return level?.name || 'Non défini';
  }
}
