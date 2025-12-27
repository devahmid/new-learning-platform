import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EvaluationService } from '../../../services/evaluation.service';
import { Evaluation, EvaluationResponse } from '../../../models/evaluation.model';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-evaluation-results',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    TableModule,
    TagModule,
    ButtonModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './evaluation-results.component.html',
  styleUrl: './evaluation-results.component.scss'
})
export class EvaluationResultsComponent implements OnInit {
  evaluation: Evaluation | null = null;
  responses: EvaluationResponse[] = [];
  isLoading = false;
  evaluationId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private evaluationService: EvaluationService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.evaluationId = +id;
      this.loadEvaluation();
      this.loadResponses();
    }
  }

  loadEvaluation() {
    if (!this.evaluationId) return;
    
    this.evaluationService.getEvaluationById(this.evaluationId).subscribe({
      next: (evaluation: Evaluation) => {
        this.evaluation = evaluation;
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger l\'évaluation'
        });
      }
    });
  }

  loadResponses() {
    if (!this.evaluationId) return;
    
    this.isLoading = true;
    this.evaluationService.getEvaluationResponses(this.evaluationId).subscribe({
      next: (responses: EvaluationResponse[]) => {
        console.log('Réponses chargées:', responses);
        console.log('Première réponse:', responses[0]);
        // Calculer le percentage si manquant
        this.responses = responses.map(r => {
          if (r.percentage === null || r.percentage === undefined || isNaN(r.percentage)) {
            // Calculer le percentage à partir de correctAnswers et totalQuestions
            if (r.totalQuestions && r.totalQuestions > 0 && r.correctAnswers !== undefined) {
              r.percentage = Math.round((r.correctAnswers / r.totalQuestions) * 100);
            } else {
              r.percentage = 0;
            }
          }
          return r;
        });
        console.log('Réponses après traitement:', this.responses);
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des réponses:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les réponses'
        });
        this.isLoading = false;
      }
    });
  }

  getScoreSeverity(percentage?: number): 'success' | 'warning' | 'danger' {
    if (!percentage) return 'warning';
    if (percentage >= 70) return 'success';
    if (percentage >= 50) return 'warning';
    return 'danger';
  }

  formatDate(date: string | Date | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('fr-FR');
  }

  getAverageScore(): number {
    if (this.responses.length === 0) return 0;
    const validResponses = this.responses.filter(r => {
      const percentage = r.percentage;
      return percentage !== null && percentage !== undefined && !isNaN(percentage);
    });
    if (validResponses.length === 0) return 0;
    const sum = validResponses.reduce((acc, r) => {
      const percentage = r.percentage || 0;
      return acc + (isNaN(percentage) ? 0 : percentage);
    }, 0);
    const average = sum / validResponses.length;
    return isNaN(average) ? 0 : Math.round(average);
  }

  getSuccessRate(): number {
    if (this.responses.length === 0) return 0;
    const validResponses = this.responses.filter(r => {
      const percentage = r.percentage;
      return percentage !== null && percentage !== undefined && !isNaN(percentage);
    });
    if (validResponses.length === 0) return 0;
    const passed = validResponses.filter(r => {
      const percentage = r.percentage || 0;
      return !isNaN(percentage) && percentage >= 70;
    }).length;
    const rate = (passed / validResponses.length) * 100;
    return isNaN(rate) ? 0 : Math.round(rate);
  }

  getScoreLabel(percentage: number): string {
    if (percentage >= 70) return 'Réussi';
    if (percentage >= 50) return 'Moyen';
    return 'À améliorer';
  }

  viewDetails(response: EvaluationResponse) {
    console.log('viewDetails appelé avec:', response);
    console.log('evaluationId:', this.evaluationId);
    console.log('response.id:', response.id);
    
    if (!this.evaluationId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'ID d\'évaluation manquant'
      });
      return;
    }
    
    if (!response.id) {
      console.error('ID de réponse manquant dans:', response);
      this.messageService.add({
        severity: 'warn',
        summary: 'Attention',
        detail: 'ID de réponse manquant'
      });
      return;
    }
    
    const route = ['/admin/evaluations/results', this.evaluationId, 'response', response.id];
    console.log('Navigation vers:', route);
    this.router.navigate(route).catch(err => {
      console.error('Erreur de navigation:', err);
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Impossible de naviguer vers les détails'
      });
    });
  }
}

