import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CourseService } from '../../../services/course.service';
import { Exercise } from '../../../models/exercise.model';

@Component({
  selector: 'app-exercise-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ExerciseListComponent implements OnInit {
  exercises: Exercise[] = [];
  loading = false;
  error: string | null = null;
  success: string | null = null;

  // Pagination
  currentPage = 1;
  totalPages = 1;
  totalItems = 0;
  itemsPerPage = 10;

  // Filtres
  selectedType = '';
  selectedLessonId: number | null = null;

  constructor(private courseService: CourseService, private router: Router) {}

  ngOnInit(): void {
    this.loadExercises();
  }

  loadExercises(): void {
    this.loading = true;
    this.error = null;

    this.courseService
      .getAllExercises(
        this.currentPage,
        this.itemsPerPage,
        this.selectedLessonId || undefined,
        this.selectedType || undefined
      )
      .subscribe({
        next: (response) => {
          this.exercises = response.exercises;
          this.totalItems = response.total;
          this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Erreur lors du chargement des exercices';
          this.loading = false;
          console.error('Erreur:', error);
        },
      });
  }

  deleteExercise(exerciseId: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet exercice ?')) {
      this.courseService.deleteExerciseAdmin(exerciseId).subscribe({
        next: () => {
          this.success = 'Exercice supprimé avec succès';
          this.loadExercises();
          setTimeout(() => (this.success = null), 3000);
        },
        error: (error) => {
          this.error = "Erreur lors de la suppression de l'exercice";
          console.error('Erreur:', error);
        },
      });
    }
  }

  editExercise(exerciseId: number): void {
    this.router.navigate(['/admin/exercises/edit', exerciseId]);
  }

  createExercise(): void {
    this.router.navigate(['/admin/exercises/create']);
  }

  duplicateExercise(exerciseId: number): void {
    this.courseService.duplicateExerciseAdmin(exerciseId).subscribe({
      next: () => {
        this.success = 'Exercice dupliqué avec succès';
        this.loadExercises();
        setTimeout(() => (this.success = null), 3000);
      },
      error: (error) => {
        this.error = "Erreur lors de la duplication de l'exercice";
        console.error('Erreur:', error);
      },
    });
  }

  toggleExerciseStatus(exerciseId: number): void {
    this.courseService.toggleExerciseStatusAdmin(exerciseId).subscribe({
      next: () => {
        this.success = "Statut de l'exercice modifié";
        this.loadExercises();
        setTimeout(() => (this.success = null), 3000);
      },
      error: (error) => {
        this.error = 'Erreur lors de la modification du statut';
        console.error('Erreur:', error);
      },
    });
  }

  // Pagination
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadExercises();
    }
  }

  // Filtres
  onTypeFilterChange(): void {
    this.currentPage = 1;
    this.loadExercises();
  }

  onLessonFilterChange(): void {
    this.currentPage = 1;
    this.loadExercises();
  }

  clearFilters(): void {
    this.selectedType = '';
    this.selectedLessonId = null;
    this.currentPage = 1;
    this.loadExercises();
  }

  // Exposer Math pour le template
  Math = Math;
}
