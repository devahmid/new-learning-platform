import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, interval } from 'rxjs';
import { map, tap, catchError, switchMap, startWith } from 'rxjs/operators';
import { ProgressNotification } from '../models/progress.model';

@Injectable({
  providedIn: 'root'
})
export class ProgressNotificationsService {
  private apiUrl = 'http://localhost:8000/api';
  
  // Subjects pour la gestion des notifications
  private notificationsSubject = new BehaviorSubject<ProgressNotification[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);
  
  // Observables publics
  public notifications$ = this.notificationsSubject.asObservable();
  public unreadCount$ = this.unreadCountSubject.asObservable();
  
  // Configuration
  private refreshInterval = 30000; // 30 secondes
  private autoRefresh = true;

  constructor(private http: HttpClient) {
    // Démarrer le rafraîchissement automatique si activé
    if (this.autoRefresh) {
      this.startAutoRefresh();
    }
  }

  // =====================================================
  // MÉTHODES POUR LA RÉCUPÉRATION DES NOTIFICATIONS
  // =====================================================

  /**
   * Récupérer toutes les notifications d'un utilisateur
   */
  getNotifications(userId: number, unreadOnly: boolean = false): Observable<ProgressNotification[]> {
    const params = new URLSearchParams();
    if (unreadOnly) params.set('unreadOnly', 'true');

    return this.http.get<{ success: boolean; data: ProgressNotification[] }>(
      `${this.apiUrl}/progress/notifications/${userId}?${params.toString()}`
    ).pipe(
      map(response => {
        if (response.success && response.data) {
          this.notificationsSubject.next(response.data);
          this.updateUnreadCount(response.data);
          return response.data;
        }
        throw new Error('Erreur lors de la récupération des notifications');
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Récupérer les notifications non lues
   */
  getUnreadNotifications(userId: number): Observable<ProgressNotification[]> {
    return this.getNotifications(userId, true);
  }

  /**
   * Récupérer les notifications par type
   */
  getNotificationsByType(userId: number, notificationType: string): Observable<ProgressNotification[]> {
    return this.http.get<{ success: boolean; data: ProgressNotification[] }>(
      `${this.apiUrl}/progress/notifications/${userId}/type/${notificationType}`
    ).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error('Erreur lors de la récupération des notifications par type');
      }),
      catchError(this.handleError)
    );
  }

  // =====================================================
  // MÉTHODES POUR LA GESTION DES NOTIFICATIONS
  // =====================================================

  /**
   * Marquer une notification comme lue
   */
  markAsRead(notificationId: number, userId: number): Observable<boolean> {
    return this.http.patch<{ success: boolean }>(
      `${this.apiUrl}/progress/notifications/${notificationId}/read`,
      { userId }
    ).pipe(
      map(response => {
        if (response.success) {
          this.updateNotificationStatus(notificationId, true);
          return true;
        }
        throw new Error('Erreur lors du marquage de la notification');
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Marquer toutes les notifications comme lues
   */
  markAllAsRead(userId: number): Observable<boolean> {
    return this.http.patch<{ success: boolean }>(
      `${this.apiUrl}/progress/notifications/mark-all-read`,
      { userId }
    ).pipe(
      map(response => {
        if (response.success) {
          this.markAllNotificationsAsRead();
          return true;
        }
        throw new Error('Erreur lors du marquage de toutes les notifications');
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Supprimer une notification
   */
  deleteNotification(notificationId: number, userId: number): Observable<boolean> {
    return this.http.delete<{ success: boolean }>(
      `${this.apiUrl}/progress/notifications/${notificationId}?userId=${userId}`
    ).pipe(
      map(response => {
        if (response.success) {
          this.removeNotification(notificationId);
          return true;
        }
        throw new Error('Erreur lors de la suppression de la notification');
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Supprimer toutes les notifications lues
   */
  deleteReadNotifications(userId: number): Observable<boolean> {
    return this.http.delete<{ success: boolean }>(
      `${this.apiUrl}/progress/notifications/delete-read?userId=${userId}`
    ).pipe(
      map(response => {
        if (response.success) {
          this.removeReadNotifications();
          return true;
        }
        throw new Error('Erreur lors de la suppression des notifications lues');
      }),
      catchError(this.handleError)
    );
  }

  // =====================================================
  // MÉTHODES POUR LES NOTIFICATIONS EN TEMPS RÉEL
  // =====================================================

  /**
   * Démarrer le rafraîchissement automatique
   */
  startAutoRefresh(): void {
    interval(this.refreshInterval)
      .pipe(
        startWith(0),
        switchMap(() => {
          const currentUserId = this.getCurrentUserId();
          if (currentUserId) {
            return this.getNotifications(currentUserId);
          }
          return [];
        })
      )
      .subscribe();
  }

  /**
   * Arrêter le rafraîchissement automatique
   */
  stopAutoRefresh(): void {
    this.autoRefresh = false;
  }

  /**
   * Rafraîchir manuellement les notifications
   */
  refreshNotifications(userId: number): Observable<ProgressNotification[]> {
    return this.getNotifications(userId);
  }

  // =====================================================
  // MÉTHODES POUR LA GESTION DES NOTIFICATIONS LOCALES
  // =====================================================

  /**
   * Ajouter une notification locale (pour les tests ou notifications instantanées)
   */
  addLocalNotification(notification: ProgressNotification): void {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = [notification, ...currentNotifications];
    this.notificationsSubject.next(updatedNotifications);
    this.updateUnreadCount(updatedNotifications);
  }

  /**
   * Mettre à jour le statut d'une notification
   */
  private updateNotificationStatus(notificationId: number, isRead: boolean): void {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.map(notification => 
      notification.id === notificationId 
        ? { ...notification, isRead, readAt: isRead ? new Date().toISOString() : undefined }
        : notification
    );
    this.notificationsSubject.next(updatedNotifications);
    this.updateUnreadCount(updatedNotifications);
  }

  /**
   * Marquer toutes les notifications comme lues localement
   */
  private markAllNotificationsAsRead(): void {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.map(notification => ({
      ...notification,
      isRead: true,
      readAt: new Date().toISOString()
    }));
    this.notificationsSubject.next(updatedNotifications);
    this.updateUnreadCount(updatedNotifications);
  }

  /**
   * Supprimer une notification localement
   */
  private removeNotification(notificationId: number): void {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.filter(
      notification => notification.id !== notificationId
    );
    this.notificationsSubject.next(updatedNotifications);
    this.updateUnreadCount(updatedNotifications);
  }

  /**
   * Supprimer toutes les notifications lues localement
   */
  private removeReadNotifications(): void {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.filter(
      notification => !notification.isRead
    );
    this.notificationsSubject.next(updatedNotifications);
    this.updateUnreadCount(updatedNotifications);
  }

  /**
   * Mettre à jour le compteur de notifications non lues
   */
  private updateUnreadCount(notifications: ProgressNotification[]): void {
    const unreadCount = notifications.filter(notification => !notification.isRead).length;
    this.unreadCountSubject.next(unreadCount);
  }

  // =====================================================
  // MÉTHODES POUR LES FILTRES ET RECHERCHE
  // =====================================================

  /**
   * Filtrer les notifications par type
   */
  filterByType(notifications: ProgressNotification[], type: string): ProgressNotification[] {
    return notifications.filter(notification => notification.notificationType === type);
  }

  /**
   * Filtrer les notifications par priorité
   */
  filterByPriority(notifications: ProgressNotification[], priority: string): ProgressNotification[] {
    return notifications.filter(notification => notification.priority === priority);
  }

  /**
   * Filtrer les notifications non lues
   */
  filterUnread(notifications: ProgressNotification[]): ProgressNotification[] {
    return notifications.filter(notification => !notification.isRead);
  }

  /**
   * Trier les notifications par date
   */
  sortByDate(notifications: ProgressNotification[], ascending: boolean = false): ProgressNotification[] {
    return notifications.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return ascending ? dateA - dateB : dateB - dateA;
    });
  }

  /**
   * Trier les notifications par priorité
   */
  sortByPriority(notifications: ProgressNotification[]): ProgressNotification[] {
    const priorityOrder = { 'urgent': 4, 'high': 3, 'normal': 2, 'low': 1 };
    return notifications.sort((a, b) => 
      (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - 
      (priorityOrder[a.priority as keyof typeof priorityOrder] || 0)
    );
  }

  // =====================================================
  // MÉTHODES UTILITAIRES
  // =====================================================

  /**
   * Obtenir les notifications actuelles depuis le cache
   */
  getCurrentNotifications(): ProgressNotification[] {
    return this.notificationsSubject.value;
  }

  /**
   * Obtenir le nombre de notifications non lues
   */
  getCurrentUnreadCount(): number {
    return this.unreadCountSubject.value;
  }

  /**
   * Obtenir l'ID de l'utilisateur actuel (à implémenter selon votre système d'auth)
   */
  private getCurrentUserId(): number | null {
    // Cette méthode doit être implémentée selon votre système d'authentification
    // Par exemple, récupérer depuis un service d'auth ou un token
    return null;
  }

  /**
   * Vérifier si une notification est expirée
   */
  isNotificationExpired(notification: ProgressNotification): boolean {
    if (!notification.expiresAt) return false;
    return new Date(notification.expiresAt) < new Date();
  }

  /**
   * Obtenir l'icône pour un type de notification
   */
  getNotificationIcon(notificationType: string): string {
    const iconMap: { [key: string]: string } = {
      'progress_milestone': 'trophy',
      'achievement_unlocked': 'star',
      'slow_progress': 'exclamation-triangle',
      'study_reminder': 'clock',
      'report_ready': 'file-text',
      'recommendation': 'lightbulb'
    };
    return iconMap[notificationType] || 'bell';
  }

  /**
   * Obtenir la couleur pour une priorité de notification
   */
  getPriorityColor(priority: string): string {
    const colorMap: { [key: string]: string } = {
      'urgent': 'text-red-600',
      'high': 'text-orange-600',
      'normal': 'text-blue-600',
      'low': 'text-gray-600'
    };
    return colorMap[priority] || 'text-gray-600';
  }

  /**
   * Formater la date d'une notification
   */
  formatNotificationDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)}h`;
    if (diffInMinutes < 10080) return `Il y a ${Math.floor(diffInMinutes / 1440)}j`;
    
    return date.toLocaleDateString('fr-FR');
  }

  /**
   * Gestionnaire d'erreurs
   */
  private handleError(error: any): Observable<never> {
    console.error('ProgressNotificationsService Error:', error);
    
    let errorMessage = 'Une erreur est survenue avec les notifications';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
