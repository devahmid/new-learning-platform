import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiPaths } from '../shared/api-paths';
import { Level } from '../models/level.model';


@Injectable({ providedIn: 'root' })
export class LevelService {
  private api =  ApiPaths.levels;;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Level[]> {
    return this.http.get<Level[]>(this.api);
  }

  get(id: number): Observable<Level> {
    return this.http.get<Level>(`${this.api}/${id}`);
  }

  create(data: Level): Observable<Level> {
    return this.http.post<Level>(this.api, data);
  }

  update(id: number, data: Partial<Level>): Observable<Level> {
    return this.http.patch<Level>(`${this.api}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}
