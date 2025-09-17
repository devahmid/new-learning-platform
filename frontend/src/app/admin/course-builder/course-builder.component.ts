import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormArray,
  FormControl,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AdminService } from '../admin.service';
import {
  CategoryService,
  Category,
  Subcategory,
} from '../../services/category.service';
import { LevelService } from '../../services/level.service';
import { CoursService } from '../../cours/cours.service';
import { UploadService } from '../../services/upload.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ProgressBarModule } from 'primeng/progressbar';

interface CourseForm {
  title: string;
  description: string;
  categoryId: number;
  subcategoryId: number;
  levelId: number;
  videoUrl?: string;
  pdfUrl?: string;
  lessons: LessonForm[];
  quizzes: QuizForm[];
  exercises: ExerciseForm[];
}

interface LessonForm {
  title: string;
  content: string;
  videoUrl?: string;
  fileUrl?: string;
  order: number;
  duration: number; // en minutes
}

interface QuizForm {
  title: string;
  description: string;
  timeLimit: number; // en minutes
  passingScore: number; // score minimum pour réussir
  questions: QuestionForm[];
}

interface QuestionForm {
  text: string;
  options: OptionForm[];
}

interface OptionForm {
  text: string;
  isCorrect: boolean;
}

interface ExerciseForm {
  title: string;
  description: string;
  type: 'practice' | 'assignment' | 'project';
  instructions: string;
  estimatedTime: number; // en minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

@Component({
  selector: 'app-course-builder',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ToastModule, ProgressBarModule],
  templateUrl: './course-builder.component.html',
  styleUrls: ['./course-builder.component.scss'],
  providers: [MessageService]
})
export class CourseBuilderComponent implements OnInit {
  courseForm: FormGroup;
  isEditing = false;
  courseId?: number;
  isLoading = false;
  categories: Category[] = [];
  subcategories: Subcategory[] = [];
  levels: any[] = [];
  filteredSubcategories: Subcategory[] = [];
  
