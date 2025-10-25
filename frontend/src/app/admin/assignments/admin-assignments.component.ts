import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface Assignment {
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

interface Classe {
  id: number;
  name: string;
  color: string;
}

interface AssignmentListResponse {
  success: boolean;
  message: string;
  data: {
    items: Assignment[];
    pagination: { total: number; page: number; limit: number; pages: number };
  };
}

interface AssignmentStatsResponse {
  success: boolean;
  message: string;
  data: {
    total: number;
    overdue: number;
    due_soon: number;
    upcoming: number;
    by_classe: Array<{
      id: number;
      name: string;
      color: string;
      assignment_count: number;
    }>;
  };
}

@Component({
  selector: 'app-admin-assignments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-assignments.component.html',
  styleUrl: './admin-assignments.component.scss'
})
export class AdminAssignmentsComponent implements OnInit {
  // Filters
  classeId: string = '';
  status: string = '';
  page = 1;
  limit = 25;

  // Data
  assignments: Assignment[] = [];
  classes: Classe[] = [];
  total = 0;
  pages = 0;
  loading = false;
  error: string | null = null;

  // Stats
  stats: AssignmentStatsResponse['data'] | null = null;
  statsLoading = false;

  // Form
  showCreateForm = false;
  newAssignment = {
    title: '',
    description: '',
    classeId: '',
    dueDate: ''
  };
  creating = false;

  readonly statuses = [
    { value: '', label: 'Tous' },
    { value: 'overdue', label: 'En retard' },
    { value: 'due_soon', label: 'Bientôt dû' },
    { value: 'upcoming', label: 'À venir' }
  ];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchAssignments();
    this.fetchStats();
    this.fetchClasses();
  }

  buildQuery(): string {
    const params: string[] = [];
    if (this.classeId) params.push(`classeId=${encodeURIComponent(this.classeId)}`);
    if (this.status) params.push(`status=${encodeURIComponent(this.status)}`);
    params.push(`page=${this.page}`);
    params.push(`limit=${this.limit}`);
    return params.join('&');
  }

  fetchAssignments(): void {
    this.loading = true;
    this.error = null;
    
    this.http.get<AssignmentListResponse>(`${environment.apiUrl}/admin/assignments?${this.buildQuery()}`)
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.assignments = response.data.items || [];
            this.total = response.data.pagination?.total || 0;
            this.pages = response.data.pagination?.pages || 1;
          } else {
            this.error = response.message || 'Erreur lors de la récupération des devoirs';
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur lors de la récupération des devoirs:', error);
          this.error = 'Erreur lors de la récupération des devoirs';
          this.loading = false;
        }
      });
  }

  fetchStats(): void {
    this.statsLoading = true;
    
    this.http.get<AssignmentStatsResponse>(`${environment.apiUrl}/admin/assignments/stats`)
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.stats = response.data;
          }
          this.statsLoading = false;
        },
        error: (error) => {
          console.error('Erreur lors de la récupération des statistiques:', error);
          this.statsLoading = false;
        }
      });
  }

  fetchClasses(): void {
    this.http.get<any>(`${environment.apiUrl}/classes`)
      .subscribe({
        next: (response) => {
          // L'API retourne directement un tableau de classes
          if (Array.isArray(response)) {
            this.classes = response;
          } else if (response.success && response.data) {
            this.classes = response.data;
          } else if (response.data) {
            this.classes = response.data;
          }
        },
        error: (error) => {
          console.error('Erreur lors de la récupération des classes:', error);
        }
      });
  }

  applyFilters(): void {
    this.page = 1;
    this.fetchAssignments();
  }

  clearFilters(): void {
    this.classeId = '';
    this.status = '';
    this.page = 1;
    this.fetchAssignments();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.pages) {
      this.page = page;
      this.fetchAssignments();
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'overdue': return 'En retard';
      case 'due_soon': return 'Bientôt dû';
      case 'upcoming': return 'À venir';
      case 'no_due_date': return 'Sans date';
      default: return status;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'overdue': return 'status-overdue';
      case 'due_soon': return 'status-due-soon';
      case 'upcoming': return 'status-upcoming';
      case 'no_due_date': return 'status-no-date';
      default: return '';
    }
  }

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

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    if (!this.showCreateForm) {
      this.resetForm();
    }
  }

  resetForm(): void {
    this.newAssignment = {
      title: '',
      description: '',
      classeId: '',
      dueDate: ''
    };
  }

  createAssignment(): void {
    if (!this.newAssignment.title || !this.newAssignment.classeId) {
      this.error = 'Titre et classe requis';
      return;
    }

    this.creating = true;
    this.error = null;

    const payload = {
      title: this.newAssignment.title,
      description: this.newAssignment.description,
      classeId: parseInt(this.newAssignment.classeId),
      dueDate: this.newAssignment.dueDate || null
    };

    this.http.post<any>(`${environment.apiUrl}/admin/assignments`, payload)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.fetchAssignments();
            this.fetchStats();
            this.toggleCreateForm();
            this.resetForm();
          } else {
            this.error = response.message || 'Erreur lors de la création du devoir';
          }
          this.creating = false;
        },
        error: (error) => {
          console.error('Erreur lors de la création du devoir:', error);
          this.error = 'Erreur lors de la création du devoir';
          this.creating = false;
        }
      });
  }

  deleteAssignment(assignment: Assignment): void {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le devoir "${assignment.title}" ?`)) {
      return;
    }

    this.http.delete<any>(`${environment.apiUrl}/admin/assignments/${assignment.id}`)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.fetchAssignments();
            this.fetchStats();
          } else {
            this.error = response.message || 'Erreur lors de la suppression';
          }
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.error = 'Erreur lors de la suppression';
        }
      });
  }
}
