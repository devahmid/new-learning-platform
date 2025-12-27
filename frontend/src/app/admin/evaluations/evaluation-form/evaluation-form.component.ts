import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { EvaluationService } from '../../../services/evaluation.service';
import { CourseService } from '../../../services/course.service';
import { AdminService } from '../../admin.service';
import { ClasseService } from '../../../services/classe.service';
import { Evaluation, EvaluationQuestion, EvaluationSection, EvaluationOption, QuestionType } from '../../../models/evaluation.model';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { CalendarModule } from 'primeng/calendar';
import { MultiSelectModule } from 'primeng/multiselect';

@Component({
  selector: 'app-evaluation-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ToastModule,
    ButtonModule,
    InputTextModule,
    InputTextareaModule,
    DropdownModule,
    CheckboxModule,
    CalendarModule,
    MultiSelectModule
  ],
  providers: [MessageService],
  templateUrl: './evaluation-form.component.html',
  styleUrl: './evaluation-form.component.scss'
})
export class EvaluationFormComponent implements OnInit {
  evaluationForm: FormGroup;
  isEditMode = false;
  evaluationId: number | null = null;
  isLoading = false;
  courses: any[] = [];
  lessons: any[] = [];
  classes: any[] = []; // Liste des classes pour les évaluations générales
  
