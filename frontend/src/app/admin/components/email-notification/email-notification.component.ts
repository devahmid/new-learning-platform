import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageModule } from 'primeng/message';
import { DividerModule } from 'primeng/divider';
import { BadgeModule } from 'primeng/badge';
import { NotificationService } from '../../services/notification.service';

interface UserStats {
  total_users: number;
  active_users: number;
  parents: number;
  teachers: number;
}

interface NotificationHistory {
  id: number;
  subject: string;
  content: string;
  total_recipients: number;
  success_count: number;
  error_count: number;
  sent_at: string;
  created_at: string;
}

@Component({
  selector: 'app-email-notification',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    InputTextareaModule,
    CardModule,
    ProgressSpinnerModule,
    ToastModule,
    MessageModule,
    DividerModule,
    BadgeModule
  ],
  template: `
    <div class="email-notification-container p-6">
      <!-- En-tête -->
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          <i class="fas fa-envelope text-blue-600 mr-3"></i>
          Notifications par email
        </h1>
        <p class="text-gray-600">Envoyez des communications importantes à tous vos utilisateurs</p>
      </div>

      <!-- Statistiques des utilisateurs -->
      <div class="mb-6" *ngIf="userStats">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div class="flex items-center">
              <i class="fas fa-users text-blue-600 text-2xl mr-3"></i>
              <div>
                <div class="text-2xl font-bold text-blue-900">{{ userStats.total_users }}</div>
                <div class="text-sm text-blue-600">Total utilisateurs</div>
              </div>
            </div>
          </div>
          <div class="bg-green-50 border border-green-200 rounded-lg p-4">
            <div class="flex items-center">
              <i class="fas fa-user-check text-green-600 text-2xl mr-3"></i>
              <div>
                <div class="text-2xl font-bold text-green-900">{{ userStats.active_users }}</div>
                <div class="text-sm text-green-600">Utilisateurs actifs</div>
              </div>
            </div>
          </div>
          <div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div class="flex items-center">
              <i class="fas fa-user-friends text-purple-600 text-2xl mr-3"></i>
              <div>
                <div class="text-2xl font-bold text-purple-900">{{ userStats.parents }}</div>
                <div class="text-sm text-purple-600">Parents</div>
              </div>
            </div>
          </div>
          <div class="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div class="flex items-center">
              <i class="fas fa-chalkboard-teacher text-orange-600 text-2xl mr-3"></i>
              <div>
                <div class="text-2xl font-bold text-orange-900">{{ userStats.teachers }}</div>
                <div class="text-sm text-orange-600">Professeurs</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Formulaire d'envoi -->
        <div>
          <p-card header="Nouvelle notification" styleClass="h-full">
            <form (ngSubmit)="sendNotification()" #emailForm="ngForm">
              <!-- Sujet -->
              <div class="mb-4">
                <label for="subject" class="block text-sm font-medium text-gray-700 mb-2">
                  Sujet de l'email *
                </label>
                <input 
                  type="text" 
                  id="subject"
                  name="subject"
                  [(ngModel)]="emailData.subject"
                  #subjectInput="ngModel"
                  required
                  maxlength="255"
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: Nouvelle session de cours disponible"
                >
                <div *ngIf="subjectInput.invalid && subjectInput.touched" class="text-red-500 text-sm mt-1">
                  Le sujet est requis
                </div>
              </div>

              <!-- Contenu -->
              <div class="mb-6">
                <label for="content" class="block text-sm font-medium text-gray-700 mb-2">
                  Contenu du message *
                </label>
                <textarea 
                  id="content"
                  name="content"
                  [(ngModel)]="emailData.content"
                  #contentInput="ngModel"
                  required
                  rows="8"
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Bonjour {{first_name}},

Nous vous informons que...

Cordialement,
L'équipe du Centre Culturel de l'Olivier"
                ></textarea>
                <div *ngIf="contentInput.invalid && contentInput.touched" class="text-red-500 text-sm mt-1">
                  Le contenu est requis
                </div>
                <div class="text-sm text-gray-500 mt-2">
                  <strong>Variables disponibles :</strong> {{first_name}}, {{last_name}}, {{full_name}}, {{email}}, {{phone}}
                </div>
              </div>

              <!-- Informations d'envoi -->
              <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <h4 class="font-semibold text-gray-900 mb-2">
                  <i class="fas fa-info-circle text-blue-600 mr-2"></i>
                  Informations d'envoi
                </h4>
                <div class="text-sm text-gray-600 space-y-1">
                  <div>• <strong>Destinataires :</strong> Tous les utilisateurs actifs ({{ userStats?.active_users || 0 }})</div>
                  <div>• <strong>Expéditeur :</strong> Centre Culturel de l'Olivier</div>
                  <div>• <strong>Format :</strong> HTML avec template personnalisé</div>
                </div>
              </div>

              <!-- Boutons d'action -->
              <div class="flex space-x-3">
                <button 
                  type="submit"
                  [disabled]="emailForm.invalid || isSending"
                  class="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
                >
                  <i class="fas fa-paper-plane mr-2" *ngIf="!isSending"></i>
                  <i class="fas fa-spinner fa-spin mr-2" *ngIf="isSending"></i>
                  {{ isSending ? 'Envoi en cours...' : 'Envoyer la notification' }}
                </button>
                <button 
                  type="button"
                  (click)="resetForm()"
                  [disabled]="isSending"
                  class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <i class="fas fa-undo mr-2"></i>
                  Réinitialiser
                </button>
              </div>
            </form>
          </p-card>
        </div>

        <!-- Historique des notifications -->
        <div>
          <p-card header="Historique des envois" styleClass="h-full">
            <div class="space-y-4">
              <!-- Loading state -->
              <div *ngIf="isLoadingHistory" class="flex items-center justify-center py-8">
                <i class="fas fa-spinner fa-spin text-blue-600 text-xl mr-2"></i>
                <span class="text-gray-600">Chargement de l'historique...</span>
              </div>

              <!-- Empty state -->
              <div *ngIf="!isLoadingHistory && notificationHistory.length === 0" class="text-center py-8">
                <i class="fas fa-inbox text-gray-400 text-4xl mb-4"></i>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Aucune notification envoyée</h3>
                <p class="text-gray-500">Les notifications que vous envoyez apparaîtront ici.</p>
              </div>

              <!-- Liste des notifications -->
              <div *ngIf="!isLoadingHistory && notificationHistory.length > 0" class="space-y-3">
                <div *ngFor="let notification of notificationHistory" 
                     class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div class="flex items-start justify-between mb-2">
                    <h4 class="font-semibold text-gray-900">{{ notification.subject }}</h4>
                    <span class="text-xs text-gray-500">{{ formatDate(notification.sent_at) }}</span>
                  </div>
                  <p class="text-sm text-gray-600 mb-3 line-clamp-2">{{ notification.content }}</p>
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4 text-sm">
                      <span class="flex items-center">
                        <i class="fas fa-users text-gray-400 mr-1"></i>
                        {{ notification.total_recipients }} destinataires
                      </span>
                      <span class="flex items-center text-green-600">
                        <i class="fas fa-check-circle mr-1"></i>
                        {{ notification.success_count }} envoyés
                      </span>
                      <span *ngIf="notification.error_count > 0" class="flex items-center text-red-600">
                        <i class="fas fa-exclamation-circle mr-1"></i>
                        {{ notification.error_count }} erreurs
                      </span>
                    </div>
                    <p-badge 
                      [value]="getStatusText(notification)" 
                      [severity]="getStatusSeverity(notification)">
                    </p-badge>
                  </div>
                </div>
              </div>

              <!-- Bouton actualiser -->
              <div class="pt-4 border-t border-gray-200">
                <button 
                  (click)="loadHistory()"
                  [disabled]="isLoadingHistory"
                  class="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <i class="fas fa-refresh" [class.fa-spin]="isLoadingHistory"></i>
                  <span>Actualiser l'historique</span>
                </button>
              </div>
            </div>
          </p-card>
        </div>
      </div>
    </div>

    <!-- Toast pour les messages -->
    <p-toast></p-toast>
  `,
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class EmailNotificationComponent implements OnInit {
  emailData = {
    subject: '',
    content: ''
  };

  userStats: UserStats | null = null;
  notificationHistory: NotificationHistory[] = [];
  isSending = false;
  isLoadingHistory = false;

  constructor(
    private notificationService: NotificationService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.loadUserStats();
    this.loadHistory();
  }

  loadUserStats() {
    this.notificationService.getUserStats().subscribe({
      next: (response) => {
        if (response.success) {
          this.userStats = response.data;
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des statistiques:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les statistiques des utilisateurs'
        });
      }
    });
  }

  loadHistory() {
    this.isLoadingHistory = true;
    this.notificationService.getHistory().subscribe({
      next: (response) => {
        if (response.success) {
          this.notificationHistory = response.data;
        }
        this.isLoadingHistory = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement de l\'historique:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger l\'historique des notifications'
        });
        this.isLoadingHistory = false;
      }
    });
  }

  sendNotification() {
    if (!this.emailData.subject || !this.emailData.content) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Attention',
        detail: 'Veuillez remplir tous les champs obligatoires'
      });
      return;
    }

    this.isSending = true;
    this.notificationService.sendToAll(this.emailData.subject, this.emailData.content).subscribe({
      next: (response) => {
        if (response.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Notification envoyée',
            detail: `Email envoyé à ${response.data.success_count} utilisateurs sur ${response.data.total_recipients}`
          });
          
          // Réinitialiser le formulaire
          this.resetForm();
          
          // Recharger l'historique
          this.loadHistory();
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: response.message || 'Erreur lors de l\'envoi de la notification'
          });
        }
        this.isSending = false;
      },
      error: (error) => {
        console.error('Erreur lors de l\'envoi:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors de l\'envoi de la notification'
        });
        this.isSending = false;
      }
    });
  }

  resetForm() {
    this.emailData = {
      subject: '',
      content: ''
    };
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusText(notification: NotificationHistory): string {
    if (notification.error_count === 0) {
      return 'Succès';
    } else if (notification.success_count === 0) {
      return 'Échec';
    } else {
      return 'Partiel';
    }
  }

  getStatusSeverity(notification: NotificationHistory): string {
    if (notification.error_count === 0) {
      return 'success';
    } else if (notification.success_count === 0) {
      return 'danger';
    } else {
      return 'warn';
    }
  }
}