  // Upload properties
  isUploading = false;
  uploadProgress = 0;

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private categoryService: CategoryService,
    private levelService: LevelService,
    private coursService: CoursService,
    private uploadService: UploadService,
    private messageService: MessageService,
    private router: Router
  ) {
    this.courseForm = this.createCourseForm();
  }

  ngOnInit() {
    this.loadFormData();
  }

  private createCourseForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      categoryId: [null, Validators.required],
      subcategoryId: [null, Validators.required],
      levelId: [null, Validators.required],
      videoUrl: [''],
      pdfUrl: [''],
      lessons: this.fb.array([]),
      quizzes: this.fb.array([]),
      exercises: this.fb.array([]),
    });
  }

  /**
   * Extraire un tableau des données de l'API
   * Gère les cas où l'API retourne un objet au lieu d'un tableau
   */
  private extractArrayFromApiData(data: any): any[] {
    if (Array.isArray(data)) {
      return data;
    }
    
    if (data && typeof data === 'object') {
      // Si c'est un objet, essayer de trouver un tableau à l'intérieur
      if (data.data && Array.isArray(data.data)) {
        return data.data;
      }
      if (data.categories && Array.isArray(data.categories)) {
        return data.categories;
      }
      if (data.subcategories && Array.isArray(data.subcategories)) {
        return data.subcategories;
      }
      if (data.levels && Array.isArray(data.levels)) {
        return data.levels;
      }
      
      // Si c'est un objet avec des propriétés numériques, le convertir en tableau
      const values = Object.values(data);
      if (values.length > 0 && typeof values[0] === 'object') {
        return values as any[];
      }
    }
    
    console.warn('Impossible d\'extraire un tableau des données:', data);
    return [];
  }

  private loadFormData() {
    // Charger toutes les données en parallèle avec forkJoin
    forkJoin({
      categories: this.categoryService.getAllCategories(),
      subcategories: this.categoryService.getAllSubcategories(),
      levels: this.levelService.getAll(),
    }).subscribe({
      next: (data) => {
        console.log('Données brutes de l\'API:', data);
        
        // Gérer les différents formats de données de l'API
        this.categories = this.extractArrayFromApiData(data.categories);
        this.subcategories = this.extractArrayFromApiData(data.subcategories);
        this.levels = Array.isArray(data.levels) ? data.levels : [];

        console.log('Données chargées:', {
          categories: this.categories.length,
          subcategories: this.subcategories.length,
          levels: this.levels.length,
        });
        
        console.log('Première catégorie:', this.categories[0]);
        console.log('Première sous-catégorie:', this.subcategories[0]);
        console.log('Premier niveau:', this.levels[0]);

        // Maintenant que toutes les données sont chargées, configurer le listener
        this.setupCategoryListener();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des données:', error);
        this.categories = [];
        this.subcategories = [];
        this.levels = [];
      },
    });
  }

  private setupCategoryListener() {
    // Écouter les changements de catégorie pour filtrer les sous-catégories
    this.courseForm.get('categoryId')?.valueChanges.subscribe((categoryId) => {
      this.onCategoryChange(categoryId);
    });
  }

  onCategoryChange(categoryId: number) {
    if (categoryId) {
      // Convertir categoryId en number si c'est une string
      const numericCategoryId =
        typeof categoryId === 'string' ? parseInt(categoryId) : categoryId;

      // Vérifier que subcategories est un tableau
      if (Array.isArray(this.subcategories)) {
        this.filteredSubcategories = this.subcategories.filter(
          (sub) => sub.categoryId === numericCategoryId
        );
      } else {
        console.error('subcategories n\'est pas un tableau:', this.subcategories);
        this.filteredSubcategories = [];
      }

      // Réinitialiser la sous-catégorie sélectionnée
      this.courseForm.patchValue({ subcategoryId: null });
    } else {
      this.filteredSubcategories = [];
    }
  }

  // Gestion des leçons
  get lessonsArray(): FormArray {
    return this.courseForm.get('lessons') as FormArray;
  }

  // Getters pour les contrôles de leçon
  getLessonControl(index: number, field: string): FormControl {
    return this.lessonsArray.controls[index].get(field) as FormControl;
  }

  // Getters pour les contrôles de quiz
  getQuizControl(index: number, field: string): FormControl {
    return this.quizzesArray.controls[index].get(field) as FormControl;
  }

  // Getters pour les contrôles d'exercice
  getExerciseControl(index: number, field: string): FormControl {
    return this.exercisesArray.controls[index].get(field) as FormControl;
  }

  // Getters pour les contrôles de question
  getQuestionControl(
    quizIndex: number,
    questionIndex: number,
    field: string
  ): FormControl {
    return this.getQuestionsArray(quizIndex).controls[questionIndex].get(
      field
    ) as FormControl;
  }

  // Getters pour les contrôles du cours principal
  get videoUrlControl(): FormControl {
    return this.courseForm.get('videoUrl') as FormControl;
  }

  get pdfUrlControl(): FormControl {
    return this.courseForm.get('pdfUrl') as FormControl;
  }

  addLesson() {
    const lesson = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
      videoUrl: [''],
      fileUrl: [''],
      order: [this.lessonsArray.length + 1],
      duration: [30, [Validators.required, Validators.min(1)]],
    });
    this.lessonsArray.push(lesson);
  }

  removeLesson(index: number) {
    this.lessonsArray.removeAt(index);
    this.updateLessonOrder();
  }

  private updateLessonOrder() {
    this.lessonsArray.controls.forEach((control, index) => {
      control.patchValue({ order: index + 1 });
    });
  }

  // Gestion des quiz
  get quizzesArray(): FormArray {
    return this.courseForm.get('quizzes') as FormArray;
  }

  addQuiz() {
    const quiz = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      timeLimit: [15, [Validators.required, Validators.min(1)]],
      passingScore: [70, [Validators.required, Validators.min(0), Validators.max(100)]],
      questions: this.fb.array([]),
    });
    this.quizzesArray.push(quiz);
  }

  removeQuiz(index: number) {
    this.quizzesArray.removeAt(index);
  }

  // Gestion des questions
  getQuestionsArray(quizIndex: number): FormArray {
    return this.quizzesArray.at(quizIndex).get('questions') as FormArray;
  }

  addQuestion(quizIndex: number) {
    const question = this.fb.group({
      text: ['', Validators.required],
      options: this.fb.array([
        this.fb.group({ text: ['', Validators.required], isCorrect: [false] }),
        this.fb.group({ text: ['', Validators.required], isCorrect: [false] }),
        this.fb.group({ text: ['', Validators.required], isCorrect: [false] }),
        this.fb.group({ text: ['', Validators.required], isCorrect: [false] })
      ]),
    });
    this.getQuestionsArray(quizIndex).push(question);
  }

  removeQuestion(quizIndex: number, questionIndex: number) {
    this.getQuestionsArray(quizIndex).removeAt(questionIndex);
  }

  // Gestion des options de questions
  getOptionsArray(quizIndex: number, questionIndex: number): FormArray {
    return this.getQuestionsArray(quizIndex).at(questionIndex).get('options') as FormArray;
  }

  addOption(quizIndex: number, questionIndex: number) {
    const option = this.fb.group({
      text: ['', Validators.required],
      isCorrect: [false]
    });
    this.getOptionsArray(quizIndex, questionIndex).push(option);
  }

  removeOption(quizIndex: number, questionIndex: number, optionIndex: number) {
    const optionsArray = this.getOptionsArray(quizIndex, questionIndex);
    if (optionsArray.length > 2) { // Garder au moins 2 options
      optionsArray.removeAt(optionIndex);
    }
  }

  // Getters pour les contrôles d'options
  getOptionTextControl(quizIndex: number, questionIndex: number, optionIndex: number): FormControl {
    return this.getOptionsArray(quizIndex, questionIndex).at(optionIndex).get('text') as FormControl;
  }

  getOptionCorrectControl(quizIndex: number, questionIndex: number, optionIndex: number): FormControl {
    return this.getOptionsArray(quizIndex, questionIndex).at(optionIndex).get('isCorrect') as FormControl;
  }

  // Gestion des exercices
  get exercisesArray(): FormArray {
    return this.courseForm.get('exercises') as FormArray;
  }

  addExercise() {
    const exercise = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      type: ['practice', Validators.required],
      instructions: ['', Validators.required],
      estimatedTime: [45, [Validators.required, Validators.min(1)]],
      difficulty: ['beginner', Validators.required],
    });
    this.exercisesArray.push(exercise);
  }

  removeExercise(index: number) {
    this.exercisesArray.removeAt(index);
  }

  // Sauvegarder le cours
  async saveCourse() {
    if (this.courseForm.valid) {
      this.isLoading = true;
      try {
        const courseData = this.courseForm.value;

        if (this.isEditing && this.courseId) {
          // Mise à jour
          await this.adminService
            .updateCourse(this.courseId, courseData)
            .toPromise();
        } else {
          // Création
          const result = await this.adminService
            .createCourse(courseData)
            .toPromise();
          this.courseId = result.id;
          this.isEditing = true;
        }

        console.log('Cours sauvegardé avec succès !');
        // Rediriger vers la liste des cours ou le dashboard
        this.router.navigate(['/admin/courses']);
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
      } finally {
        this.isLoading = false;
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.courseForm.controls).forEach((key) => {
      const control = this.courseForm.get(key);
      control?.markAsTouched();
    });
  }

  // Navigation
  goBack() {
    this.router.navigate(['/admin']);
  }

  previewCourse() {
    // TODO: Implémenter la prévisualisation
    console.log('Prévisualisation du cours:', this.courseForm.value);
  }

  // ===== MÉTHODES D'UPLOAD DE FICHIERS =====

  /**
   * Upload un fichier et retourne l'URL
   */
  uploadFile(file: File, targetControl: FormControl, fileType: string = 'file'): void {
    if (!file) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Aucun fichier',
        detail: 'Veuillez sélectionner un fichier à uploader'
      });
      return;
    }

    // Validation du fichier
    if (!this.validateFile(file)) {
      return;
    }

    this.isUploading = true;
    this.uploadProgress = 0;

    // Utiliser le service d'upload réel
    this.uploadService.uploadFile(file).subscribe({
      next: (response) => {
        console.log('✅ Fichier uploadé avec succès:', response.url);
        
        // Mettre à jour le contrôle du formulaire
        targetControl.setValue(response.url);
        
        this.messageService.add({
          severity: 'success',
          summary: 'Upload réussi',
          detail: `${fileType} uploadé avec succès`
        });
        
        this.isUploading = false;
        this.uploadProgress = 100;
      },
      error: (error) => {
        console.error('❌ Erreur lors de l\'upload:', error);
        
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur d\'upload',
          detail: `Impossible d'uploader le ${fileType}. Veuillez réessayer.`
        });
        
        this.isUploading = false;
        this.uploadProgress = 0;
      }
    });
  }

  /**
   * Obtenir l'extension d'un fichier
   */
  private getFileExtension(file: File): string {
    return file.name.split('.').pop() || '';
  }

  /**
   * Upload pour le cours principal (vidéo/PDF)
   */
  onCourseFileUpload(event: any, field: 'videoUrl' | 'pdfUrl'): void {
    const file = event.target.files?.[0];
    if (!file) return;

    const control = this.courseForm.get(field) as FormControl;
    if (control) {
      this.uploadFile(file, control, field === 'videoUrl' ? 'Vidéo' : 'PDF');
    }
  }

  /**
   * Upload pour une leçon spécifique
   */
  onLessonFileUpload(event: any, lessonIndex: number, field: 'videoUrl' | 'fileUrl'): void {
    const file = event.target.files?.[0];
    if (!file) return;

    const control = this.getLessonControl(lessonIndex, field);
    this.uploadFile(file, control, field === 'videoUrl' ? 'Vidéo de leçon' : 'Fichier de leçon');
  }

  /**
   * Validation des fichiers
   */
  private validateFile(file: File): boolean {
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'video/mp4',
      'video/webm',
      'video/avi',
      'audio/mp3',
      'audio/wav',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (file.size > maxSize) {
      this.messageService.add({
        severity: 'error',
        summary: 'Fichier trop volumineux',
        detail: 'La taille maximale est de 50MB'
      });
      return false;
    }

    if (!allowedTypes.includes(file.type)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Type de fichier non autorisé',
        detail: 'Veuillez sélectionner un fichier valide (image, vidéo, PDF, document)'
      });
      return false;
    }

    return true;
  }

  /**
   * Supprimer un fichier uploadé
   */
  removeFile(control: FormControl): void {
    control.setValue('');
    this.messageService.add({
      severity: 'info',
      summary: 'Fichier supprimé',
      detail: 'Le fichier a été retiré du formulaire'
    });
  }

  /**
   * Obtenir l'URL d'un fichier pour l'affichage
   */
  getFileUrl(control: FormControl): string | null {
    return control.value || null;
  }

  /**
   * Vérifier si un fichier est uploadé
   */
  hasFile(control: FormControl): boolean {
    return !!(control.value && control.value.trim() !== '');
  }

  /**
   * Obtenir le nom du fichier à partir de l'URL
   */
  getFileName(url: string): string {
    if (!url) return '';
    const parts = url.split('/');
    return parts[parts.length - 1] || 'Fichier';
  }

  /**
   * Obtenir l'icône selon le type de fichier
   */
  getFileIcon(url: string): string {
    if (!url) return 'pi-file';
    
    const extension = url.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'pi-file-pdf';
      case 'mp4':
      case 'webm':
      case 'avi':
        return 'pi-video';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'pi-image';
      case 'mp3':
      case 'wav':
        return 'pi-volume-up';
      case 'doc':
      case 'docx':
        return 'pi-file-word';
      default:
        return 'pi-file';
    }
  }
}