  questionTypes: { label: string; value: QuestionType }[] = [
    { label: 'Choix multiple', value: 'multiple_choice' },
    { label: 'Choix unique (Radio)', value: 'radio' },
    { label: 'Cases à cocher', value: 'checkbox' },
    { label: 'Texte court', value: 'text' },
    { label: 'Texte long', value: 'textarea' },
    { label: 'Note (1-5)', value: 'rating' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private evaluationService: EvaluationService,
    private courseService: CourseService,
    private adminService: AdminService,
    private classeService: ClasseService,
    private messageService: MessageService
  ) {
    this.evaluationForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      instructions: [''], // Instructions détaillées au début
      specialInstructions: [''], // Instructions spéciales (ex: email pour devoirs)
      courseId: [null],
      lessonId: [null],
      classeIds: [[]], // IDs des classes pour les évaluations générales
      isActive: [true],
      allowMultipleSubmissions: [false],
      showResults: [true],
      startDate: [null],
      endDate: [null],
      sections: this.fb.array([]), // Sections de l'évaluation
      questions: this.fb.array([])
    });
  }

  ngOnInit() {
    this.loadCourses();
    this.loadClasses();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.evaluationId = +id;
      this.loadEvaluation(+id);
    } else {
      this.addQuestion();
    }
  }

  loadClasses() {
    this.classeService.findAll().subscribe({
      next: (classes: any[]) => {
        this.classes = classes.filter(c => c.isActive);
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des classes:', err);
      }
    });
  }

  loadCourses() {
    this.adminService.getAllCourses().subscribe({
      next: (courses: any[]) => {
        this.courses = courses;
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des cours:', err);
      }
    });
  }

  onCourseChange(courseId: number) {
    if (courseId) {
      this.courseService.getCourseById(courseId).subscribe({
        next: (course: any) => {
          this.lessons = course.lessons || [];
        },
        error: (err: any) => {
          console.error('Erreur lors du chargement des leçons:', err);
        }
      });
    } else {
      this.lessons = [];
    }
  }

  loadEvaluation(id: number) {
    this.isLoading = true;
    this.evaluationService.getEvaluationById(id).subscribe({
      next: (evaluation: Evaluation) => {
        // Extraire les IDs des classes
        const classeIds = evaluation.classes ? evaluation.classes.map((c: any) => c.id) : [];
        
        this.evaluationForm.patchValue({
          title: evaluation.title,
          description: evaluation.description,
          instructions: evaluation.instructions || '',
          specialInstructions: evaluation.specialInstructions || '',
          courseId: evaluation.courseId,
          lessonId: evaluation.lessonId,
          classeIds: classeIds,
          isActive: evaluation.isActive,
          allowMultipleSubmissions: evaluation.allowMultipleSubmissions,
          showResults: evaluation.showResults,
          startDate: evaluation.startDate ? new Date(evaluation.startDate) : null,
          endDate: evaluation.endDate ? new Date(evaluation.endDate) : null
        });

        // Charger les sections
        const sectionsArray = this.sectionsFormArray;
        sectionsArray.clear();
        if (evaluation.sections && evaluation.sections.length > 0) {
          evaluation.sections.forEach((section: EvaluationSection) => {
            sectionsArray.push(this.fb.group({
              title: [section.title, Validators.required],
              description: [section.description || ''],
              order: [section.order]
            }));
          });
        }

        if (evaluation.courseId) {
          this.onCourseChange(evaluation.courseId);
        }

        // Charger les questions
        const questionsArray = this.evaluationForm.get('questions') as FormArray;
        questionsArray.clear();
        
        evaluation.questions.forEach((q: EvaluationQuestion, index: number) => {
          const questionGroup = this.createQuestionGroup(q);
          questionsArray.push(questionGroup);
        });

        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement de l\'évaluation:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger l\'évaluation'
        });
        this.isLoading = false;
      }
    });
  }

  get questionsFormArray(): FormArray {
    return this.evaluationForm.get('questions') as FormArray;
  }

  get sectionsFormArray(): FormArray {
    return this.evaluationForm.get('sections') as FormArray;
  }

  addSection() {
    const sectionsArray = this.sectionsFormArray;
    const newSection = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      order: [sectionsArray.length]
    });
    sectionsArray.push(newSection);
  }

  removeSection(index: number) {
    this.sectionsFormArray.removeAt(index);
    // Réorganiser les ordres
    this.sectionsFormArray.controls.forEach((control, i) => {
      control.patchValue({ order: i });
    });
  }

  moveSectionUp(index: number) {
    if (index > 0) {
      const sectionsArray = this.sectionsFormArray;
      const temp = sectionsArray.at(index);
      sectionsArray.removeAt(index);
      sectionsArray.insert(index - 1, temp);
      this.updateSectionOrders();
    }
  }

  moveSectionDown(index: number) {
    const sectionsArray = this.sectionsFormArray;
    if (index < sectionsArray.length - 1) {
      const temp = sectionsArray.at(index);
      sectionsArray.removeAt(index);
      sectionsArray.insert(index + 1, temp);
      this.updateSectionOrders();
    }
  }

  updateSectionOrders() {
    this.sectionsFormArray.controls.forEach((control, i) => {
      control.patchValue({ order: i });
    });
  }

  createQuestionGroup(question?: EvaluationQuestion): FormGroup {
    const group = this.fb.group({
      text: [question?.text || '', Validators.required],
      type: [question?.type || 'text', Validators.required],
      required: [question?.required ?? false],
      sectionId: [question?.sectionId || null], // ID de la section
      order: [question?.order || 0],
      placeholder: [question?.placeholder || ''],
      minLength: [question?.minLength || null],
      maxLength: [question?.maxLength || null],
      minRating: [question?.minRating || 1],
      maxRating: [question?.maxRating || 5],
      options: this.fb.array([])
    });

    // Ajouter les options si c'est une question à choix multiples
    if (question?.options && question.options.length > 0) {
      const optionsArray = group.get('options') as FormArray;
      question.options.forEach((option: EvaluationOption) => {
        optionsArray.push(this.fb.group({
          text: [option.text, Validators.required],
          order: [option.order || 0],
          isCorrect: [option.isCorrect || false]
        }));
      });
    }

    return group;
  }

  addQuestion() {
    const questionsArray = this.questionsFormArray;
    const newQuestion = this.createQuestionGroup();
    newQuestion.patchValue({ order: questionsArray.length });
    questionsArray.push(newQuestion);
  }

  removeQuestion(index: number) {
    this.questionsFormArray.removeAt(index);
    // Réorganiser les ordres
    this.questionsFormArray.controls.forEach((control, i) => {
      control.patchValue({ order: i });
    });
  }

  moveQuestionUp(index: number) {
    if (index > 0) {
      const questionsArray = this.questionsFormArray;
      const temp = questionsArray.at(index);
      questionsArray.removeAt(index);
      questionsArray.insert(index - 1, temp);
      this.updateQuestionOrders();
    }
  }

  moveQuestionDown(index: number) {
    const questionsArray = this.questionsFormArray;
    if (index < questionsArray.length - 1) {
      const temp = questionsArray.at(index);
      questionsArray.removeAt(index);
      questionsArray.insert(index + 1, temp);
      this.updateQuestionOrders();
    }
  }

  updateQuestionOrders() {
    this.questionsFormArray.controls.forEach((control, i) => {
      control.patchValue({ order: i });
    });
  }

  getQuestionOptions(index: number): FormArray {
    return this.questionsFormArray.at(index).get('options') as FormArray;
  }

  addOption(questionIndex: number) {
    const optionsArray = this.getQuestionOptions(questionIndex);
    optionsArray.push(this.fb.group({
      text: ['', Validators.required],
      order: [optionsArray.length],
      isCorrect: [false]
    }));
  }

  removeOption(questionIndex: number, optionIndex: number) {
    const optionsArray = this.getQuestionOptions(questionIndex);
    optionsArray.removeAt(optionIndex);
    // Réorganiser les ordres
    optionsArray.controls.forEach((control, i) => {
      control.patchValue({ order: i });
    });
  }

  onQuestionTypeChange(index: number) {
    const questionGroup = this.questionsFormArray.at(index);
    const type = questionGroup.get('type')?.value;
    const optionsArray = questionGroup.get('options') as FormArray;

    // Si c'est un type qui nécessite des options, s'assurer qu'il y en a au moins une
    if (['multiple_choice', 'radio', 'checkbox'].includes(type)) {
      if (optionsArray.length === 0) {
        this.addOption(index);
      }
    } else {
      // Sinon, vider les options
      while (optionsArray.length > 0) {
        optionsArray.removeAt(0);
      }
    }
  }

  needsOptions(type: QuestionType): boolean {
    return ['multiple_choice', 'radio', 'checkbox'].includes(type);
  }

  onSubmit() {
    if (this.evaluationForm.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulaire invalide',
        detail: 'Veuillez remplir tous les champs requis'
      });
      return;
    }

    const formValue = this.evaluationForm.value;
    const evaluation: Evaluation = {
      title: formValue.title,
      description: formValue.description,
      instructions: formValue.instructions || undefined,
      specialInstructions: formValue.specialInstructions || undefined,
      courseId: formValue.courseId || undefined,
      lessonId: formValue.lessonId || undefined,
      classeIds: formValue.classeIds && formValue.classeIds.length > 0 ? formValue.classeIds : undefined,
      isActive: formValue.isActive,
      allowMultipleSubmissions: formValue.allowMultipleSubmissions,
      showResults: formValue.showResults,
      startDate: formValue.startDate || undefined,
      endDate: formValue.endDate || undefined,
      sections: formValue.sections && formValue.sections.length > 0 
        ? formValue.sections.map((s: any, index: number) => ({
            title: s.title,
            description: s.description || undefined,
            order: index
          }))
        : undefined,
      questions: formValue.questions.map((q: any, index: number) => ({
        text: q.text,
        type: q.type,
        required: q.required,
        sectionId: q.sectionId !== null && q.sectionId !== undefined ? q.sectionId : undefined,
        order: index,
        placeholder: q.placeholder || undefined,
        minLength: q.minLength || undefined,
        maxLength: q.maxLength || undefined,
        minRating: q.minRating || undefined,
        maxRating: q.maxRating || undefined,
        options: q.options && q.options.length > 0 ? q.options.map((opt: any, optIndex: number) => ({
          text: opt.text,
          order: optIndex,
          isCorrect: opt.isCorrect || false
        })) : undefined
      }))
    };

    this.isLoading = true;

    if (this.isEditMode && this.evaluationId) {
      this.evaluationService.updateEvaluation(this.evaluationId, evaluation).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Évaluation mise à jour avec succès'
          });
          this.router.navigate(['/admin/evaluations']);
        },
        error: (err: any) => {
          console.error('Erreur lors de la mise à jour:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Impossible de mettre à jour l\'évaluation'
          });
          this.isLoading = false;
        }
      });
    } else {
      this.evaluationService.createEvaluation(evaluation).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Évaluation créée avec succès'
          });
          this.router.navigate(['/admin/evaluations']);
        },
        error: (err: any) => {
          console.error('Erreur lors de la création:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Impossible de créer l\'évaluation'
          });
          this.isLoading = false;
        }
      });
    }
  }

  cancel() {
    this.router.navigate(['/admin/evaluations']);
  }
}

