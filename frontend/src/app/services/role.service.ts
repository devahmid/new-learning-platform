import { Injectable } from "@angular/core";
import { ApiPaths } from "../shared/api-paths";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({ providedIn: 'root' })
export class RoleService {
//   private baseUrl = ApiPaths.roles; 

//   constructor(private http: HttpClient) {}

//   findAll(): Observable<Role[]> {
//     return this.http.get<Role[]>(this.baseUrl);
//   }

//   create(role: Partial<Role>): Observable<Role> {
//     return this.http.post<Role>(this.baseUrl, role);
//   }
}
