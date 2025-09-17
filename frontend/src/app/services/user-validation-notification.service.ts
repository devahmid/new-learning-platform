import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ValidationNotification {
  id: string;
  userId: number;
  type: 'approval' | 'rejection' | 'pending';
  message: string;
  reason?: string;
  createdAt: string;
  read: boolean;
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserValidationNotificationService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Envoyer une notification d'approbation à un utilisateur
   */
  sendApprovalNotification(userId: number, userEmail: string, userName: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/notifications/validation/approval`, {
      userId,
      userEmail,
      userName,
      type: 'approval'
    });
  }

  /**
   * Envoyer une notification de rejet à un utilisateur
   */
  sendRejectionNotification(userId: number, userEmail: string, userName: string, reason: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/notifications/validation/rejection`, {
      userId,
      userEmail,
      userName,
      reason,
      type: 'rejection'
    });
  }

  /**
   * Envoyer une notification de mise en attente à un utilisateur
   */
  sendPendingNotification(userId: number, userEmail: string, userName: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/notifications/validation/pending`, {
      userId,
      userEmail,
      userName,
      type: 'pending'
    });
  }

  /**
   * Récupérer les notifications de validation pour un utilisateur
   */
  getUserValidationNotifications(userId: number): Observable<ValidationNotification[]> {
    return this.http.get<ValidationNotification[]>(`${this.apiUrl}/notifications/validation/user/${userId}`);
  }

  /**
   * Marquer une notification comme lue
   */
  markNotificationAsRead(notificationId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/notifications/validation/${notificationId}/read`, {});
  }

  /**
   * Récupérer les préférences de notification d'un utilisateur
   */
  getUserNotificationPreferences(userId: number): Observable<NotificationPreferences> {
    return this.http.get<NotificationPreferences>(`${this.apiUrl}/notifications/preferences/${userId}`);
  }

  /**
   * Mettre à jour les préférences de notification d'un utilisateur
   */
  updateUserNotificationPreferences(userId: number, preferences: NotificationPreferences): Observable<any> {
    return this.http.put(`${this.apiUrl}/notifications/preferences/${userId}`, preferences);
  }

  /**
   * Récupérer le nombre de notifications non lues pour un utilisateur
   */
  getUnreadNotificationCount(userId: number): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/notifications/validation/user/${userId}/unread-count`);
  }

  /**
   * Marquer toutes les notifications comme lues pour un utilisateur
   */
  markAllNotificationsAsRead(userId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/notifications/validation/user/${userId}/mark-all-read`, {});
  }
}
