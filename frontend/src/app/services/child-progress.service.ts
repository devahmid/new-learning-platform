import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChildProgressService {
  constructor() {}

  getProgress(): Observable<any[]> {
    return of([]);
  }
}
