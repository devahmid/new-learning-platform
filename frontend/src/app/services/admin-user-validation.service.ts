import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UserValidationRequest {
  userId: number;
  action: 'approve' | 'reject';
  reason?: string; // Pour les rejets
}

export interface UserValidationResponse {
  success: boolean;
  message: string;
  user?: {
    id: number;
    status: string;
    approved_at?: string;
    approved_by?: number;
    rejection_reason?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AdminUserValidationService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Approuver un utilisateur
   */
  approveUser(userId: number): Observable<UserValidationResponse> {
    return this.http.post<UserValidationResponse>(`${this.apiUrl}/admin/users/${userId}/approve`, {});
  }

  /**
   * Rejeter un utilisateur
   */
  rejectUser(userId: number, reason: string): Observable<UserValidationResponse> {
    return this.http.post<UserValidationResponse>(`${this.apiUrl}/admin/users/${userId}/reject`, {
      reason: reason
    });
  }

  /**
   * Remettre un utilisateur en attente
   */
  setUserPending(userId: number): Observable<UserValidationResponse> {
    return this.http.post<UserValidationResponse>(`${this.apiUrl}/admin/users/${userId}/pending`, {});
  }

  /**
   * Obtenir la liste des utilisateurs en attente de validation
   */
  getPendingUsers(): Observable<{ users: any[] }> {
    return this.http.get<{ users: any[] }>(`${this.apiUrl}/admin/users/pending`);
  }

  /**
   * Obtenir la liste de tous les utilisateurs avec leur statut de validation
   */
  getAllUsersWithStatus(): Observable<{ users: any[] }> {
    return this.http.get<{ users: any[] }>(`${this.apiUrl}/admin/users/with-status`);
  }

  /**
   * Obtenir les statistiques de validation
   */
  getValidationStats(): Observable<{
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  }> {
    return this.http.get<{
      pending: number;
      approved: number;
      rejected: number;
      total: number;
    }>(`${this.apiUrl}/admin/users/validation-stats`);
  }
}
