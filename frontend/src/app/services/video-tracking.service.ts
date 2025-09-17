import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

export interface VideoWatchSession {
  id?: number;
  userId: number;
  lessonId: number;
  videoUrl: string;
  sessionStart: string;
  sessionEnd?: string;
  totalDuration: number; // en secondes
  watchedDuration: number; // en secondes
  watchPercentage: number; // 0-100
  startTime: number; // temps de début en secondes
  endTime: number; // temps de fin en secondes
  lastPosition: number; // dernière position en secondes
  quality: 'low' | 'medium' | 'high' | 'auto';
  playbackSpeed: number;
  pauseCount: number;
  seekCount: number;
  replayCount: number;
  status: 'watching' | 'paused' | 'completed' | 'abandoned';
  isCompleted: boolean;
  deviceType: 'desktop' | 'tablet' | 'mobile';
  browserInfo?: string;
  ipAddress?: string;
}

export interface VideoWatchEvent {
  id?: number;
  sessionId: number;
  userId: number;
  lessonId: number;
  eventType: 'play' | 'pause' | 'seek' | 'replay' | 'complete' | 'abandon';
  timestamp: number; // temps dans la vidéo en secondes
  eventTime: string;
  eventData?: any;
  deviceType: 'desktop' | 'tablet' | 'mobile';
}

