import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EvaluationService } from '../../../services/evaluation.service';
import { Evaluation, EvaluationResponse, QuestionResponse } from '../../../models/evaluation.model';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-evaluation-response-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule,
    TagModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './evaluation-response-detail.component.html',
  styleUrl: './evaluation-response-detail.component.scss'
})
export class EvaluationResponseDetailComponent implements OnInit {
  evaluation: Evaluation | null = null;
  response: EvaluationResponse | null = null;
  isLoading = false;
  responseId: number | null = null;
  evaluationId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private evaluationService: EvaluationService,
    private messageService: MessageService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('responseId');
    const evalId = this.route.snapshot.paramMap.get('evaluationId');
    if (id) {
      this.responseId = +id;
      if (evalId) {
        this.evaluationId = +evalId;
      }
      this.loadResponse();
    }
  }

  loadResponse() {
    if (!this.responseId) {
      console.error('responseId manquant');
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'ID de réponse manquant'
      });
      return;
    }
    
    console.log('Chargement de la réponse avec ID:', this.responseId);
    console.log('evaluationId:', this.evaluationId);
    
    this.isLoading = true;
    this.evaluationService.getResponseById(this.responseId).subscribe({
      next: (response: any) => {
        console.log('Réponse chargée:', response);
        this.response = response;
        if (response.evaluation) {
          this.evaluation = response.evaluation;
          this.evaluationId = response.evaluation.id;
        } else if (response.evaluationId) {
          this.evaluationId = response.evaluationId;
          this.loadEvaluation();
        } else if (this.evaluationId) {
          // Si on a déjà l'evaluationId depuis la route, charger l'évaluation
          this.loadEvaluation();
        }
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement:', err);
        console.error('Status:', err.status);
        console.error('Message:', err.message);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les détails de la réponse: ' + (err.error?.message || err.message || 'Erreur inconnue')
        });
        this.isLoading = false;
      }
    });
  }

  loadEvaluation() {
    if (!this.evaluationId) return;
    
    this.evaluationService.getEvaluationById(this.evaluationId).subscribe({
      next: (evaluation: Evaluation) => {
        this.evaluation = evaluation;
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement de l\'évaluation:', err);
      }
    });
  }

  getQuestionById(questionId: number): any {
    if (!this.evaluation?.questions) return null;
    return this.evaluation.questions.find(q => q.id === questionId);
  }

  getQuestionResponse(questionId: number): QuestionResponse | null {
    if (!this.response?.responses) return null;
    return this.response.responses.find(r => r.questionId === questionId) || null;
  }

  isAnswerCorrect(question: any, questionResponse: QuestionResponse | null): boolean | null {
    if (!question || !questionResponse) return null;
    
    if (question.type === 'radio' || question.type === 'checkbox' || question.type === 'multiple_choice') {
      const correctOptions = question.options?.filter((opt: any) => opt.isCorrect) || [];
      const correctAnswers = correctOptions.map((opt: any) => opt.text);
      
      let userAnswer = questionResponse.value;
      if (typeof userAnswer === 'string') {
        try {
          userAnswer = JSON.parse(userAnswer);
        } catch (e) {
          // Ce n'est pas du JSON, garder la chaîne
        }
      }
      
      if (question.type === 'radio' || question.type === 'multiple_choice') {
        // Pour radio et multiple_choice, une seule réponse attendue
        return correctAnswers.includes(userAnswer);
      } else if (question.type === 'checkbox') {
        // Pour checkbox, plusieurs réponses possibles
        const userAnswers = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
        // Filtrer les valeurs vides et convertir en string
        const filteredUserAnswers = userAnswers
          .filter((ans: any) => ans && ans !== '')
          .map((ans: any) => String(ans));
        
        // Vérifier que toutes les bonnes réponses sont sélectionnées et qu'aucune mauvaise réponse ne l'est
        const allCorrectSelected = correctAnswers.every((ans: string) => filteredUserAnswers.includes(ans));
        const noIncorrectSelected = filteredUserAnswers.every((ans: string) => correctAnswers.includes(ans));
        return allCorrectSelected && noIncorrectSelected && filteredUserAnswers.length === correctAnswers.length;
      }
    }
    
    return null; // Pour les questions texte, on ne peut pas déterminer automatiquement
  }

  formatAnswer(value: any): string {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          return parsed.join(', ');
        }
        return parsed;
      } catch (e) {
        return value;
      }
    }
    return String(value || '');
  }

  getAnswerArray(value: any): string[] {
    if (Array.isArray(value)) {
      return value;
    }
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          return parsed;
        }
        return [parsed];
      } catch (e) {
        // Si c'est une chaîne avec des virgules, la diviser
        if (value.includes(',')) {
          return value.split(',').map((v: string) => v.trim());
        }
        return [value];
      }
    }
    return value ? [String(value)] : [];
  }

  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.sanitize(1, html) || '';
  }

  getCorrectAnswers(question: any): string[] {
    if (question.type === 'radio' || question.type === 'checkbox' || question.type === 'multiple_choice') {
      return question.options?.filter((opt: any) => opt.isCorrect).map((opt: any) => opt.text) || [];
    }
    return [];
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

  goBack() {
    // Vérifier si on vient du dashboard parent ou de l'admin
    const currentUrl = this.router.url;
    console.log('goBack - URL actuelle:', currentUrl);
    
    // Vérifier si on vient du dashboard parent (via l'historique ou un paramètre)
    // On peut aussi vérifier si on vient de /mon-compte en regardant l'historique
    if (currentUrl.includes('/evaluations/') && !currentUrl.includes('/admin/')) {
      // Probablement depuis le dashboard parent
      this.router.navigate(['/mon-compte'], { queryParams: { section: 'evaluations' } });
    } else if (this.evaluationId && currentUrl.includes('/admin/')) {
      this.router.navigate(['/admin/evaluations/results', this.evaluationId]);
    } else {
      // Par défaut, retourner au dashboard parent si on n'est pas sûr
      this.router.navigate(['/mon-compte'], { queryParams: { section: 'evaluations' } });
    }
  }
}

