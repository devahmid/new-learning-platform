import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiPaths } from '../shared/api-paths';

export interface ChildStats {
  id: number;
  progress: number;
  points: number;
  badges: number;
  subjects: number;
  completedLessons: number;
  totalLessons: number;
  completedExercises: number;
  totalExercises: number;
  completedQuizzes: number;
  totalQuizzes: number;
}

@Injectable({
  providedIn: 'root'
})
export class ChildStatsService {
  private baseUrl = ApiPaths.users;

  constructor(private http: HttpClient) { }

  /**
   * Récupère les statistiques d'un enfant spécifique
   */
  getChildStats(childId: number): Observable<ChildStats> {
    return this.http.get<ChildStats>(`${this.baseUrl}/children/${childId}/stats`);
  }

  /**
   * Récupère les statistiques de tous les enfants d'un parent
   */
  getChildrenStats(): Observable<ChildStats[]> {
    return this.http.get<ChildStats[]>(`${this.baseUrl}/me/children/stats`);
  }

  /**
   * Calcule la progression globale d'un enfant
   */
  calculateProgress(stats: ChildStats): number {
    if (!stats) return 0;
    
    const totalItems = stats.totalLessons + stats.totalExercises + stats.totalQuizzes;
    const completedItems = stats.completedLessons + stats.completedExercises + stats.completedQuizzes;
    
    if (totalItems === 0) return 0;
    
    return Math.round((completedItems / totalItems) * 100);
  }

  /**
   * Calcule les points basés sur les activités complétées
   */
  calculatePoints(stats: ChildStats): number {
    if (!stats) return 0;
    
    const lessonPoints = stats.completedLessons * 10;
    const exercisePoints = stats.completedExercises * 5;
    const quizPoints = stats.completedQuizzes * 15;
    
    return lessonPoints + exercisePoints + quizPoints;
  }

  /**
   * Calcule le nombre de badges basé sur les réalisations
   */
  calculateBadges(stats: ChildStats): number {
    if (!stats) return 0;
    
    let badges = 0;
    
    // Badge pour les leçons
    if (stats.completedLessons >= 10) badges++;
    if (stats.completedLessons >= 50) badges++;
    if (stats.completedLessons >= 100) badges++;
    
    // Badge pour les exercices
    if (stats.completedExercises >= 20) badges++;
    if (stats.completedExercises >= 100) badges++;
    
    // Badge pour les quiz
    if (stats.completedQuizzes >= 5) badges++;
    if (stats.completedQuizzes >= 25) badges++;
    
    // Badge pour la progression
    const progress = this.calculateProgress(stats);
    if (progress >= 25) badges++;
    if (progress >= 50) badges++;
    if (progress >= 75) badges++;
    if (progress >= 100) badges++;
    
    return badges;
  }
}
