import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Assignment {
  id: number;
  title: string;
  description: string;
  classeId: number;
  dueDate: string | null;
  createdBy: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  classe?: {
    id: number;
    name: string;
    color: string;
  };
  creator?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  status: string;
  isOverdue: boolean;
}

export interface ParentAssignmentsResponse {
  success: boolean;
  message: string;
  data: {
    [classeId: string]: {
      classe: {
        id: number;
        name: string;
        color: string;
      };
      assignments: Assignment[];
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class AssignmentService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Récupérer les devoirs pour un parent
   */
  getParentAssignments(): Observable<ParentAssignmentsResponse> {
    // Essayer d'abord l'endpoint user qui est plus permissif
    return this.http.get<ParentAssignmentsResponse>(`${this.baseUrl}/assignments/user`).pipe(
      catchError((error) => {
        console.log('Endpoint /assignments/user failed, trying /assignments/parent:', error);
        // Si l'endpoint user échoue, essayer l'endpoint parent
        return this.http.get<ParentAssignmentsResponse>(`${this.baseUrl}/assignments/parent`);
      })
    );
  }

  /**
   * Formater une date pour l'affichage
   */
  formatDate(dateString: string | null): string {
    if (!dateString) return 'Non spécifiée';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Obtenir le label du statut
   */
  getStatusLabel(status: string): string {
    switch (status) {
      case 'overdue': return 'En retard';
      case 'due_soon': return 'Bientôt dû';
      case 'upcoming': return 'À venir';
      case 'no_due_date': return 'Sans date';
      default: return status;
    }
  }

  /**
   * Obtenir la classe CSS du statut
   */
  getStatusClass(status: string): string {
    switch (status) {
      case 'overdue': return 'status-overdue';
      case 'due_soon': return 'status-due-soon';
      case 'upcoming': return 'status-upcoming';
      case 'no_due_date': return 'status-no-date';
      default: return '';
    }
  }

  /**
   * Vérifier si un devoir est urgent (en retard ou bientôt dû)
   */
  isUrgent(assignment: Assignment): boolean {
    return assignment.status === 'overdue' || assignment.status === 'due_soon';
  }
}
