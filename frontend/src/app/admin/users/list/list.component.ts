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
  
  // Filtres par type d'utilisateur
  showParents: boolean = true;
  showChildren: boolean = true;
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
    
    // Charger TOUS les utilisateurs (sans pagination)
    this.loadAllUsers();
  }

  // Méthode pour charger tous les utilisateurs
  private loadAllUsers(): void {
    this.adminUserService.getAllUsers({ limit: 1000 }).subscribe({
      next: (response) => {
        this.users = response.users || [];
        this.applyFilters(); // Appliquer les filtres après le chargement
        console.log(`✅ ${this.users.length} utilisateurs chargés sur ${response.total} total`);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des utilisateurs:', error);
        this.notif.show('Erreur lors du chargement des utilisateurs', 'error');
        this.users = [];
        this.filteredUsers = [];
      }
    });
  }

  // Méthode publique pour recharger tous les utilisateurs
  public refreshUsers(): void {
    this.loadAllUsers();
  }


  onSearchChange(): void {
    this.applyFilters();
  }

  // Appliquer tous les filtres (recherche + type)
  private applyFilters(): void {
    let filtered = [...this.users];

    // Filtre par type d'utilisateur
    if (!this.showParents || !this.showChildren) {
      filtered = filtered.filter(user => {
        if (user.type === 'parent' && !this.showParents) return false;
        if (user.type === 'child' && !this.showChildren) return false;
        return true;
      });
    }

    // Filtre par recherche textuelle
    if (this.globalFilter.trim()) {
      const filter = this.globalFilter.toLowerCase();
      filtered = filtered.filter(user => 
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(filter) ||
        user.email?.toLowerCase().includes(filter) ||
        user.type?.toLowerCase().includes(filter) ||
        user.level?.name?.toLowerCase().includes(filter)
      );
    }

    this.filteredUsers = filtered;
  }

  // Méthode appelée quand les checkboxes changent
  onFilterChange(): void {
    this.applyFilters();
  }

  // Compter le nombre de parents
  getParentCount(): number {
    return this.users.filter(user => user.type === 'parent').length;
  }

  // Compter le nombre d'enfants
  getChildCount(): number {
    return this.users.filter(user => user.type === 'child').length;
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
    if (!user.id) {
      console.error('ID utilisateur manquant:', user);
      this.notif.show('ID utilisateur manquant', 'error');
      return;
    }
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
    
    this.notif.sendEmail({ 
      to: user.email, 
      subject: 'Message de l\'administration', 
      content: text 
    }).subscribe({
      next: () => {
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
    
    this.notif.sendSms({ 
      to: user.phoneNumber, 
      message: text 
    }).subscribe({
      next: () => {
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

  // Méthodes pour la suppression d'utilisateur
  displayDeleteDialog = false;
  deletingUser = false;

  openDeleteDialog(user: User) {
    this.selectedUser = user;
    this.displayDeleteDialog = true;
  }

  closeDeleteDialog() {
    this.displayDeleteDialog = false;
    this.selectedUser = null;
    this.deletingUser = false;
  }

  deleteUser() {
    if (!this.selectedUser || !this.selectedUser.id) {
      this.notif.show('Utilisateur non sélectionné', 'error');
      return;
    }

    this.deletingUser = true;

    this.adminUserService.deleteUser(this.selectedUser.id).subscribe({
      next: (response) => {
        this.notif.show(response.message || 'Utilisateur supprimé avec succès', 'success');
        
        // Retirer l'utilisateur de la liste
        this.users = this.users.filter(u => u.id !== this.selectedUser!.id);
        this.filteredUsers = this.filteredUsers.filter(u => u.id !== this.selectedUser!.id);
        
        this.closeDeleteDialog();
      },
      error: (error) => {
        console.error('Erreur lors de la suppression:', error);
        this.notif.show('Erreur lors de la suppression de l\'utilisateur', 'error');
        this.deletingUser = false;
      }
    });
  }

  canDeleteUser(user: User): boolean {
    // Permettre la suppression de tous les utilisateurs sauf l'admin connecté
    return user.id !== this.currentUserId;
  }
}