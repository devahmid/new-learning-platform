import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ContactMessage {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface ContactResponse {
  success: boolean;
  message: string;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Envoyer un message de contact
   */
  sendMessage(message: ContactMessage): Observable<ContactResponse> {
    return this.http.post<ContactResponse>(`${this.apiUrl}/contact/send`, message);
  }

  /**
   * Obtenir les informations de contact
   */
  getContactInfo(): Observable<any> {
    return this.http.get(`${this.apiUrl}/contact/info`);
  }
}
