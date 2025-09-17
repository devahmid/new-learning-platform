import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { 
  DetailedProgress, 
  ParentOverview, 
  ProgressAnalytics, 
  ProgressSession, 
  ProgressReport,
  ProgressNotification,
  ProgressInsight,
  ProgressFilters,
  ProgressOptions,
  DetailedProgressResponse,
  ParentOverviewResponse,
  ProgressAnalyticsResponse,
  SessionStartResponse
} from '../models/progress.model';

@Injectable({
  providedIn: 'root'
})
export class ProgressTrackingService {
  private apiUrl = 'http://localhost:8000/api';
  
  // Subjects pour le cache et la synchronisation
  private detailedProgressSubject = new BehaviorSubject<DetailedProgress | null>(null);
  private parentOverviewSubject = new BehaviorSubject<ParentOverview | null>(null);
  private notificationsSubject = new BehaviorSubject<ProgressNotification[]>([]);
  
  // Observables publics
  public detailedProgress$ = this.detailedProgressSubject.asObservable();
  public parentOverview$ = this.parentOverviewSubject.asObservable();
  public notifications$ = this.notificationsSubject.asObservable();

  constructor(private http: HttpClient) {}

  // =====================================================
  // MÉTHODES POUR LA PROGRESSION DÉTAILLÉE
  // =====================================================

