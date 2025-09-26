import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Exercise,
  ExerciseProgress,
  ExerciseResult,
} from '../models/exercise.model';

export interface Course {
  id: number;
  title: string;
  description: string;
  levelId: number;
  categoryId: number;
  subcategoryId: number;
  lessons: Lesson[];
  quizzes: any[];
  instructor: any;
  level: any;
  category: any;
  subcategory: any;
}

export interface Lesson {
  id: number;
  title: string;
  content?: string;
  videoUrl?: string;
  fileUrl?: string;
  order: number;
  courseId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Quiz {
  id: number;
  title: string;
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  id: number;
  text: string;
  options: QuizOption[];
}

export interface QuizOption {
  id: number;
  text: string;
  isCorrect: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class CourseService {
  constructor(private http: HttpClient) {}

  // ✅ Récupérer les cours par classe (remplace getCoursesByLevel)
  getCoursesByClasse(classeId: number): Observable<Course[]> {
    return this.http.get<Course[]>(
      `${environment.apiUrl}/courses/classe/${classeId}`
    );
  }

  // ✅ Récupérer les cours par catégorie et classe (remplace getCoursesByCategoryAndLevel)
  getCoursesByCategoryAndClasse(
    categoryId: number,
    classeId: number
  ): Observable<Course[]> {
    return this.http.get<Course[]>(
      `${environment.apiUrl}/courses/classe/${classeId}/category/${categoryId}`
    );
  }

  // ✅ Récupérer les matières d'une classe
  getCategoriesByClasse(classeId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${environment.apiUrl}/classes/${classeId}/categories`
    );
  }

  // ✅ Récupérer les cours d'une classe avec toutes les matières
  getCoursesWithCategoriesByClasse(classeId: number): Observable<any> {
    return this.http.get<any>(
      `${environment.apiUrl}/classes/${classeId}/courses-with-categories`
    );
  }

  // 🔄 Garder les anciennes méthodes pour compatibilité temporaire
  getCoursesByLevel(levelId: number): Observable<Course[]> {
    return this.http.get<Course[]>(
      `${environment.apiUrl}/courses/level/${levelId}`
    );
  }

  getCoursesByCategoryAndLevel(
    categoryId: number,
    levelId: number
  ): Observable<Course[]> {
    return this.http.get<Course[]>(
      `${environment.apiUrl}/courses/category/${categoryId}/level/${levelId}`
    );
  }

  // Récupérer un cours complet avec toutes ses relations
  getCourseById(id: number): Observable<Course> {
    return this.http.get<Course>(`${environment.apiUrl}/courses/${id}`);
  }

  // Récupérer les leçons d'un cours
  getLessonsByCourse(courseId: number): Observable<Lesson[]> {
    return this.http
      .get<Lesson[]>(`${environment.apiUrl}/courses/${courseId}/lessons`);
  }

  // Récupérer la progression d'un utilisateur pour un cours
  getUserProgress(courseId: number, userId: number): Observable<number> {
    // TODO: Implémenter quand l'API de progression sera disponible
    return new Observable((observer) => {
      observer.next(0); // Progression par défaut
      observer.complete();
    });
  }

  // Récupérer une leçon par son ID
  getLessonById(lessonId: number): Observable<Lesson> {
    return this.http.get<Lesson>(`${environment.apiUrl}/lessons/${lessonId}`);
  }

  // Récupérer les quiz d'un cours
  getCourseQuizzes(courseId: number): Observable<Quiz[]> {
    return this.http.get<Quiz[]>(
      `${environment.apiUrl}/courses/${courseId}/quizzes`
    );
  }

  // Récupérer les exercices d'une leçon
  getLessonExercises(lessonId: number): Observable<Exercise[]> {
    return this.http.get<Exercise[]>(
      `${environment.apiUrl}/public/exercises/lesson/${lessonId}`
    );
  }

  // Récupérer un exercice par son ID
  getExerciseById(exerciseId: number): Observable<Exercise> {
    return this.http.get<Exercise>(
      `${environment.apiUrl}/public/exercises/${exerciseId}`
    );
  }

  // Sauvegarder la progression d'un exercice
  saveExerciseProgress(progress: ExerciseProgress): Observable<any> {
    return this.http.post(`${environment.apiUrl}/exercise-progress`, progress);
  }

  // Sauvegarder le résultat d'un exercice
  saveExerciseResult(result: ExerciseResult): Observable<any> {
    return this.http.post(`${environment.apiUrl}/exercise-results`, result);
  }

  // ===== MÉTHODES DE PROGRESSION DES QUIZ =====

  /**
   * Sauvegarder la progression d'un quiz
   */
  saveQuizProgress(quizId: number, progressData: {
    lessonId: number;
    score: number;
    answers: { [questionId: number]: number };
    totalQuestions: number;
    completedAt?: string;
  }): Observable<any> {
    return this.http.post(`${environment.apiUrl}/quiz/${quizId}/submit`, progressData);
  }

  /**
   * Récupérer la progression d'un quiz pour l'utilisateur actuel
   */
  getQuizProgress(quizId: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}/quiz/${quizId}/progress`);
  }

