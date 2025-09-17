import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Exercise {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  answer?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ExerciseService {

  constructor(private http: HttpClient) { }

  getExercises(subject: string, level: string): Observable<Exercise[]> {
    return this.http.get<Exercise[]>(`${environment.apiUrl}/exercises?subject=${subject}&level=${level}`)
      .pipe(
        catchError(error => {
          console.error('Erreur lors du chargement des exercices:', error);
          return of([]); // Retourner un tableau vide en cas d'erreur
        })
      );
  }
  
  getExerciseById(id: number): Observable<Exercise | null> {
    return this.http.get<Exercise>(`${environment.apiUrl}/exercises/${id}`)
      .pipe(
        catchError(error => {
          console.error('Erreur lors du chargement de l\'exercice:', error);
          return of(null); // Retourner null en cas d'erreur
        })
      );
  }

  submitResults(score: number, total: number): Observable<any> {
    return this.http.post(`${environment.apiUrl}/exercise-results`, { score, total })
      .pipe(
        catchError(error => {
          console.error('Erreur lors de la soumission des résultats:', error);
          return of(null);
        })
      );
  }
  
}
