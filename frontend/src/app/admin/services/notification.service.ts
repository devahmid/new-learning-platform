import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

const API_URL = environment.apiUrl;

export interface SendNotificationRequest {
  subject: string;
  content: string;
  admin_id?: number;
}

export interface SendNotificationResponse {
  success: boolean;
  message: string;
  data: {
    notification_id: number;
    total_recipients: number;
    success_count: number;
    error_count: number;
    errors: string[];
  };
}

export interface UserStatsResponse {
  success: boolean;
  message: string;
  data: {
    total_users: number;
    active_users: number;
    parents: number;
    teachers: number;
  };
}

export interface NotificationHistoryResponse {
  success: boolean;
  message: string;
  data: Array<{
    id: number;
    subject: string;
    content: string;
    admin_id: number;
    total_recipients: number;
    success_count: number;
    error_count: number;
    sent_at: string;
    created_at: string;
    updated_at: string;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private http: HttpClient) { }

  /**
   * Envoyer une notification à tous les utilisateurs
   */
  sendToAll(subject: string, content: string): Observable<SendNotificationResponse> {
    const request: SendNotificationRequest = {
      subject,
      content,
      admin_id: 1 // TODO: Récupérer depuis la session utilisateur
    };

    return this.http.post<SendNotificationResponse>(`${API_URL}/notifications/send`, request);
  }

  /**
   * Récupérer les statistiques des utilisateurs
   */
  getUserStats(): Observable<UserStatsResponse> {
    return this.http.get<UserStatsResponse>(`${API_URL}/notifications/stats`);
  }

  /**
   * Récupérer l'historique des notifications
   */
  getHistory(): Observable<NotificationHistoryResponse> {
    return this.http.get<NotificationHistoryResponse>(`${API_URL}/notifications/history`);
  }
}