  /**
   * Récupérer toutes les progressions de quiz de l'utilisateur actuel
   */
  getUserQuizProgress(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/quiz/progress/user`);
  }

  /**
   * Récupérer les statistiques de progression des quiz
   */
  getQuizProgressStats(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/quiz/progress/stats`);
  }

  // ===== MÉTHODES DE PROGRESSION DES EXERCICES =====

  /**
   * Sauvegarder la progression d'un exercice
   */
  saveExerciseProgressNew(exerciseId: number, progressData: {
    lessonId: number;
    exerciseType: 'flashcard' | 'translation' | 'listening';
    score: number;
    answers: { [exerciseId: number]: any };
    totalQuestions: number;
    completedAt?: string;
  }): Observable<any> {
    return this.http.post(`${environment.apiUrl}/exercise/${exerciseId}/submit`, progressData);
  }

  /**
   * Récupérer la progression d'un exercice pour l'utilisateur actuel
   */
  getExerciseProgress(exerciseId: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}/exercise/${exerciseId}/progress`);
  }

  /**
   * Récupérer toutes les progressions d'exercices de l'utilisateur actuel
   */
  getUserExerciseProgress(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/exercise/progress/user`);
  }

  /**
   * Récupérer les statistiques de progression des exercices
   */
  getExerciseProgressStats(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/exercise/progress/stats`);
  }

  /**
   * Récupérer les progressions par type d'exercice
   */
  getExerciseProgressByType(exerciseType: 'flashcard' | 'translation' | 'listening'): Observable<any> {
    return this.http.get(`${environment.apiUrl}/exercise/progress/type/${exerciseType}`);
  }

  // ===== MÉTHODES ADMIN =====

  // Récupérer tous les exercices avec pagination (admin)
  getAllExercises(
    page: number = 1,
    limit: number = 10,
    lessonId?: number,
    type?: string
  ): Observable<{
    exercises: Exercise[];
    total: number;
    page: number;
    limit: number;
  }> {
    let params = `page=${page}&limit=${limit}`;
    if (lessonId) params += `&lessonId=${lessonId}`;
    if (type) params += `&type=${type}`;

    return this.http.get<{
      exercises: Exercise[];
      total: number;
      page: number;
      limit: number;
    }>(`${environment.apiUrl}/admin/exercises?${params}`);
  }

  // Créer un exercice (admin)
  createExerciseAdmin(exerciseData: Partial<Exercise>): Observable<Exercise> {
    return this.http.post<Exercise>(
      `${environment.apiUrl}/admin/exercises`,
      exerciseData
    );
  }

  // Mettre à jour un exercice (admin)
  updateExerciseAdmin(
    exerciseId: number,
    exerciseData: Partial<Exercise>
  ): Observable<Exercise> {
    return this.http.put<Exercise>(
      `${environment.apiUrl}/admin/exercises/${exerciseId}`,
      exerciseData
    );
  }

  // Supprimer un exercice (admin)
  deleteExerciseAdmin(exerciseId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${environment.apiUrl}/admin/exercises/${exerciseId}`
    );
  }

  // Dupliquer un exercice (admin)
  duplicateExerciseAdmin(exerciseId: number): Observable<Exercise> {
    return this.http.post<Exercise>(
      `${environment.apiUrl}/admin/exercises/${exerciseId}/duplicate`,
      {}
    );
  }

  // Activer/Désactiver un exercice (admin)
  toggleExerciseStatusAdmin(exerciseId: number): Observable<Exercise> {
    return this.http.put<Exercise>(
      `${environment.apiUrl}/admin/exercises/${exerciseId}/toggle-status`,
      {}
    );
  }

  // Récupérer les statistiques des exercices (admin)
  getExerciseStatsAdmin(): Observable<{
    total: number;
    byType: Record<string, number>;
    active: number;
    inactive: number;
  }> {
    return this.http.get<{
      total: number;
      byType: Record<string, number>;
      active: number;
      inactive: number;
    }>(`${environment.apiUrl}/admin/exercises/stats/overview`);
  }
}
