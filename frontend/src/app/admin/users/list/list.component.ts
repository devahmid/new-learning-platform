import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { UserService } from '../../../services/user.service';
import { AdminUserService } from '../../../services/admin-user.service';
import { AdminUserValidationService } from '../../../services/admin-user-validation.service';
import { UserValidationService } from '../../../services/user-validation.service';
import { AuthService } from '../../../auth/auth.service';
import { User } from '../../../models/user.model';
import { MessageService } from '../../../services/message.service';
import { CreateMessage, Message } from '../../../models/message.model';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent implements OnInit {
  currentUserId = 123;
  users: User[] = [];
  filteredUsers: User[] = [];
  globalFilter: string = '';
  selectedUser: User | null = null;
  displayUserDialog: boolean = false;
  messageText: string = '';
  displayChatDialog = false;
  messages: any[] = [];
  chatMessageText = '';
  sendingEmail = false;
  sendingSMS = false;
  
  // Gestion de la validation
  displayValidationDialog = false;
  validationAction: 'approve' | 'reject' | 'pending' | null = null;
  rejectionReason = '';
  processingValidation = false;
  
  private subs: Subscription[] = [];

  constructor(
    private userService: UserService, 
    private adminUserService: AdminUserService,
    private adminValidationService: AdminUserValidationService,
    private userValidationService: UserValidationService,
    private authService: AuthService,
    private messageService: MessageService, 
    private router: Router, 
    private notif: NotificationService
  ) { }

  ngOnInit(): void {
    this.subs.forEach(s => s.unsubscribe());
    
    // Utiliser le service admin pour récupérer les utilisateurs (avec statut de validation)
    this.adminUserService.getAllUsers().subscribe({
      next: (response) => {
        this.users = response.users;
        this.filteredUsers = response.users;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des utilisateurs:', error);
        this.notif.show('Erreur lors du chargement des utilisateurs', 'error');
        this.users = [];
        this.filteredUsers = [];
      }
    });
  }

  onSearchChange(): void {
    if (!this.globalFilter.trim()) {
      this.filteredUsers = this.users;
      return;
    }

    const filter = this.globalFilter.toLowerCase();
    this.filteredUsers = this.users.filter(user => 
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(filter) ||
      user.email?.toLowerCase().includes(filter) ||
      user.type?.toLowerCase().includes(filter) ||
      user.level?.name?.toLowerCase().includes(filter)
    );
  }

  exportToCsv() {
    console.log('exportToCsv');
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'parent':
        return 'bg-blue-100 text-blue-800';
      case 'child':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
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

  edit(user: User) {
    this.router.navigate(['/admin/users', user.id]);
  }

  openUserDialog(user: User) {
    this.selectedUser = user;
    this.messageText = '';
    this.displayUserDialog = true;
  }

  closeDialog() {
    this.displayUserDialog = false;
    this.selectedUser = null;
    this.messageText = '';
    this.sendingEmail = false;
    this.sendingSMS = false;
  }

  sendMessage(user: User, text: string) {
    if (!text || text.trim() === '') {
      this.notif.show('Veuillez saisir un message', 'error');
      return;
    }

    if (!user.email) {
      this.notif.show('L\'utilisateur n\'a pas d\'email', 'error');
      return;
    }

    this.sendingEmail = true;
    console.log('Envoi d\'email à:', user.email, 'Message:', text);
    
    this.notif.sendEmail({ 
      to: user.email, 
      subject: 'Message de l\'administration', 
      content: text 
    }).subscribe({
      next: () => {
        console.log('Email envoyé avec succès');
        this.notif.show('Email envoyé avec succès !', 'success');
        this.messageText = ''; // Vider le champ de message
        this.sendingEmail = false;
        this.closeDialog(); // Fermer la modal
      },
      error: (error: any) => {
        console.error('Erreur lors de l\'envoi de l\'email:', error);
        this.notif.show('Erreur lors de l\'envoi de l\'email', 'error');
        this.sendingEmail = false;
      }
    });
  }

  sendSMS(user: User, text: string) {
    if (!text || text.trim() === '') {
      this.notif.show('Veuillez saisir un message', 'error');
      return;
    }

    if (!user.phoneNumber) {
      this.notif.show('L\'utilisateur n\'a pas de numéro de téléphone', 'error');
      return;
    }

    this.sendingSMS = true;
    console.log('Envoi de SMS à:', user.phoneNumber, 'Message:', text);
    
    this.notif.sendSms({ 
      to: user.phoneNumber, 
      message: text 
    }).subscribe({
      next: () => {
        console.log('SMS envoyé avec succès');
        this.notif.show('SMS envoyé avec succès !', 'success');
        this.messageText = ''; // Vider le champ de message
        this.sendingSMS = false;
        this.closeDialog(); // Fermer la modal
      },
      error: (error: any) => {
        console.error('Erreur lors de l\'envoi du SMS:', error);
        this.notif.show('Erreur lors de l\'envoi du SMS', 'error');
        this.sendingSMS = false;
      }
    });
  }

  onSendChat(event?: Event) {
    console.log('onSendChat', event);
  }

  // Méthodes pour la gestion de la validation
  openValidationDialog(user: User, action: 'approve' | 'reject' | 'pending') {
    this.selectedUser = user;
    this.validationAction = action;
    this.rejectionReason = '';
    this.displayValidationDialog = true;
  }

  closeValidationDialog() {
    this.displayValidationDialog = false;
    this.selectedUser = null;
    this.validationAction = null;
    this.rejectionReason = '';
    this.processingValidation = false;
  }

  processValidation() {
    if (!this.selectedUser || !this.validationAction) return;

    if (this.validationAction === 'reject' && !this.rejectionReason.trim()) {
      this.notif.show('Veuillez indiquer la raison du rejet', 'error');
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

    request.subscribe({
      next: async (response) => {
        this.notif.show(response.message, 'success');
        
        // Mettre à jour l'utilisateur dans la liste
        const userIndex = this.users.findIndex(u => u.id === this.selectedUser!.id);
        if (userIndex !== -1) {
          this.users[userIndex].status = response.user?.status || this.validationAction === 'approve' ? 'approved' : 'rejected';
          this.users[userIndex].approved_at = response.user?.approved_at;
          this.users[userIndex].rejection_reason = response.user?.rejection_reason;
        }
        
        // Mettre à jour la liste filtrée
        this.onSearchChange();
        
        // Si c'est l'utilisateur actuellement connecté qui a été validé, forcer la mise à jour du statut
        const currentUser = this.authService.getCurrentUser();
        currentUser.subscribe(user => {
          if (user && user.id === this.selectedUser!.id) {
            // Forcer la mise à jour immédiate du statut de validation
            this.userValidationService.forceUpdateStatusImmediate();
          }
        });
        
        this.closeValidationDialog();
      },
      error: (error) => {
        console.error('Erreur lors de la validation:', error);
        this.notif.show('Erreur lors de la validation de l\'utilisateur', 'error');
        this.processingValidation = false;
      }
    });
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

  canValidateUser(user: User): boolean {
    // Permettre la validation de tous les utilisateurs sauf l'admin connecté
    return user.id !== this.currentUserId;
  }
}