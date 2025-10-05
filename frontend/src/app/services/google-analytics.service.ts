import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ConsentService } from './consent.service';

declare let gtag: Function;

@Injectable({
  providedIn: 'root'
})
export class GoogleAnalyticsService {
  private measurementId = environment.googleAnalytics.measurementId;

  constructor(
    private router: Router,
    private consentService: ConsentService
  ) {
    this.trackPageViews();
  }

  /**
   * Vérifie que gtag est disponible et que le consentement analytics est donné
   */
  private isGtagAvailable(): boolean {
    return typeof gtag !== 'undefined' && this.consentService.isAnalyticsAllowed();
  }

  /**
   * Suit automatiquement les changements de page
   */
  private trackPageViews() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.trackPageView(event.urlAfterRedirects);
      }
    });
  }

  /**
   * Suit une vue de page
   */
  trackPageView(url: string) {
    if (this.isGtagAvailable()) {
      gtag('config', this.measurementId, {
        page_path: url,
        page_title: document.title,
        page_location: window.location.href
      });
    }
  }

  /**
   * Suit un événement personnalisé
   */
  trackEvent(eventName: string, parameters: any = {}) {
    if (this.isGtagAvailable()) {
      gtag('event', eventName, {
        event_category: parameters.category || 'engagement',
        event_label: parameters.label || '',
        value: parameters.value || 0,
        custom_parameter_1: parameters.custom1 || '',
        custom_parameter_2: parameters.custom2 || '',
        ...parameters
      });
    }
  }

  /**
   * Suit la connexion d'un utilisateur
   */
  trackUserLogin(userId: string, method: string = 'email') {
    this.trackEvent('login', {
      method: method,
      category: 'user_engagement'
    });
    
    // Définir l'ID utilisateur pour les sessions
    if (this.isGtagAvailable()) {
      gtag('config', this.measurementId, {
        user_id: userId
      });
    }
  }

  /**
   * Suit l'inscription d'un utilisateur
   */
  trackUserSignup(method: string = 'email') {
    this.trackEvent('sign_up', {
      method: method,
      category: 'user_engagement'
    });
  }

  /**
   * Suit l'accès à un cours
   */
  trackCourseView(courseId: string, courseName: string, category: string) {
    this.trackEvent('view_item', {
      item_id: courseId,
      item_name: courseName,
      item_category: category,
      category: 'course_engagement'
    });
  }

  /**
   * Suit la progression dans un cours
   */
  trackCourseProgress(courseId: string, lessonId: string, progressPercent: number) {
    this.trackEvent('course_progress', {
      course_id: courseId,
      lesson_id: lessonId,
      progress_percent: progressPercent,
      category: 'learning_engagement'
    });
  }

  /**
   * Suit la completion d'une leçon
   */
  trackLessonCompleted(courseId: string, lessonId: string) {
    this.trackEvent('lesson_completed', {
      course_id: courseId,
      lesson_id: lessonId,
      category: 'learning_engagement'
    });
  }

  /**
   * Suit le démarrage d'un quiz
   */
  trackQuizStart(quizId: string, courseId: string) {
    this.trackEvent('quiz_start', {
      quiz_id: quizId,
      course_id: courseId,
      category: 'quiz_engagement'
    });
  }

  /**
   * Suit la completion d'un quiz
   */
  trackQuizCompleted(quizId: string, courseId: string, score: number) {
    this.trackEvent('quiz_completed', {
      quiz_id: quizId,
      course_id: courseId,
      score: score,
      category: 'quiz_engagement'
    });
  }

  /**
   * Suit les erreurs de l'application
   */
  trackError(errorMessage: string, page: string) {
    this.trackEvent('exception', {
      description: errorMessage,
      page: page,
      fatal: false,
      category: 'error_tracking'
    });
  }

  /**
   * Suit les interactions avec les vidéos
   */
  trackVideoInteraction(action: string, videoId: string, progress?: number) {
    this.trackEvent('video_' + action, {
      video_id: videoId,
      progress: progress || 0,
      category: 'video_engagement'
    });
  }

  /**
   * Suit les recherches
   */
  trackSearch(searchTerm: string, resultsCount: number) {
    this.trackEvent('search', {
      search_term: searchTerm,
      results_count: resultsCount,
      category: 'search_engagement'
    });
  }

  /**
   * Définit les propriétés utilisateur personnalisées
   */
  setUserProperties(properties: any) {
    if (this.isGtagAvailable()) {
      gtag('config', this.measurementId, {
        user_properties: properties
      });
    }
  }

  /**
   * Récupère l'adresse IP et d'autres informations client
   */
  trackUserInfo() {
    // Récupérer les informations du navigateur
    const userAgent = navigator.userAgent;
    const language = navigator.language;
    const platform = navigator.platform;
    const screenResolution = `${screen.width}x${screen.height}`;

    this.setUserProperties({
      user_agent: userAgent,
      language: language,
      platform: platform,
      screen_resolution: screenResolution
    });

    // L'IP sera automatiquement capturée par Google Analytics
    // Mais on peut aussi la récupérer explicitement si nécessaire
    this.getClientIP().then(ip => {
      if (ip) {
        this.trackEvent('user_info', {
          ip_address: ip,
          user_agent: userAgent,
          language: language,
          platform: platform,
          screen_resolution: screenResolution,
          category: 'user_tracking'
        });
      }
    });
  }

  /**
   * Récupère l'adresse IP du client via un service externe
   */
  private async getClientIP(): Promise<string | null> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.warn('Impossible de récupérer l\'adresse IP:', error);
      return null;
    }
  }
}