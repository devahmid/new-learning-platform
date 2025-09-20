import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface AdminStats {
  totalUsers: number;
  totalParents: number;
  totalChildren: number;
  totalAdmins: number;
  totalTeachers?: number;
  usersGrowthPercentage: number;
  parentsGrowthPercentage: number;
  childrenGrowthPercentage: number;
  adminsGrowthPercentage: number;
  recentActivity?: {
    newUsersThisMonth: number;
    newParentsThisMonth: number;
    newChildrenThisMonth: number;
  };
}

export interface UsersByRole {
  role: string;
  count: number;
  percentage: number;
}

export interface UsersByStatus {
  status: string;
  count: number;
  percentage: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminStatsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Récupère les statistiques générales des utilisateurs
   */
  getAdminStats(): Observable<AdminStats> {
    return this.http.get<{success: boolean, data: AdminStats}>(`${this.apiUrl}/admin/users/stats/growth`)
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Récupère la répartition des utilisateurs par rôle
   */
  getUsersByRole(): Observable<UsersByRole[]> {
    return this.http.get<{success: boolean, data: UsersByRole[]}>(`${this.apiUrl}/admin/stats/users-by-role`)
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Récupère la répartition des utilisateurs par statut de validation
   */
  getUsersByStatus(): Observable<UsersByStatus[]> {
    return this.http.get<{success: boolean, data: UsersByStatus[]}>(`${this.apiUrl}/admin/stats/users-by-status`)
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Récupère les statistiques détaillées pour un mois donné
   */
  getMonthlyStats(year: number, month: number): Observable<any> {
    return this.http.get<{success: boolean, data: any}>(`${this.apiUrl}/admin/stats/monthly?year=${year}&month=${month}`)
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Récupère les derniers utilisateurs inscrits
   */
  getRecentUsers(limit: number = 10): Observable<any[]> {
    return this.http.get<{success: boolean, data: any[]}>(`${this.apiUrl}/admin/stats/recent-users?limit=${limit}`)
      .pipe(
        map(response => response.data)
      );
  }
}