export interface VideoAnalytics {
  totalWatchTime: number;
  totalSessions: number;
  averageWatchTime: number;
  completionRate: number;
  averagePauseCount: number;
  averageSeekCount: number;
  averageReplayCount: number;
  preferredQuality: string;
  averagePlaybackSpeed: number;
  mostWatchedSegment?: any;
  leastWatchedSegment?: any;
  skipPoints?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class VideoTrackingService {
  private apiUrl = 'http://localhost:8000/api';
  private currentSession: VideoWatchSession | null = null;
  private watchStartTime: number = 0;
  private totalWatchedTime: number = 0;
  private lastPosition: number = 0;
  private pauseCount: number = 0;
  private seekCount: number = 0;
  private replayCount: number = 0;

  // Observables pour le suivi en temps réel
  private watchProgressSubject = new BehaviorSubject<number>(0);
  public watchProgress$ = this.watchProgressSubject.asObservable();

  private sessionStatusSubject = new BehaviorSubject<string>('idle');
  public sessionStatus$ = this.sessionStatusSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Démarrer une session de visionnage
   */
  startWatchSession(lessonId: number, videoUrl: string, totalDuration: number): Observable<VideoWatchSession> {
    const sessionData = {
      userId: this.getCurrentUserId(),
      lessonId: lessonId,
      videoUrl: videoUrl,
      totalDuration: totalDuration,
      startTime: 0,
      quality: 'auto',
      playbackSpeed: 1.0,
      deviceType: this.getDeviceType(),
      browserInfo: navigator.userAgent,
      ipAddress: null // Sera rempli côté serveur
    };

    return this.http.post<VideoWatchSession>(`${this.apiUrl}/video/session/start`, sessionData)
      .pipe(
        tap(session => {
          this.currentSession = session;
          this.watchStartTime = Date.now();
          this.totalWatchedTime = 0;
          this.lastPosition = 0;
          this.pauseCount = 0;
          this.seekCount = 0;
          this.replayCount = 0;
          this.sessionStatusSubject.next('watching');
        }),
        catchError(error => {
          console.error('Erreur lors du démarrage de la session:', error);
          throw error;
        })
      );
  }

  /**
   * Enregistrer un événement de visionnage
   */
  recordEvent(eventType: VideoWatchEvent['eventType'], timestamp: number, eventData?: any): Observable<any> {
    if (!this.currentSession) {
      console.warn('Aucune session active pour enregistrer l\'événement');
      return new Observable(observer => observer.next(null));
    }

    const eventPayload = {
      sessionId: this.currentSession.id!,
      userId: this.currentSession.userId,
      lessonId: this.currentSession.lessonId,
      eventType: eventType,
      timestamp: timestamp,
      eventData: eventData,
      deviceType: this.getDeviceType()
    };

    return this.http.post(`${this.apiUrl}/video/event/record`, eventPayload)
      .pipe(
        tap(() => {
          this.updateSessionStats(eventType, timestamp);
        }),
        catchError(error => {
          console.error('Erreur lors de l\'enregistrement de l\'événement:', error);
          throw error;
        })
      );
  }

  /**
   * Mettre à jour la progression de visionnage
   */
  updateWatchProgress(currentTime: number, totalDuration: number): void {
    if (!this.currentSession) return;

    const watchPercentage = (currentTime / totalDuration) * 100;
    this.lastPosition = currentTime;
    
    // Calculer le temps regardé depuis la dernière mise à jour
    const now = Date.now();
    const timeSinceLastUpdate = (now - this.watchStartTime) / 1000;
    this.totalWatchedTime += timeSinceLastUpdate;
    this.watchStartTime = now;

    this.watchProgressSubject.next(watchPercentage);

    // Mettre à jour la session côté serveur (toutes les 10 secondes)
    if (Math.floor(currentTime) % 10 === 0) {
      this.updateSession({
        watchedDuration: Math.floor(this.totalWatchedTime),
        watchPercentage: watchPercentage,
        lastPosition: currentTime
      }).subscribe();
    }
  }

  /**
   * Mettre à jour la session de visionnage
   */
  updateSession(updateData: Partial<VideoWatchSession>): Observable<any> {
    if (!this.currentSession) {
      return new Observable(observer => observer.next(null));
    }

    return this.http.put(`${this.apiUrl}/video/session/${this.currentSession.id}/update`, updateData)
      .pipe(
        tap(() => {
          if (this.currentSession) {
            Object.assign(this.currentSession, updateData);
          }
        }),
        catchError(error => {
          console.error('Erreur lors de la mise à jour de la session:', error);
          throw error;
        })
      );
  }

  /**
   * Terminer la session de visionnage
   */
  endWatchSession(finalPosition: number, totalDuration: number): Observable<any> {
    if (!this.currentSession) {
      return new Observable(observer => observer.next(null));
    }

    const watchPercentage = (finalPosition / totalDuration) * 100;
    const isCompleted = watchPercentage >= 90; // Considéré comme complété à 90%

    const endData = {
      sessionEnd: new Date().toISOString(),
      watchedDuration: Math.floor(this.totalWatchedTime),
      watchPercentage: watchPercentage,
      endTime: finalPosition,
      lastPosition: finalPosition,
      pauseCount: this.pauseCount,
      seekCount: this.seekCount,
      replayCount: this.replayCount,
      status: isCompleted ? 'completed' : 'abandoned',
      isCompleted: isCompleted
    };

    return this.http.put(`${this.apiUrl}/video/session/${this.currentSession.id}/end`, endData)
      .pipe(
        tap(() => {
          this.currentSession = null;
          this.sessionStatusSubject.next('idle');
        }),
        catchError(error => {
          console.error('Erreur lors de la fin de la session:', error);
          throw error;
        })
      );
  }

  /**
   * Reprendre une session de visionnage
   */
  resumeWatchSession(lessonId: number): Observable<VideoWatchSession | null> {
    return this.http.get<VideoWatchSession>(`${this.apiUrl}/video/session/active/${lessonId}`)
      .pipe(
        tap(session => {
          if (session) {
            this.currentSession = session;
            this.lastPosition = session.lastPosition;
            this.pauseCount = session.pauseCount;
            this.seekCount = session.seekCount;
            this.replayCount = session.replayCount;
            this.sessionStatusSubject.next('watching');
          }
        }),
        catchError(error => {
          console.error('Erreur lors de la reprise de la session:', error);
          return new Observable<VideoWatchSession | null>(observer => observer.next(null));
        })
      );
  }

  /**
   * Récupérer les statistiques de visionnage
   */
  getWatchStats(userId: number, period: string = 'week'): Observable<any> {
    return this.http.get(`${this.apiUrl}/video/stats/${userId}?period=${period}`);
  }

  /**
   * Récupérer les leçons les plus regardées
   */
  getMostWatchedLessons(userId: number, limit: number = 10): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/video/most-watched/${userId}?limit=${limit}`);
  }

  /**
   * Récupérer les analytics vidéo détaillées
   */
  getVideoAnalytics(userId: number, lessonId: number): Observable<VideoAnalytics> {
    return this.http.get<VideoAnalytics>(`${this.apiUrl}/video/analytics/${userId}/${lessonId}`);
  }

  /**
   * Mettre à jour les statistiques de session
   */
  private updateSessionStats(eventType: VideoWatchEvent['eventType'], timestamp: number): void {
    switch (eventType) {
      case 'pause':
        this.pauseCount++;
        break;
      case 'seek':
        this.seekCount++;
        break;
      case 'replay':
        this.replayCount++;
        break;
    }
  }

  /**
   * Obtenir le type d'appareil
   */
  private getDeviceType(): 'desktop' | 'tablet' | 'mobile' {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  /**
   * Obtenir l'ID de l'utilisateur actuel
   */
  private getCurrentUserId(): number {
    // Récupérer depuis le service d'authentification
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user).id : 0;
  }

  /**
   * Obtenir la session actuelle
   */
  getCurrentSession(): VideoWatchSession | null {
    return this.currentSession;
  }

  /**
   * Vérifier si une session est active
   */
  isSessionActive(): boolean {
    return this.currentSession !== null;
  }
}
