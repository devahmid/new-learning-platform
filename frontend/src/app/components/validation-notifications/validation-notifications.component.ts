import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { UserValidationNotificationService, ValidationNotification } from '../../services/user-validation-notification.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-validation-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './validation-notifications.component.html',
  styleUrl: './validation-notifications.component.scss'
})
export class ValidationNotificationsComponent implements OnInit, OnDestroy {
  @Input() userId?: number;
  
  notifications: ValidationNotification[] = [];
  unreadCount = 0;
  isLoading = false;
  hasError = false;
  errorMessage = '';
  
  private subs: Subscription[] = [];

  constructor(
    private validationNotificationService: UserValidationNotificationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
    this.loadUnreadCount();
  }

  ngOnDestroy(): void {
    this.subs.forEach(sub => sub.unsubscribe());
  }

  loadNotifications(): void {
    if (!this.userId) return;
    
    this.isLoading = true;
    this.hasError = false;
    
    const sub = this.validationNotificationService.getUserValidationNotifications(this.userId).subscribe({
      next: (notifications) => {
        this.notifications = notifications;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des notifications:', error);
        this.hasError = true;
        this.errorMessage = 'Erreur lors du chargement des notifications';
        this.isLoading = false;
      }
    });
    this.subs.push(sub);
  }

  loadUnreadCount(): void {
    if (!this.userId) return;
    
    const sub = this.validationNotificationService.getUnreadNotificationCount(this.userId).subscribe({
      next: (response) => {
        this.unreadCount = response.count;
      },
      error: (error) => {
        console.error('Erreur lors du chargement du nombre de notifications:', error);
      }
    });
    this.subs.push(sub);
  }

  markAsRead(notification: ValidationNotification): void {
    if (notification.read) return;
    
    const sub = this.validationNotificationService.markNotificationAsRead(notification.id).subscribe({
      next: () => {
        notification.read = true;
        this.unreadCount = Math.max(0, this.unreadCount - 1);
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour de la notification:', error);
      }
    });
    this.subs.push(sub);
  }

  markAllAsRead(): void {
    if (!this.userId || this.unreadCount === 0) return;
    
    const sub = this.validationNotificationService.markAllNotificationsAsRead(this.userId).subscribe({
      next: () => {
        this.notifications.forEach(notification => {
          notification.read = true;
        });
        this.unreadCount = 0;
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour des notifications:', error);
      }
    });
    this.subs.push(sub);
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'approval':
        return 'fa-check-circle';
      case 'rejection':
        return 'fa-times-circle';
      case 'pending':
        return 'fa-clock';
      default:
        return 'fa-info-circle';
    }
  }

  getNotificationClass(type: string): string {
    switch (type) {
      case 'approval':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'rejection':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  }

  getNotificationTitle(type: string): string {
    switch (type) {
      case 'approval':
        return 'Compte approuvé';
      case 'rejection':
        return 'Compte rejeté';
      case 'pending':
        return 'Compte en attente';
      default:
        return 'Notification';
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  refreshNotifications(): void {
    this.loadNotifications();
    this.loadUnreadCount();
  }
}
