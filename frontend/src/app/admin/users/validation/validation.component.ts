import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { AdminUserValidationService } from '../../../services/admin-user-validation.service';
import { NotificationService } from '../../../services/notification.service';
import { UserValidationNotificationService } from '../../../services/user-validation-notification.service';

interface PendingUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  type: string;
  role: string;
  createdAt: string;
  status: string;
}

interface ValidationStats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

@Component({
  selector: 'app-validation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './validation.component.html',
  styleUrl: './validation.component.scss'
})
export class ValidationComponent implements OnInit, OnDestroy {
  pendingUsers: PendingUser[] = [];
  validationStats: ValidationStats = {
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  };
  
  // Gestion des modales
  selectedUser: PendingUser | null = null;
  displayValidationDialog = false;
  validationAction: 'approve' | 'reject' | 'pending' | null = null;
  rejectionReason = '';
  processingValidation = false;
  
  // Filtres et recherche
  searchTerm = '';
  statusFilter = 'all';
  
  private subs: Subscription[] = [];

  constructor(
    private adminValidationService: AdminUserValidationService,
    private notificationService: NotificationService,
    private validationNotificationService: UserValidationNotificationService
  ) {}

  ngOnInit(): void {
    this.loadPendingUsers();
    this.loadValidationStats();
  }

  ngOnDestroy(): void {
    this.subs.forEach(sub => sub.unsubscribe());
  }

  loadPendingUsers(): void {
    const sub = this.adminValidationService.getPendingUsers().subscribe({
      next: (response) => {
        this.pendingUsers = response.users || [];
      },
      error: (error) => {
        console.error('Erreur lors du chargement des utilisateurs en attente:', error);
        this.notificationService.show('Erreur lors du chargement des utilisateurs en attente', 'error');
      }
    });
    this.subs.push(sub);
  }

  loadValidationStats(): void {
    const sub = this.adminValidationService.getValidationStats().subscribe({
      next: (stats) => {
        this.validationStats = stats;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des statistiques:', error);
      }
    });
    this.subs.push(sub);
  }

  openValidationDialog(user: PendingUser, action: 'approve' | 'reject' | 'pending'): void {
    this.selectedUser = user;
    this.validationAction = action;
    this.rejectionReason = '';
    this.displayValidationDialog = true;
  }

  closeValidationDialog(): void {
    this.displayValidationDialog = false;
    this.selectedUser = null;
    this.validationAction = null;
    this.rejectionReason = '';
    this.processingValidation = false;
  }

  processValidation(): void {
    if (!this.selectedUser || !this.validationAction) return;

    if (this.validationAction === 'reject' && !this.rejectionReason.trim()) {
      this.notificationService.show('Veuillez indiquer la raison du rejet', 'error');
      return;
    }

    this.processingValidation = true;

    let request;
    if (this.validationAction === 'approve') {
      request = this.adminValidationService.approveUser(this.selectedUser.id);
    } else if (this.validationAction === 'reject') {
      request = this.adminValidationService.rejectUser(this.selectedUser.id, this.rejectionReason);
    } else if (this.validationAction === 'pending') {
      request = this.adminValidationService.setUserPending(this.selectedUser.id);
    } else {
      this.processingValidation = false;
      return;
    }

    const sub = request.subscribe({
      next: (response) => {
        this.notificationService.show(response.message, 'success');
        
        // Envoyer une notification à l'utilisateur
        this.sendValidationNotification(response);
        
        // Mettre à jour la liste des utilisateurs en attente
        this.pendingUsers = this.pendingUsers.filter(user => user.id !== this.selectedUser!.id);
        
        // Recharger les statistiques
        this.loadValidationStats();
        
        this.closeValidationDialog();
      },
      error: (error) => {
        console.error('Erreur lors de la validation:', error);
        this.notificationService.show('Erreur lors de la validation de l\'utilisateur', 'error');
        this.processingValidation = false;
      }
    });
    this.subs.push(sub);
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'approved':
        return 'Approuvé';
      case 'pending':
        return 'En attente';
      case 'rejected':
        return 'Rejeté';
      default:
        return 'Inconnu';
    }
  }

  getTypeLabel(type: string): string {
    switch (type) {
      case 'parent':
        return 'Parent';
      case 'child':
        return 'Enfant';
      default:
        return 'Utilisateur';
    }
  }

  getRoleLabel(role: string): string {
    switch (role) {
      case 'admin':
        return 'Administrateur';
      case 'parent':
        return 'Parent';
      case 'child':
        return 'Enfant';
      default:
        return 'Utilisateur';
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

  refreshData(): void {
    this.loadPendingUsers();
    this.loadValidationStats();
  }

  private sendValidationNotification(response: any): void {
    if (!this.selectedUser) return;

    const userName = `${this.selectedUser.firstName} ${this.selectedUser.lastName}`;
    const userEmail = this.selectedUser.email;

    let notificationRequest;
    
    if (this.validationAction === 'approve') {
      notificationRequest = this.validationNotificationService.sendApprovalNotification(
        this.selectedUser.id,
        userEmail,
        userName
      );
    } else if (this.validationAction === 'reject') {
      notificationRequest = this.validationNotificationService.sendRejectionNotification(
        this.selectedUser.id,
        userEmail,
        userName,
        this.rejectionReason
      );
    } else if (this.validationAction === 'pending') {
      notificationRequest = this.validationNotificationService.sendPendingNotification(
        this.selectedUser.id,
        userEmail,
        userName
      );
    } else {
      return;
    }

    notificationRequest.subscribe({
      next: () => {
        console.log('Notification de validation envoyée avec succès');
      },
      error: (error) => {
        console.error('Erreur lors de l\'envoi de la notification:', error);
        // Ne pas afficher d'erreur à l'utilisateur car la validation a réussi
      }
    });
  }
}
