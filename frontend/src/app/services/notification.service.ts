import { HttpClient } from '@angular/common/http';
import { computed, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiPaths } from '../shared/api-paths';

interface SendEmailDto {
  to: string;
  subject: string;
  content: string;
}

interface SendSmsDto {
  to: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private baseUrl = ApiPaths.notifications
  private _message = signal<string | null>(null);
  readonly message = this._message.asReadonly();
  private _type = signal<'error' | 'info' | 'success'>('info');
  readonly type = this._type.asReadonly();
  private clearTimeoutId: any = null;

  constructor(private http: HttpClient) { }

  sendEmail(dto: SendEmailDto): Observable<any> {
    console.log('📧 Envoi d\'email réel:', dto);
    return this.http.post(`${this.baseUrl}/email`, dto);
  }

  sendSms(dto: SendSmsDto): Observable<any> {
    // Simulation temporaire en attendant le déploiement des endpoints
    console.log('📱 Simulation d\'envoi de SMS:', dto);
    
    return new Observable(observer => {
      setTimeout(() => {
        observer.next({
          status: 'ok',
          message: 'SMS envoyé avec succès (simulation)',
          to: dto.to,
          message_content: dto.message
        });
        observer.complete();
      }, 1000); // Simuler un délai d'envoi
    });
    
    // Version réelle (à décommenter quand les endpoints seront déployés)
    // return this.http.post(`${this.baseUrl}/sms`, dto);
  }


  show(message: string, type: 'error' | 'info' | 'success' = 'info') {
    console.log('NotificationService.show appelé:', message, type);
    
    // Annuler le timeout précédent s'il existe
    if (this.clearTimeoutId) {
      clearTimeout(this.clearTimeoutId);
    }
    
    this._message.set(message);
    this._type.set(type);
    console.log('Message mis à jour:', this._message());
    
    // Programmer le clear dans 3 secondes
    this.clearTimeoutId = setTimeout(() => {
      console.log('Timeout de 3 secondes déclenché');
      this.clear();
    }, 3000);
  }

  clear() {
    console.log('NotificationService.clear() appelé');
    if (this.clearTimeoutId) {
      clearTimeout(this.clearTimeoutId);
      this.clearTimeoutId = null;
    }
    this._message.set(null);
  }

  isVisible = computed(() => {
    const visible = this._message() !== null;
    console.log('isVisible computed:', visible, 'message:', this._message());
    return visible;
  });

}
