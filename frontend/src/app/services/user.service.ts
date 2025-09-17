import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user.model';
import { Observable } from 'rxjs';
import { ApiPaths } from '../shared/api-paths';

@Injectable({ providedIn: 'root' })
export class UserService {
  private baseUrl = ApiPaths.users;

  constructor(private http: HttpClient) { }

  findAll(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl);
  }

  getById(id: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/${id}`);
  }

  getParents() {
    return this.http.get<User[]>(`${this.baseUrl}/parents`);
  }

  findByClasse(classeId: number): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}?classeId=${classeId}`);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
  deleteChild(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/children/${id}`);
  }

  removeClasseFromStudent(studentId: number): Observable<User> {
    return this.http.patch<User>(`${this.baseUrl}/${studentId}`, {
      classe: null
    });
  }

  updateParent(id: number, data: any): Observable<User> {
    return this.http.patch<User>(`${this.baseUrl}/parents/${id}`, data);
  }

  update(id: number, data: Partial<User>): Observable<User> {
    console.log('****************** ', id, data)
    return this.http.patch<User>(`${this.baseUrl}/${id}`, data);
  }

  updateChild(id: number, data: any): Observable<User> {
    return this.http.patch<User>(`${this.baseUrl}/children/${id}`, data);
  }

}
