import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiPaths } from '../shared/api-paths';
import { Observable } from 'rxjs';

export type FeedbackPayload = {
  overall: number; // 1-5
  navigation: number; // 1-5
  clarity: number; // 1-5
  design: number; // 1-5
  mobile: number; // 1-5
  speed: number; // 1-5
  trust: number; // 1-5
  nps?: number | null; // 0-10
  improvement?: string | null;
  consentToContact?: boolean;
  email?: string | null;
  source?: string | null;
};

@Injectable({ providedIn: 'root' })
export class FeedbackService {
  constructor(private http: HttpClient) {}

  submit(payload: FeedbackPayload): Observable<any> {
    return this.http.post(ApiPaths.feedback, payload);
  }
}

