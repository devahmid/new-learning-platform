import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CourseService } from '../../../services/course.service';
import {
  Exercise,
  ExerciseQuestion,
  ExerciseAnswer,
} from '../../../models/exercise.model';

@Component({
  selector: 'app-exercise-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
})
export class ExerciseFormComponent implements OnInit {
  exerciseForm: FormGroup;
  loading = false;
  error: string | null = null;
  success: string | null = null;

  exerciseTypes = [
    { value: 'flashcard', label: 'Flashcard', icon: 'fa-clone' },
    { value: 'translation', label: 'Traduction', icon: 'fa-language' },
    { value: 'listening', label: 'Écoute', icon: 'fa-volume-up' },
    {
      value: 'multiple_choice',
      label: 'Choix multiple',
      icon: 'fa-list-check',
    },
    { value: 'fill_blank', label: 'Texte à trous', icon: 'fa-edit' },
  ];

  constructor(private fb: FormBuilder, private courseService: CourseService) {
    this.exerciseForm = this.createForm();
  }

  ngOnInit(): void {
    // Si on est en mode édition, charger les données de l'exercice
    // TODO: Implémenter la récupération de l'ID depuis la route
  }

  createForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      type: ['flashcard', Validators.required],
      order: [1, [Validators.required, Validators.min(1)]],
      isActive: [true],
      lessonId: [1, Validators.required], // TODO: Récupérer depuis la route ou un sélecteur
      questions: this.fb.array([]),
    });
  }

  get questionsArray(): FormArray {
    return this.exerciseForm.get('questions') as FormArray;
  }

  addQuestion(): void {
    const questionGroup = this.fb.group({
      text: ['', Validators.required],
      audioUrl: [''],
      metadata: this.fb.group({
        pronunciation: [''],
        difficulty: ['easy'],
        hints: this.fb.array([]),
      }),
      order: [this.questionsArray.length + 1],
      answers: this.fb.array([]),
    });

    this.questionsArray.push(questionGroup);
    this.addAnswer(this.questionsArray.length - 1);
  }

  removeQuestion(index: number): void {
    this.questionsArray.removeAt(index);
    this.updateQuestionOrders();
  }

  getAnswersArray(questionIndex: number): FormArray {
    return this.questionsArray.at(questionIndex).get('answers') as FormArray;
  }

  addAnswer(questionIndex: number): void {
    const answerGroup = this.fb.group({
      text: ['', Validators.required],
      isCorrect: [false],
      order: [this.getAnswersArray(questionIndex).length + 1],
    });

    this.getAnswersArray(questionIndex).push(answerGroup);
  }

  removeAnswer(questionIndex: number, answerIndex: number): void {
    this.getAnswersArray(questionIndex).removeAt(answerIndex);
    this.updateAnswerOrders(questionIndex);
  }

  updateQuestionOrders(): void {
    this.questionsArray.controls.forEach((control, index) => {
      control.get('order')?.setValue(index + 1);
    });
  }

  updateAnswerOrders(questionIndex: number): void {
    this.getAnswersArray(questionIndex).controls.forEach((control, index) => {
      control.get('order')?.setValue(index + 1);
    });
  }

  onCorrectAnswerChange(questionIndex: number, answerIndex: number): void {
    // Décocher toutes les autres réponses correctes pour cette question
    this.getAnswersArray(questionIndex).controls.forEach((control, index) => {
      if (index !== answerIndex) {
        control.get('isCorrect')?.setValue(false);
      }
    });
  }

  onSubmit(): void {
    if (this.exerciseForm.valid) {
      this.loading = true;
      this.error = null;
      this.success = null;

      const formData = this.exerciseForm.value;

      // TODO: Détecter si on est en mode édition ou création
      const isEditMode = false; // À implémenter avec la route

      if (isEditMode) {
        // TODO: Implémenter la mise à jour
        console.log("Mise à jour de l'exercice:", formData);
      } else {
        // Création d'un nouvel exercice
        this.courseService.createExerciseAdmin(formData).subscribe({
          next: (exercise) => {
            this.loading = false;
            this.success = 'Exercice créé avec succès !';
            this.exerciseForm.reset();
            this.questionsArray.clear();
            setTimeout(() => {
              // TODO: Navigation vers la liste ou l'édition
            }, 2000);
          },
          error: (error) => {
            this.loading = false;
            this.error = "Erreur lors de la création de l'exercice";
            console.error('Erreur:', error);
          },
        });
      }
    } else {
      this.markFormGroupTouched(this.exerciseForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach((arrayControl) => {
          if (arrayControl instanceof FormGroup) {
            this.markFormGroupTouched(arrayControl);
          }
        });
      }
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.exerciseForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} est requis`;
      if (field.errors['minlength'])
        return `${fieldName} doit contenir au moins ${field.errors['minlength'].requiredLength} caractères`;
      if (field.errors['min'])
        return `${fieldName} doit être supérieur à ${field.errors['min'].min}`;
    }
    return '';
  }
}
