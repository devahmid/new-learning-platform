import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Classe } from '../models/classe.model';
import { map, Observable } from 'rxjs';
import { ApiPaths } from '../shared/api-paths';
import { Schedule } from '../models/schedule.model';

@Injectable({ providedIn: 'root' })
export class ClasseService {
  private baseUrl = ApiPaths.classes;

  constructor(private http: HttpClient) {}

  // findAll(): Observable<Classe[]> {
  //   return this.http.get<Classe[]>(this.baseUrl);
  // }
// classe.service.ts
findById(id: number): Observable<Classe> {
  return this.http.get<Classe>(`${this.baseUrl}/${id}`).pipe(
    map(classe => ({
      ...classe,
      schedules: this.formatSchedule(classe.schedules || [])
    }))
  );
}

// Exemple de récupération des classes avec leurs emplois du temps
findAll(): Observable<Classe[]> {
  return this.http.get<Classe[]>(`${this.baseUrl}`).pipe(
    map((classes: any[]) => {
      return classes.map(classe => ({
        ...classe,
        schedules: this.formatSchedule(classe.schedules), // Formatage des horaires
      }));
    })
  );
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
