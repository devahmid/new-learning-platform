import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Exercise, ExerciseService } from '../exercise.service';

@Component({
  selector: 'app-exercise',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './exercise.component.html',
  styleUrl: './exercise.component.scss'
})
export class ExerciseComponent implements OnInit, OnDestroy {
  subject = '';
  level = '';
  dots: number[] = [];
  finished: boolean = false
  score: number = 0

  current = 1;
  total = 0;
  exercise: Exercise | null = null;
  selected: number | null = null;
  exercises: Exercise[] = [];
  
  private destroy$ = new Subject<void>();

  constructor(
    private exerciseService: ExerciseService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.subject = this.route.snapshot.paramMap.get('subject') || '';
    this.level = this.route.snapshot.paramMap.get('level') || '';

    this.exerciseService.getExercises(this.subject, this.level)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (exercises) => {
          this.exercises = exercises;
          this.total = exercises.length;
          if (exercises.length > 0) {
            this.exercise = exercises[this.current - 1];
          }
          this.dots = new Array(this.total).fill(0);
          console.log('Exercices chargés:', this.exercise);
        },
        error: (error) => {
          console.error('Erreur lors du chargement des exercices:', error);
          this.exercises = [];
          this.total = 0;
          this.exercise = null;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  selectAnswer(index: number) {
    this.selected = index;
    if (this.exercise && this.selected === this.exercise.answer) {
      this.score++;
    }
  }
  

  next() {
    if (this.current < this.exercises.length) {
      this.current++;
      this.exercise = this.exercises[this.current - 1];
      this.selected = null;
    } else {
      this.finished = true;
      //this.sendToBackend();
    }
  }
  

  previous() {
    if (this.current > 1) {
      this.current--;
      this.exercise = this.exercises[this.current - 1];
      this.selected = null;
    }
  }
  sendToBackend() {
    // this.exerciseService.submitResults(this.score, this.total).subscribe({
    //   next: () => console.log('Résultat envoyé'),
    //   error: err => console.error('Erreur envoi', err)
    // });
  }
  
}
