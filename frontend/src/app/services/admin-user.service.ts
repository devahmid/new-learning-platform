import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../environments/environment';

export interface AdminUserListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminUserStats {
  total: number;
  parents: number;
  children: number;
  newThisWeek: number;
  activeUsers: number;
}

export interface AdminUserSearchParams {
  page?: number;
  limit?: number;
  type?: 'parent' | 'child';
  search?: string;
}

export interface AdminAdvancedSearchParams {
  query?: string;
  type?: 'parent' | 'child';
  level?: string;
  dateFrom?: string;
  dateTo?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminUserService {
  private baseUrl = `${environment.apiUrl}/admin/users`;

  constructor(private http: HttpClient) {}

  // 📋 Récupérer tous les utilisateurs avec pagination et filtres
  getAllUsers(params?: AdminUserSearchParams): Observable<AdminUserListResponse> {
    let httpParams = new HttpParams();
    
    if (params?.page) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params?.limit) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }
    if (params?.type) {
      httpParams = httpParams.set('type', params.type);
    }
    if (params?.search) {
      httpParams = httpParams.set('search', params.search);
    }

    return this.http.get<AdminUserListResponse>(this.baseUrl, { params: httpParams });
  }

  // 👤 Récupérer un utilisateur par ID
  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/${id}`);
  }

  // ➕ Créer un nouvel utilisateur
  createUser(userData: Partial<User>): Observable<User> {
    return this.http.post<User>(this.baseUrl, userData);
  }

  // ➕ Créer un parent
  createParent(parentData: any): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/parents`, parentData);
  }

  // ➕ Créer un enfant
  createChild(childData: any): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/children`, childData);
  }

  // ✏️ Mettre à jour un utilisateur (PUT - remplacement complet)
  updateUser(id: number, userData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/${id}`, userData);
  }

  // ✏️ Mettre à jour un utilisateur (PATCH - mise à jour partielle)
  patchUpdateUser(id: number, userData: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${this.baseUrl}/${id}`, userData);
  }

  // ✏️ Mettre à jour un parent (PATCH - mise à jour partielle)
  updateParent(id: number, parentData: any): Observable<User> {
    return this.http.patch<User>(`${this.baseUrl}/parents/${id}`, parentData);
  }

  // ✏️ Mettre à jour un enfant (PATCH - mise à jour partielle)
  updateChild(id: number, childData: any): Observable<User> {
    return this.http.patch<User>(`${this.baseUrl}/children/${id}`, childData);
  }

  // 🗑️ Supprimer un utilisateur
  deleteUser(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`);
  }

  // 🗑️ Supprimer un enfant
  deleteChild(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/children/${id}`);
  }

  // 📊 Récupérer les statistiques des utilisateurs
  getUserStats(): Observable<AdminUserStats> {
    return this.http.get<AdminUserStats>(`${this.baseUrl}/stats/overview`);
  }

  // 🔍 Recherche avancée d'utilisateurs
  advancedSearch(params: AdminAdvancedSearchParams): Observable<User[]> {
    let httpParams = new HttpParams();
    
    if (params.query) {
      httpParams = httpParams.set('query', params.query);
    }
    if (params.type) {
      httpParams = httpParams.set('type', params.type);
    }
    if (params.level) {
      httpParams = httpParams.set('level', params.level);
    }
    if (params.dateFrom) {
      httpParams = httpParams.set('dateFrom', params.dateFrom);
    }
    if (params.dateTo) {
      httpParams = httpParams.set('dateTo', params.dateTo);
    }

    return this.http.get<User[]>(`${this.baseUrl}/search/advanced`, { params: httpParams });
  }

  // 🔄 Méthode de compatibilité avec l'ancien service
  // Utilise automatiquement la bonne méthode selon le type d'utilisateur
  updateUserSmart(id: number, userData: Partial<User>): Observable<User> {
    if (userData.type === 'parent') {
      return this.updateParent(id, userData);
    } else if (userData.type === 'child') {
      return this.updateChild(id, userData);
    } else {
      return this.updateUser(id, userData);
    }
  }
}
