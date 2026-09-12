import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiPaths } from '../../shared/api-paths';
import { Observable } from 'rxjs';

export type FeedbackRow = {
  id: number;
  overall: number;
  navigation: number;
  clarity: number;
  design: number;
  mobile: number;
  speed: number;
  trust: number;
  nps: number | null;
  improvement: string | null;
  consentToContact: 0 | 1;
  email: string | null;
  source: string | null;
  createdAt: string;
};

@Injectable({ providedIn: 'root' })
export class AdminFeedbackService {
  constructor(private http: HttpClient) {}

  list(): Observable<FeedbackRow[]> {
    return this.http.get<FeedbackRow[]>(ApiPaths.adminFeedback);
  }
}

