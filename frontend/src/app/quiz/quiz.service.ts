import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private apiUrl = 'https://api.arrisala.fr/quizs';

  constructor(private http: HttpClient) {}

  getQuiz(coursId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${coursId}`);
  }

  soumettreQuiz(reponses: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/submit`, reponses);
  }
}
