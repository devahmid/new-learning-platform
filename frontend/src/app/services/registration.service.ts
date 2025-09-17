import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiPaths } from '../shared/api-paths';
import { Observable } from 'rxjs';
import { ParentRegistration } from '../models/parent-registration.model';

@Injectable({
  providedIn: 'root',
})
export class RegistrationService {

  private baseUrl = ApiPaths.registration;

  constructor(private http: HttpClient) { }

  submitRegistration(data: any) {
    return this.http.post(this.baseUrl, data);
  }

  getAll(): Observable<ParentRegistration[]> {
    return this.http.get<ParentRegistration[]>(this.baseUrl);
  }

}
