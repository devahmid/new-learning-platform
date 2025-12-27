import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { EvaluationService } from '../../../services/evaluation.service';
import { Evaluation } from '../../../models/evaluation.model';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-evaluation-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    CardModule,
    TableModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './evaluation-list.component.html',
  styleUrl: './evaluation-list.component.scss'
})
export class EvaluationListComponent implements OnInit {
  evaluations: Evaluation[] = [];
  isLoading = false;

  constructor(
    private evaluationService: EvaluationService,
    public router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadEvaluations();
  }

  loadEvaluations() {
    this.isLoading = true;
    this.evaluationService.getAllEvaluations().subscribe({
      next: (evaluations) => {
        this.evaluations = evaluations;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des évaluations:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les évaluations'
        });
        this.isLoading = false;
      }
    });
  }

  createEvaluation() {
    this.router.navigate(['/admin/evaluations/create']);
  }

  editEvaluation(id: number) {
    this.router.navigate(['/admin/evaluations/edit', id]);
  }

  deleteEvaluation(id: number) {
    this.confirmationService.confirm({
      message: 'Êtes-vous sûr de vouloir supprimer cette évaluation ?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.evaluationService.deleteEvaluation(id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Évaluation supprimée avec succès'
            });
            this.loadEvaluations();
          },
          error: (err) => {
            console.error('Erreur lors de la suppression:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Impossible de supprimer l\'évaluation'
            });
          }
        });
      }
    });
  }

  getStatusSeverity(isActive: boolean): 'success' | 'danger' {
    return isActive ? 'success' : 'danger';
  }

  getStatusLabel(isActive: boolean): string {
    return isActive ? 'Active' : 'Inactive';
  }

  viewResults(id: number) {
    this.router.navigate(['/admin/evaluations/results', id]);
  }
}

