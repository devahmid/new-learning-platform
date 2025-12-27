import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Evaluation, EvaluationResponse } from '../models/evaluation.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EvaluationService {
  private apiUrl = `${environment.apiUrl}/evaluations`;

  constructor(private http: HttpClient) {}

  // Récupérer toutes les évaluations
  getAllEvaluations(): Observable<Evaluation[]> {
    return this.http.get<Evaluation[]>(this.apiUrl);
  }

  // Récupérer une évaluation par ID
  getEvaluationById(id: number): Observable<Evaluation> {
    return this.http.get<Evaluation>(`${this.apiUrl}/${id}`);
  }

  // Récupérer les évaluations d'un cours
  getEvaluationsByCourse(courseId: number): Observable<Evaluation[]> {
    return this.http.get<Evaluation[]>(`${this.apiUrl}/course/${courseId}`);
  }

  // Récupérer les évaluations d'une leçon
  getEvaluationsByLesson(lessonId: number): Observable<Evaluation[]> {
    return this.http.get<Evaluation[]>(`${this.apiUrl}/lesson/${lessonId}`);
  }

  // Créer une évaluation
  createEvaluation(evaluation: Evaluation): Observable<Evaluation> {
    return this.http.post<Evaluation>(this.apiUrl, evaluation);
  }

  // Mettre à jour une évaluation
  updateEvaluation(id: number, evaluation: Evaluation): Observable<Evaluation> {
    return this.http.put<Evaluation>(`${this.apiUrl}/${id}`, evaluation);
  }

  // Supprimer une évaluation
  deleteEvaluation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Soumettre une réponse à une évaluation
  submitResponse(evaluationId: number, response: EvaluationResponse): Observable<EvaluationResponse> {
    return this.http.post<EvaluationResponse>(`${this.apiUrl}/${evaluationId}/submit`, response);
  }

  // Récupérer les réponses d'une évaluation (pour l'admin)
  getEvaluationResponses(evaluationId: number): Observable<EvaluationResponse[]> {
    return this.http.get<EvaluationResponse[]>(`${this.apiUrl}/${evaluationId}/responses`);
  }

  // Récupérer les réponses d'un utilisateur pour une évaluation
  getUserResponse(evaluationId: number, userId?: number): Observable<EvaluationResponse | null> {
    const url = userId 
      ? `${this.apiUrl}/${evaluationId}/responses/user/${userId}`
      : `${this.apiUrl}/${evaluationId}/responses/user`;
    return this.http.get<EvaluationResponse | null>(url);
  }

  // Récupérer une réponse spécifique par son ID (admin)
  getResponseById(responseId: number): Observable<EvaluationResponse> {
    return this.http.get<EvaluationResponse>(`${this.apiUrl}/responses/${responseId}`);
  }

  // Récupérer les réponses d'évaluations pour les enfants d'un parent
  getChildrenResponses(parentId: number): Observable<EvaluationResponse[]> {
    return this.http.get<EvaluationResponse[]>(`${environment.apiUrl}/users/${parentId}/evaluations/responses`);
  }
}

