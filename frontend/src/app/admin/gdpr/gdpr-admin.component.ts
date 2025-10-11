import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GdprNotificationService } from '../../services/gdpr-notification.service';

interface ComplianceStats {
    totalUsers: number;
    compliantUsers: number;
    nonCompliantUsers: number;
    complianceRate: number;
    notificationsSent: {
        initial: number;
        reminder: number;
        final: number;
    };
}

interface NonCompliantUser {
    id: number;
    email: string;
    fullName: string;
    registrationDate: string;
    lastLogin: string;
    notificationsSent: string[];
    riskLevel: 'low' | 'medium' | 'high';
    firstName: string;
    lastName: string;
    phoneNumber: string;
    createdAt: string;
}

@Component({
    selector: 'app-gdpr-admin',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 flex items-center">
            🛡️ Administration RGPD
          </h1>
          <p class="mt-2 text-gray-600">
            Gestion de la conformité et notifications utilisateurs
          </p>
        </div>

        <!-- Statistics Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          <!-- Total Users -->
          <div class="bg-white p-6 rounded-lg shadow-md">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="text-2xl">👥</div>
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-semibold text-gray-900">Utilisateurs totaux</h3>
                <p class="text-3xl font-bold text-blue-600">{{ stats?.totalUsers || 0 }}</p>
              </div>
            </div>
          </div>

          <!-- Compliant Users -->
          <div class="bg-white p-6 rounded-lg shadow-md">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="text-2xl">✅</div>
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-semibold text-gray-900">Conformes</h3>
                <p class="text-3xl font-bold text-green-600">{{ stats?.compliantUsers || 0 }}</p>
              </div>
            </div>
          </div>

          <!-- Non-Compliant Users -->
          <div class="bg-white p-6 rounded-lg shadow-md">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="text-2xl">⚠️</div>
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-semibold text-gray-900">Non conformes</h3>
                <p class="text-3xl font-bold text-red-600">{{ stats?.nonCompliantUsers || 0 }}</p>
              </div>
            </div>
          </div>

          <!-- Compliance Rate -->
          <div class="bg-white p-6 rounded-lg shadow-md">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="text-2xl">📊</div>
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-semibold text-gray-900">Taux conformité</h3>
                <p class="text-3xl font-bold" [class]="getComplianceRateColor()">
                  {{ (stats?.complianceRate || 0).toFixed(1) }}%
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="bg-white p-6 rounded-lg shadow-md mb-8">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Progression de la conformité</h3>
          <div class="w-full bg-gray-200 rounded-full h-4">
            <div 
              class="bg-green-600 h-4 rounded-full transition-all duration-500"
              [style.width.%]="stats?.complianceRate || 0">
            </div>
          </div>
          <div class="flex justify-between mt-2 text-sm text-gray-600">
            <span>{{ stats?.compliantUsers || 0 }} conformes</span>
            <span>{{ stats?.nonCompliantUsers || 0 }} restants</span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="bg-white p-6 rounded-lg shadow-md mb-8">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <!-- Send Initial Notices -->
            <button 
              (click)="sendBulkNotifications('initial_notice')"
              [disabled]="loadingNotifications"
              class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              <div class="flex items-center justify-center">
                <span class="mr-2">📧</span>
                <span *ngIf="!loadingNotifications">Envoyer avis initiaux</span>
                <span *ngIf="loadingNotifications">Envoi en cours...</span>
              </div>
            </button>

            <!-- Send Reminders -->
            <button 
              (click)="sendBulkNotifications('reminder')"
              [disabled]="loadingNotifications"
              class="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              <div class="flex items-center justify-center">
                <span class="mr-2">⏰</span>
                <span *ngIf="!loadingNotifications">Envoyer rappels</span>
                <span *ngIf="loadingNotifications">Envoi en cours...</span>
              </div>
            </button>

            <!-- Send Final Notices -->
            <button 
              (click)="sendBulkNotifications('final_notice')"
              [disabled]="loadingNotifications"
              class="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              <div class="flex items-center justify-center">
                <span class="mr-2">🚨</span>
                <span *ngIf="!loadingNotifications">Avis finaux</span>
                <span *ngIf="loadingNotifications">Envoi en cours...</span>
              </div>
            </button>
          </div>

          <!-- Success/Error Messages -->
          <div *ngIf="notificationMessage" class="mt-4 p-4 rounded-lg" 
               [class]="notificationMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
            {{ notificationMessage.text }}
          </div>
        </div>

        <!-- Non-Compliant Users Table -->
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">Utilisateurs non conformes</h3>
            <p class="text-sm text-gray-600">Liste des utilisateurs nécessitant une action RGPD</p>
          </div>
          
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inscription
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dernière connexion
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notifications
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Risque
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr *ngFor="let user of nonCompliantUsers" class="hover:bg-gray-50">
                  
                  <!-- User Info -->
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div class="text-sm font-medium text-gray-900">{{ user.firstName }} {{ user.lastName }}</div>
                      <div class="text-sm text-gray-500">{{ user.email || 'Aucun email' }}</div>
                      <div class="text-xs text-gray-400">{{ user.phoneNumber || 'Aucun téléphone' }}</div>
                    </div>
                  </td>

                  <!-- Registration Date -->
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ formatDate(user.createdAt) }}
                  </td>

                  <!-- Last Login -->
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ user.lastLogin ? formatDate(user.lastLogin) : 'Jamais' }}
                  </td>

                  <!-- Notifications Sent -->
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex space-x-1">
                      <span *ngFor="let notification of (user.notificationsSent || [])" 
                            class="inline-block w-2 h-2 rounded-full" 
                            [class]="getNotificationColor(notification)"
                            [title]="getNotificationTitle(notification)">
                      </span>
                      <span *ngIf="!user.notificationsSent || user.notificationsSent.length === 0" class="text-gray-400 text-xs">
                        Aucune ({{ user.notificationsSent || 0 }})
                      </span>
                    </div>
                  </td>

                  <!-- Risk Level -->
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          [class]="getRiskLevelClass(user.riskLevel)">
                      {{ getRiskLevelText(user.riskLevel) }}
                    </span>
                  </td>

                  <!-- Actions -->
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button 
                      (click)="sendIndividualNotification(user, 'initial_notice')"
                      class="text-blue-600 hover:text-blue-900 p-1 rounded"
                      title="Envoyer avis initial">
                      📧
                    </button>
                    <button 
                      (click)="sendIndividualNotification(user, 'reminder')"
                      class="text-yellow-600 hover:text-yellow-900 p-1 rounded"
                      title="Envoyer rappel">
                      ⏰
                    </button>
                    <button 
                      (click)="sendIndividualNotification(user, 'final_notice')"
                      class="text-red-600 hover:text-red-900 p-1 rounded"
                      title="Envoyer avis final">
                      🚨
                    </button>
                  </td>
                </tr>

                <!-- Empty State -->
                <tr *ngIf="nonCompliantUsers.length === 0 && !loading">
                  <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                    <div class="text-4xl mb-2">🎉</div>
                    <div class="text-lg font-medium">Tous les utilisateurs sont conformes !</div>
                    <div class="text-sm">Félicitations, votre conformité RGPD est à 100%</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white p-6 rounded-lg">
            <div class="flex items-center">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-4"></div>
              <span>Chargement des données...</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  `
})
export class GdprAdminComponent implements OnInit {
    stats: ComplianceStats | null = null;
    nonCompliantUsers: NonCompliantUser[] = [];
    loading = false;
    loadingNotifications = false;
    notificationMessage: { type: 'success' | 'error', text: string } | null = null;

    constructor(private gdprNotificationService: GdprNotificationService) { }

    ngOnInit(): void {
        this.loadComplianceData();
    }

    async loadComplianceData(): Promise<void> {
        this.loading = true;
        try {
            // Charger les statistiques
            this.stats = await this.gdprNotificationService.getComplianceStats().toPromise();

            // Charger les utilisateurs non conformes
            const response = await this.gdprNotificationService.getNonCompliantUsers().toPromise();
            this.nonCompliantUsers = response?.data?.users || [];

        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
            this.showNotification('error', 'Erreur lors du chargement des données de conformité');
        } finally {
            this.loading = false;
        }
    }

    async sendBulkNotifications(type: 'initial_notice' | 'reminder' | 'final_notice'): Promise<void> {
        if (this.loadingNotifications) return;

        const confirmMessage = {
            'initial_notice': 'Envoyer les avis initiaux à tous les utilisateurs non conformes ?',
            'reminder': 'Envoyer des rappels à tous les utilisateurs non conformes ?',
            'final_notice': 'Envoyer les avis finaux à tous les utilisateurs non conformes ? (ACTION CRITIQUE)'
        };

        if (!confirm(confirmMessage[type])) return;

        this.loadingNotifications = true;
        try {
            await this.gdprNotificationService.sendBulkGdprNotifications(type).toPromise();

            const successMessage = {
                'initial_notice': 'Avis initiaux envoyés avec succès',
                'reminder': 'Rappels envoyés avec succès',
                'final_notice': 'Avis finaux envoyés avec succès'
            };

            this.showNotification('success', successMessage[type]);
            await this.loadComplianceData(); // Recharger les données

        } catch (error) {
            console.error('Erreur lors de l\'envoi des notifications:', error);
            this.showNotification('error', 'Erreur lors de l\'envoi des notifications');
        } finally {
            this.loadingNotifications = false;
        }
    }

    async sendIndividualNotification(user: NonCompliantUser, type: 'initial_notice' | 'reminder' | 'final_notice'): Promise<void> {
        try {
            await this.gdprNotificationService.sendGdprNotification({
                userId: user.id,
                email: user.email,
                fullName: user.fullName,
                notificationType: type
            }).toPromise();

            this.showNotification('success', `Notification envoyée à ${user.fullName}`);
            await this.loadComplianceData();

        } catch (error) {
            console.error('Erreur lors de l\'envoi de la notification:', error);
            this.showNotification('error', `Erreur lors de l'envoi à ${user.fullName}`);
        }
    }

    getComplianceRateColor(): string {
        if (!this.stats) return 'text-gray-400';

        const rate = this.stats.complianceRate;
        if (rate >= 90) return 'text-green-600';
        if (rate >= 70) return 'text-yellow-600';
        return 'text-red-600';
    }

    getRiskLevelClass(riskLevel: string): string {
        const classes = {
            'low': 'bg-green-100 text-green-800',
            'medium': 'bg-yellow-100 text-yellow-800',
            'high': 'bg-red-100 text-red-800'
        };
        return classes[riskLevel as keyof typeof classes] || 'bg-gray-100 text-gray-800';
    }

    getRiskLevelText(riskLevel: string): string {
        const texts = {
            'low': 'Faible',
            'medium': 'Moyen',
            'high': 'Élevé'
        };
        return texts[riskLevel as keyof typeof texts] || 'Inconnu';
    }

    getNotificationColor(notification: string): string {
        const colors = {
            'initial_notice': 'bg-blue-400',
            'reminder': 'bg-yellow-400',
            'final_notice': 'bg-red-400'
        };
        return colors[notification as keyof typeof colors] || 'bg-gray-400';
    }

    getNotificationTitle(notification: string): string {
        const titles = {
            'initial_notice': 'Avis initial envoyé',
            'reminder': 'Rappel envoyé',
            'final_notice': 'Avis final envoyé'
        };
        return titles[notification as keyof typeof titles] || 'Notification inconnue';
    }

    formatDate(dateString: string): string {
        return new Date(dateString).toLocaleDateString('fr-FR');
    }

    showNotification(type: 'success' | 'error', text: string): void {
        this.notificationMessage = { type, text };
        setTimeout(() => {
            this.notificationMessage = null;
        }, 5000);
    }
}