  /**
   * Récupérer la progression détaillée d'un enfant
   */
  getChildDetailedProgress(childId: number, options?: ProgressOptions): Observable<DetailedProgress> {
    let params = new HttpParams();
    
    if (options) {
      if (options.includeInactive) params = params.set('includeInactive', 'true');
      if (options.includeRecommendations) params = params.set('includeRecommendations', 'true');
      if (options.includeInsights) params = params.set('includeInsights', 'true');
      if (options.includeAchievements) params = params.set('includeAchievements', 'true');
      if (options.limit) params = params.set('limit', options.limit.toString());
      if (options.offset) params = params.set('offset', options.offset.toString());
    }

    return this.http.get<DetailedProgressResponse>(`${this.apiUrl}/progress/child/${childId}/detailed`, { params })
      .pipe(
        map(response => {
          if (response.success && response.data) {
            this.detailedProgressSubject.next(response.data);
            return response.data;
          }
          throw new Error(response.message || 'Erreur lors de la récupération de la progression');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Récupérer la vue d'ensemble pour les parents
   */
  getParentOverview(): Observable<ParentOverview> {
    return this.http.get<ParentOverviewResponse>(`${this.apiUrl}/progress/parent/overview`)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            this.parentOverviewSubject.next(response.data);
            return response.data;
          }
          throw new Error(response.message || 'Erreur lors de la récupération de la vue d\'ensemble');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Récupérer les analytics d'un enfant
   */
  getChildAnalytics(childId: number, period: string = 'week'): Observable<ProgressAnalytics> {
    const params = new HttpParams().set('period', period);
    
    return this.http.get<ProgressAnalyticsResponse>(`${this.apiUrl}/progress/child/${childId}/analytics`, { params })
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Erreur lors de la récupération des analytics');
        }),
        catchError(this.handleError)
      );
  }

  // =====================================================
  // MÉTHODES POUR LES SESSIONS D'ÉTUDE
  // =====================================================

  /**
   * Démarrer une session d'étude
   */
  startStudySession(sessionData: {
    courseId?: number;
    lessonId?: number;
    sessionType: 'lesson' | 'quiz' | 'exercise' | 'review' | 'practice';
    progressStart?: number;
    deviceType?: 'desktop' | 'tablet' | 'mobile';
  }): Observable<number> {
    return this.http.post<SessionStartResponse>(`${this.apiUrl}/progress/session/start`, sessionData)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data.sessionId;
          }
          throw new Error(response.message || 'Erreur lors du démarrage de la session');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Terminer une session d'étude
   */
  endStudySession(sessionId: number, sessionData: {
    progressEnd?: number;
    score?: number;
    attempts?: number;
    timePerQuestion?: number;
  }): Observable<boolean> {
    return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/progress/session/${sessionId}/end`, sessionData)
      .pipe(
        map(response => {
          if (response.success) {
            // Rafraîchir la progression après la session
            this.refreshProgressData();
            return true;
          }
          throw new Error(response.message || 'Erreur lors de la finalisation de la session');
        }),
        catchError(this.handleError)
      );
  }

  // =====================================================
  // MÉTHODES POUR LES RAPPORTS
  // =====================================================

  /**
   * Récupérer les rapports de progression
   */
  getProgressReports(childId: number, period?: string): Observable<ProgressReport[]> {
    let params = new HttpParams();
    if (period) params = params.set('period', period);

    return this.http.get<{ success: boolean; data: ProgressReport[] }>(`${this.apiUrl}/progress/child/${childId}/reports`, { params })
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error('Erreur lors de la récupération des rapports');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Générer un rapport hebdomadaire
   */
  generateWeeklyReport(childId: number): Observable<ProgressReport> {
    return this.http.post<{ success: boolean; data: ProgressReport }>(`${this.apiUrl}/progress/child/${childId}/reports/weekly`, {})
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error('Erreur lors de la génération du rapport');
        }),
        catchError(this.handleError)
      );
  }

  // =====================================================
  // MÉTHODES POUR LES NOTIFICATIONS
  // =====================================================

  /**
   * Récupérer les notifications de progression
   */
  getProgressNotifications(userId: number, unreadOnly: boolean = false): Observable<ProgressNotification[]> {
    const params = new HttpParams()
      .set('unreadOnly', unreadOnly.toString());

    return this.http.get<{ success: boolean; data: ProgressNotification[] }>(`${this.apiUrl}/progress/notifications/${userId}`, { params })
      .pipe(
        map(response => {
          if (response.success && response.data) {
            this.notificationsSubject.next(response.data);
            return response.data;
          }
          throw new Error('Erreur lors de la récupération des notifications');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Marquer une notification comme lue
   */
  markNotificationAsRead(notificationId: number, userId: number): Observable<boolean> {
    return this.http.patch<{ success: boolean }>(`${this.apiUrl}/progress/notifications/${notificationId}/read`, { userId })
      .pipe(
        map(response => response.success),
        catchError(this.handleError)
      );
  }

  /**
   * Marquer toutes les notifications comme lues
   */
  markAllNotificationsAsRead(userId: number): Observable<boolean> {
    return this.http.patch<{ success: boolean }>(`${this.apiUrl}/progress/notifications/mark-all-read`, { userId })
      .pipe(
        map(response => response.success),
        catchError(this.handleError)
      );
  }

  // =====================================================
  // MÉTHODES POUR LES INSIGHTS
  // =====================================================

  /**
   * Récupérer les insights de progression
   */
  getProgressInsights(userId: number, insightType?: string): Observable<ProgressInsight[]> {
    let params = new HttpParams();
    if (insightType) params = params.set('insightType', insightType);

    return this.http.get<{ success: boolean; data: ProgressInsight[] }>(`${this.apiUrl}/progress/insights/${userId}`, { params })
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error('Erreur lors de la récupération des insights');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Marquer un insight comme lu
   */
  markInsightAsRead(insightId: number, userId: number): Observable<boolean> {
    return this.http.patch<{ success: boolean }>(`${this.apiUrl}/progress/insights/${insightId}/read`, { userId })
      .pipe(
        map(response => response.success),
        catchError(this.handleError)
      );
  }

  // =====================================================
  // MÉTHODES UTILITAIRES
  // =====================================================

  /**
   * Rafraîchir les données de progression
   */
  refreshProgressData(): void {
    // Cette méthode sera appelée après chaque action importante
    // pour maintenir les données à jour
    const currentProgress = this.detailedProgressSubject.value;
    if (currentProgress) {
      this.getChildDetailedProgress(currentProgress.childId).subscribe();
    }
  }

  /**
   * Obtenir la progression actuelle depuis le cache
   */
  getCurrentProgress(): DetailedProgress | null {
    return this.detailedProgressSubject.value;
  }

  /**
   * Obtenir la vue d'ensemble parent actuelle depuis le cache
   */
  getCurrentParentOverview(): ParentOverview | null {
    return this.parentOverviewSubject.value;
  }

  /**
   * Obtenir les notifications actuelles depuis le cache
   */
  getCurrentNotifications(): ProgressNotification[] {
    return this.notificationsSubject.value;
  }

  /**
   * Calculer le pourcentage de progression global
   */
  calculateOverallProgress(subjectProgress: any[]): number {
    if (!subjectProgress || subjectProgress.length === 0) return 0;
    
    const totalProgress = subjectProgress.reduce((sum, subject) => sum + subject.progress, 0);
    return Math.round(totalProgress / subjectProgress.length);
  }

  /**
   * Obtenir la couleur de progression basée sur le pourcentage
   */
  getProgressColor(progress: number): string {
    if (progress >= 90) return 'bg-green-500';
    if (progress >= 70) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    if (progress >= 30) return 'bg-orange-500';
    return 'bg-red-500';
  }

  /**
   * Obtenir le label de progression
   */
  getProgressLabel(progress: number): string {
    if (progress >= 90) return 'Excellent';
    if (progress >= 70) return 'Bon';
    if (progress >= 50) return 'Moyen';
    if (progress >= 30) return 'Faible';
    return 'Très faible';
  }

  /**
   * Formater le temps d'étude en format lisible
   */
  formatStudyTime(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    
    return `${hours}h ${remainingMinutes}min`;
  }

  /**
   * Gestionnaire d'erreurs
   */
  private handleError(error: any): Observable<never> {
    console.error('ProgressTrackingService Error:', error);
    
    let errorMessage = 'Une erreur est survenue';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
