import { Injectable } from '@angular/core';
import { ApiPaths } from '../../shared/api-paths';
import { User } from '../../models/user.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ParentService {

  private baseUrl = ApiPaths.users;

  constructor(private http: HttpClient) { }

  getChildrenOfLoggedInParent() {
    return this.http.get<User[]>(`${this.baseUrl}/me/children`);
  }

}
