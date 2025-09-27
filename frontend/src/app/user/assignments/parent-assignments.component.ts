import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AssignmentService, Assignment, ParentAssignmentsResponse } from '../../services/assignment.service';

interface ClasseAssignments {
  classe: {
    id: number;
    name: string;
    color: string;
  };
  assignments: Assignment[];
}

@Component({
  selector: 'app-parent-assignments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './parent-assignments.component.html',
  styleUrl: './parent-assignments.component.scss'
})
export class ParentAssignmentsComponent implements OnInit {
  assignments: ClasseAssignments[] = [];
  loading = false;
  error: string | null = null;
  selectedClasse: number | null = null;

  constructor(private assignmentService: AssignmentService) {}

  ngOnInit(): void {
    this.fetchAssignments();
  }

  fetchAssignments(): void {
    this.loading = true;
    this.error = null;

    this.assignmentService.getParentAssignments().subscribe({
      next: (response: ParentAssignmentsResponse) => {
        if (response.success && response.data) {
          // Convertir l'objet en tableau
          this.assignments = Object.values(response.data);
          
          // Trier par nombre de devoirs urgents
          this.assignments.sort((a, b) => {
            const urgentA = a.assignments.filter(assignment => 
              this.assignmentService.isUrgent(assignment)
            ).length;
            const urgentB = b.assignments.filter(assignment => 
              this.assignmentService.isUrgent(assignment)
            ).length;
            return urgentB - urgentA;
          });
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

  getTotalAssignments(): number {
    return this.assignments.reduce((total, classe) => total + classe.assignments.length, 0);
  }

  getUrgentAssignments(): number {
    return this.assignments.reduce((total, classe) => {
      return total + classe.assignments.filter(assignment => 
        this.assignmentService.isUrgent(assignment)
      ).length;
    }, 0);
  }

  getOverdueAssignments(): number {
    return this.assignments.reduce((total, classe) => {
      return total + classe.assignments.filter(assignment => 
        assignment.status === 'overdue'
      ).length;
    }, 0);
  }

  getDueSoonAssignments(): number {
    return this.assignments.reduce((total, classe) => {
      return total + classe.assignments.filter(assignment => 
        assignment.status === 'due_soon'
      ).length;
    }, 0);
  }

  getUrgentAssignmentsForClasse(classe: ClasseAssignments): Assignment[] {
    return classe.assignments.filter(assignment => 
      this.assignmentService.isUrgent(assignment)
    );
  }

  getUpcomingAssignmentsForClasse(classe: ClasseAssignments): Assignment[] {
    return classe.assignments.filter(assignment => 
      assignment.status === 'upcoming' || assignment.status === 'no_due_date'
    );
  }

  toggleClasse(classeId: number): void {
    this.selectedClasse = this.selectedClasse === classeId ? null : classeId;
  }

  isClasseSelected(classeId: number): boolean {
    return this.selectedClasse === classeId;
  }

  formatDate(dateString: string | null): string {
    return this.assignmentService.formatDate(dateString);
  }

  getStatusLabel(status: string): string {
    return this.assignmentService.getStatusLabel(status);
  }

  getStatusClass(status: string): string {
    return this.assignmentService.getStatusClass(status);
  }

  isUrgent(assignment: Assignment): boolean {
    return this.assignmentService.isUrgent(assignment);
  }
}

