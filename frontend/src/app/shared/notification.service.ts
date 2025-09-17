import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { AuthService } from '../auth/auth.service';
import { CoursService } from '../cours/cours.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(private messageService: MessageService, private authService: AuthService, private coursService: CoursService) {}

  showSuccess(message: string) {
    this.messageService.add({ severity: 'success', summary: 'Succès', detail: message });
  }

  showError(message: string) {
    this.messageService.add({ severity: 'error', summary: 'Erreur', detail: message });
  }
}
