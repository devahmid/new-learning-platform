import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Classe } from '../models/classe.model';
import { map, Observable } from 'rxjs';
import { ApiPaths } from '../shared/api-paths';
import { Schedule } from '../models/schedule.model';

// Export Classe pour les autres composants
export { Classe } from '../models/classe.model';

@Injectable({ providedIn: 'root' })
export class ClasseService {
  private baseUrl = ApiPaths.classes;

  constructor(private http: HttpClient) {}

  // Récupérer toutes les classes
  findAll(): Observable<Classe[]> {
    return this.getAllClasses();
  }

  // Alias pour compatibilité
  getAllClasses(): Observable<Classe[]> {
    return this.http.get<Classe[]>(`${this.baseUrl}`).pipe(
      map((classes: any[]) => {
        return classes.map(classe => ({
          ...classe,
          schedules: this.formatSchedule(classe.schedules), // Formatage des horaires
        }));
      })
    );
  }

  // Récupérer une classe par ID
  findById(id: number): Observable<Classe> {
    return this.http.get<Classe>(`${this.baseUrl}/${id}`).pipe(
      map(classe => ({
        ...classe,
        schedules: this.formatSchedule(classe.schedules || [])
      }))
    );
  }

  // ✅ Récupérer les matières d'une classe
  getCategoriesByClasse(classeId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${classeId}/categories`);
  }

  // ✅ Récupérer les cours d'une classe
  getCoursesByClasse(classeId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${classeId}/courses`);
  }

  // ✅ Récupérer les cours d'une classe avec toutes les matières
  getCoursesWithCategoriesByClasse(classeId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${classeId}/courses-with-categories`);
  }

  // ✅ Récupérer les étudiants d'une classe
  getStudentsByClasse(classeId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${classeId}/students`);
  }

// Exemple de formatage des créneaux horaires
formatSchedule(schedule: any[]): Schedule[] {
  if (!schedule || !Array.isArray(schedule)) {
    return [];
  }
  return schedule.map(item => ({
    ...item,
    startHour: this.formatTime(item.startHour),
    endHour: this.formatTime(item.endHour),
  }));
}

formatTime(time: string): string {
  // Formatage d'une heure (si nécessaire)
  const [hours, minutes] = time.split(':');
  return `${hours}:${minutes}`;
}

  create(data: Partial<Classe>): Observable<Classe> {
    return this.http.post<Classe>(this.baseUrl, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  update(id: number, data: Partial<Classe>): Observable<Classe> {
    return this.http.patch<Classe>(`${this.baseUrl}/${id}`, data);
  }

}
