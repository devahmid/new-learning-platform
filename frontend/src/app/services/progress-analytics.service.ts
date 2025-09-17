import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { 
  ProgressAnalytics, 
  SessionStats, 
  StudyPattern, 
  DifficultyAnalysis,
  ProgressFilters,
  ProgressOptions
} from '../models/progress.model';

@Injectable({
  providedIn: 'root'
})
export class ProgressAnalyticsService {
  private apiUrl = 'http://localhost:8000/api';
  
  // Cache pour les analytics
  private analyticsCache = new Map<string, any>();
  private analyticsSubject = new BehaviorSubject<ProgressAnalytics | null>(null);
  
  public analytics$ = this.analyticsSubject.asObservable();

  constructor(private http: HttpClient) {}

  // =====================================================
  // MÉTHODES POUR LES ANALYTICS GÉNÉRALES
  // =====================================================

  /**
   * Récupérer les analytics complètes d'un enfant
   */
  getChildAnalytics(childId: number, period: string = 'week'): Observable<ProgressAnalytics> {
    const cacheKey = `analytics_${childId}_${period}`;
    
    // Vérifier le cache
    if (this.analyticsCache.has(cacheKey)) {
      const cachedData = this.analyticsCache.get(cacheKey);
      this.analyticsSubject.next(cachedData);
      return new Observable(observer => observer.next(cachedData));
    }

    const params = new HttpParams().set('period', period);
    
    return this.http.get<{ success: boolean; data: ProgressAnalytics }>(`${this.apiUrl}/progress/child/${childId}/analytics`, { params })
      .pipe(
        map(response => {
          if (response.success && response.data) {
            // Mettre en cache
            this.analyticsCache.set(cacheKey, response.data);
            this.analyticsSubject.next(response.data);
            return response.data;
          }
          throw new Error('Erreur lors de la récupération des analytics');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Récupérer les statistiques de session
   */
  getSessionStats(childId: number, period: string = 'week'): Observable<SessionStats> {
    return this.getChildAnalytics(childId, period).pipe(
      map(analytics => analytics.sessionStats)
    );
  }

  /**
   * Récupérer les patterns d'étude
   */
  getStudyPatterns(childId: number): Observable<StudyPattern[]> {
    return this.getChildAnalytics(childId).pipe(
      map(analytics => analytics.studyPatterns)
    );
  }

  /**
   * Récupérer l'analyse des difficultés
   */
  getDifficultyAnalysis(childId: number): Observable<DifficultyAnalysis[]> {
    return this.getChildAnalytics(childId).pipe(
      map(analytics => analytics.difficultyAnalysis)
    );
  }

  // =====================================================
  // MÉTHODES POUR LES CALCULS D'ANALYTICS
  // =====================================================

  /**
   * Calculer la tendance de progression
   */
  calculateProgressTrend(sessionStats: SessionStats[]): 'improving' | 'stable' | 'declining' {
    if (sessionStats.length < 2) return 'stable';
    
    const recent = sessionStats.slice(-3); // 3 dernières sessions
    const older = sessionStats.slice(-6, -3); // 3 sessions précédentes
    
    const recentAvg = recent.reduce((sum, stat) => sum + stat.averageScore, 0) / recent.length;
    const olderAvg = older.reduce((sum, stat) => sum + stat.averageScore, 0) / older.length;
    
    const difference = recentAvg - olderAvg;
    
    if (difference > 5) return 'improving';
    if (difference < -5) return 'declining';
    return 'stable';
  }

  /**
   * Calculer l'efficacité d'apprentissage
   */
  calculateLearningEfficiency(sessionStats: SessionStats): number {
    if (sessionStats.totalDuration === 0) return 0;
    
    // Efficacité = progression gagnée / temps passé
    return Math.round((sessionStats.totalProgressGained / sessionStats.totalDuration) * 100) / 100;
  }

  /**
   * Identifier les heures d'étude optimales
   */
  getOptimalStudyHours(studyPatterns: StudyPattern[]): { hour: number; efficiency: number }[] {
    const hourEfficiency = new Map<number, { totalDuration: number; sessionCount: number; avgScore: number }>();
    
    studyPatterns.forEach(pattern => {
      if (!hourEfficiency.has(pattern.studyHour)) {
        hourEfficiency.set(pattern.studyHour, { totalDuration: 0, sessionCount: 0, avgScore: 0 });
      }
      
      const current = hourEfficiency.get(pattern.studyHour)!;
      current.totalDuration += pattern.avgDuration;
      current.sessionCount += pattern.sessionCount;
    });
    
    return Array.from(hourEfficiency.entries())
      .map(([hour, data]) => ({
        hour,
        efficiency: data.totalDuration / data.sessionCount
      }))
      .sort((a, b) => b.efficiency - a.efficiency);
  }

  /**
   * Calculer le score de motivation
   */
  calculateMotivationScore(analytics: ProgressAnalytics): number {
    let score = 0;
    
    // Facteur 1: Régularité (40%)
    const consistency = this.calculateConsistency(analytics);
    score += consistency * 0.4;
    
    // Facteur 2: Progression (30%)
    const progress = this.calculateProgressScore(analytics);
    score += progress * 0.3;
    
    // Facteur 3: Engagement (30%)
    const engagement = this.calculateEngagement(analytics);
    score += engagement * 0.3;
    
    return Math.min(100, Math.max(0, Math.round(score)));
  }

  /**
   * Calculer la régularité d'étude
   */
  private calculateConsistency(analytics: ProgressAnalytics): number {
    const patterns = analytics.studyPatterns;
    if (patterns.length === 0) return 0;
    
    // Calculer la variance des sessions par jour
    const dailySessions = new Map<string, number>();
    patterns.forEach(pattern => {
      dailySessions.set(pattern.studyDay, (dailySessions.get(pattern.studyDay) || 0) + pattern.sessionCount);
    });
    
    const values = Array.from(dailySessions.values());
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    
    // Score basé sur la régularité (plus c'est régulier, plus le score est élevé)
    return Math.max(0, 100 - Math.sqrt(variance) * 10);
  }

  /**
   * Calculer le score de progression
   */
  private calculateProgressScore(analytics: ProgressAnalytics): number {
    const sessionStats = analytics.sessionStats;
    if (sessionStats.averageScore === 0) return 0;
    
    return Math.min(100, sessionStats.averageScore);
  }

  /**
   * Calculer le score d'engagement
   */
  private calculateEngagement(analytics: ProgressAnalytics): number {
    const sessionStats = analytics.sessionStats;
    
    // Facteurs d'engagement
    const sessionFrequency = Math.min(100, sessionStats.totalSessions * 10); // 10 points par session
    const durationEngagement = Math.min(100, sessionStats.averageDuration * 2); // 2 points par minute moyenne
    const progressEngagement = Math.min(100, sessionStats.averageProgressGained * 10); // 10 points par % de progression
    
    return (sessionFrequency + durationEngagement + progressEngagement) / 3;
  }

  // =====================================================
  // MÉTHODES POUR LES RECOMMANDATIONS
  // =====================================================

  /**
   * Générer des recommandations basées sur les analytics
   */
  generateRecommendations(analytics: ProgressAnalytics): string[] {
    const recommendations: string[] = [];
    
    // Recommandation basée sur la régularité
    const consistency = this.calculateConsistency(analytics);
    if (consistency < 50) {
      recommendations.push("Essayez d'étudier à des heures régulières pour améliorer votre efficacité");
    }
    
    // Recommandation basée sur les performances
    if (analytics.sessionStats.averageScore < 70) {
      recommendations.push("Concentrez-vous sur la révision des leçons précédentes");
    }
    
    // Recommandation basée sur les patterns d'étude
    const optimalHours = this.getOptimalStudyHours(analytics.studyPatterns);
    if (optimalHours.length > 0) {
      const bestHour = optimalHours[0];
      recommendations.push(`Vous êtes plus efficace vers ${bestHour.hour}h00, privilégiez cette heure pour étudier`);
    }
    
    // Recommandation basée sur les difficultés
    if (analytics.difficultyAnalysis.length > 0) {
      const mostDifficult = analytics.difficultyAnalysis[0];
      recommendations.push(`La matière "${mostDifficult.subject}" nécessite plus d'attention (score moyen: ${mostDifficult.avgScore.toFixed(1)}%)`);
    }
    
    return recommendations;
  }

  /**
   * Identifier les zones d'amélioration
   */
  identifyImprovementAreas(analytics: ProgressAnalytics): string[] {
    const areas: string[] = [];
    
    // Vérifier les scores faibles
    if (analytics.sessionStats.averageScore < 60) {
      areas.push("Scores globaux");
    }
    
    // Vérifier la durée des sessions
    if (analytics.sessionStats.averageDuration < 15) {
      areas.push("Durée des sessions d'étude");
    }
    
    // Vérifier la progression
    if (analytics.sessionStats.averageProgressGained < 5) {
      areas.push("Progression par session");
    }
    
    // Vérifier les matières difficiles
    analytics.difficultyAnalysis.forEach(difficulty => {
      if (difficulty.avgScore < 50) {
        areas.push(difficulty.subject);
      }
    });
    
    return areas;
  }

  // =====================================================
  // MÉTHODES POUR LES VISUALISATIONS
  // =====================================================

  /**
   * Préparer les données pour les graphiques de progression
   */
  prepareProgressChartData(analytics: ProgressAnalytics): any[] {
    // Cette méthode préparera les données pour les graphiques
    // Elle sera implémentée selon les besoins des composants de visualisation
    return [];
  }

  /**
   * Préparer les données pour les graphiques de temps d'étude
   */
  prepareStudyTimeChartData(studyPatterns: StudyPattern[]): any[] {
    return studyPatterns.map(pattern => ({
      day: pattern.studyDay,
      hour: pattern.studyHour,
      duration: pattern.avgDuration,
      sessions: pattern.sessionCount
    }));
  }

  /**
   * Préparer les données pour les graphiques de difficultés
   */
  prepareDifficultyChartData(difficultyAnalysis: DifficultyAnalysis[]): any[] {
    return difficultyAnalysis.map(difficulty => ({
      subject: difficulty.subject,
      avgScore: difficulty.avgScore,
      lessonCount: difficulty.lessonCount,
      reviewCount: difficulty.reviewCount
    }));
  }

  // =====================================================
  // MÉTHODES UTILITAIRES
  // =====================================================

  /**
   * Vider le cache des analytics
   */
  clearCache(): void {
    this.analyticsCache.clear();
    this.analyticsSubject.next(null);
  }

  /**
   * Obtenir les analytics actuelles depuis le cache
   */
  getCurrentAnalytics(): ProgressAnalytics | null {
    return this.analyticsSubject.value;
  }

  /**
   * Gestionnaire d'erreurs
   */
  private handleError(error: any): Observable<never> {
    console.error('ProgressAnalyticsService Error:', error);
    
    let errorMessage = 'Une erreur est survenue lors de l\'analyse des données';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
