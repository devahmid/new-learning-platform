import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MessagingService } from '../../services/messaging.service';
import { Message, Conversation, MessageFilters } from '../../models/messaging.model';

@Component({
  selector: 'app-messaging',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './messaging.component.html',
  styleUrls: ['./messaging.component.scss']
})
export class MessagingComponent implements OnInit, OnDestroy {
  // État des données
  messages: Message[] = [];
  conversations: Conversation[] = [];
  users: any[] = [];
  selectedConversation: Conversation | null = null;
  selectedMessage: Message | null = null;
  
  // Filtres et recherche
  currentFilter: MessageFilters = {};
  searchQuery: string = '';
  
  // Interface utilisateur
  activeTab: 'inbox' | 'sent' | 'important' | 'archived' = 'inbox';
  showCompose: boolean = false;
  showConversations: boolean = true;
  loading: boolean = false;
  
  // Nouveau message
  newMessage = {
    recipient_id: 0,
    subject: 'toto',
    content: 'titi',
    is_important: false
  };
  
  // Souscriptions
  private subscriptions: Subscription[] = [];

  constructor(private messagingService: MessagingService) {}

  ngOnInit(): void {
    this.loadInitialData();
    this.setupSubscriptions();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Charger les données initiales
   */
  private loadInitialData(): void {
    this.loadMessages();
    this.loadConversations();
    this.loadUsers();
  }

  /**
   * Configurer les souscriptions
   */
  private setupSubscriptions(): void {
    // Souscrire aux messages
    const messagesSub = this.messagingService.messages$.subscribe(messages => {
      this.messages = Array.isArray(messages) ? messages : [];
    });

    // Souscrire aux conversations
    const conversationsSub = this.messagingService.conversations$.subscribe(conversations => {
      this.conversations = Array.isArray(conversations) ? conversations : [];
    });

    // Souscrire au nombre de messages non lus
    const unreadSub = this.messagingService.unreadCount$.subscribe(count => {
      // Mettre à jour l'interface si nécessaire
    });

    this.subscriptions.push(messagesSub, conversationsSub, unreadSub);
  }

  /**
   * Charger les messages
   */
  loadMessages(): void {
    this.loading = true;
    this.messagingService.loadMessages(this.currentFilter);
    this.loading = false;
  }

  /**
   * Charger les conversations
   */
  loadConversations(): void {
    this.messagingService.loadConversations();
  }

  /**
   * Charger les utilisateurs
   */
  loadUsers(): void {
    this.messagingService.getUsers().subscribe({
      next: (response) => {
        if (response.success) {
          this.users = response.data;
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des utilisateurs:', error);
      }
    });
  }

  /**
   * Changer d'onglet
   */
  switchTab(tab: 'inbox' | 'sent' | 'important' | 'archived'): void {
    this.activeTab = tab;
    this.selectedMessage = null;
    this.selectedConversation = null;
    
    // Appliquer les filtres selon l'onglet
    switch (tab) {
      case 'inbox':
        this.currentFilter = { is_archived: false };
        break;
      case 'sent':
        this.currentFilter = { is_archived: false };
        break;
      case 'important':
        this.currentFilter = { is_important: true, is_archived: false };
        break;
      case 'archived':
        this.currentFilter = { is_archived: true };
        break;
    }
    
    this.loadMessages();
  }

  /**
   * Sélectionner une conversation
   */
  selectConversation(conversation: Conversation): void {
    this.selectedConversation = conversation;
    this.selectedMessage = null;
    this.showConversations = false;
    
    // Charger les messages de la conversation
    this.messagingService.getConversationMessages(conversation.other_user_id)
      .subscribe(messages => {
        this.messages = messages;
      });
  }

  /**
   * Sélectionner un message
   */
  selectMessage(message: Message): void {
    this.selectedMessage = message;
    
    // Marquer comme lu si nécessaire
    if (!message.is_read) {
      this.messagingService.markAsRead(message.id).subscribe();
    }
  }

  /**
   * Marquer comme important
   */
  toggleImportant(message: Message): void {
    this.messagingService.toggleImportant(message.id).subscribe();
  }

  /**
   * Archiver un message
   */
  archiveMessage(message: Message): void {
    this.messagingService.archiveMessage(message.id).subscribe(() => {
      this.messages = this.messages.filter(m => m.id !== message.id);
      if (this.selectedMessage?.id === message.id) {
        this.selectedMessage = null;
      }
    });
  }

  /**
   * Supprimer un message
   */
  deleteMessage(message: Message): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
      this.messagingService.deleteMessage(message.id).subscribe(() => {
        this.messages = this.messages.filter(m => m.id !== message.id);
        if (this.selectedMessage?.id === message.id) {
          this.selectedMessage = null;
        }
      });
    }
  }

  /**
   * Rechercher des messages
   */
  searchMessages(): void {
    if (this.searchQuery.trim()) {
      this.messagingService.searchMessages(this.searchQuery)
        .subscribe(messages => {
          this.messages = messages;
        });
    } else {
      this.loadMessages();
    }
  }

  /**
   * Effacer la recherche
   */
  clearSearch(): void {
    this.searchQuery = '';
    this.loadMessages();
  }

  /**
   * Ouvrir le formulaire de composition
   */
  openCompose(): void {
    this.showCompose = true;
    this.newMessage = {
      recipient_id: 0,
      subject: '',
      content: '',
      is_important: false
    };
  }

  /**
   * Fermer le formulaire de composition
   */
  closeCompose(): void {
    this.showCompose = false;
  }

  /**
   * Envoyer un message
   */
  sendMessage(): void {
    if (!this.newMessage.recipient_id || !this.newMessage.subject || !this.newMessage.content) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    this.messagingService.sendMessage(this.newMessage).subscribe(() => {
      this.closeCompose();
      this.loadMessages();
      this.loadConversations();
    });
  }

  /**
   * Répondre à un message
   */
  replyToMessage(message: Message): void {
    this.openCompose();
    this.newMessage.recipient_id = message.sender_id;
    this.newMessage.subject = 'Re: ' + message.subject;
    this.newMessage.content = '\n\n--- Message original ---\n' + message.content;
  }

  /**
   * Retour à la liste des conversations
   */
  backToConversations(): void {
    this.showConversations = true;
    this.selectedConversation = null;
    this.selectedMessage = null;
    this.loadConversations();
  }

  /**
   * Formater la date d'un message
   */
  formatMessageDate(dateString: string): string {
    return this.messagingService.formatMessageDate(dateString);
  }

  /**
   * Tronquer le contenu d'un message
   */
  truncateMessage(content: string): string {
    return this.messagingService.truncateMessage(content, 100);
  }

  /**
   * Obtenir le nom complet d'un utilisateur
   */
  getFullName(firstName?: string, lastName?: string): string {
    if (!firstName && !lastName) return 'Utilisateur inconnu';
    return `${firstName || ''} ${lastName || ''}`.trim();
  }

  /**
   * Obtenir l'icône selon le type de message
   */
  getMessageIcon(messageType: string): string {
    switch (messageType) {
      case 'admin_to_parent':
        return '👨‍💼';
      case 'parent_to_admin':
        return '👨‍👩‍👧‍👦';
      case 'admin_to_admin':
        return '👥';
      case 'system':
        return '🤖';
      default:
        return '📧';
    }
  }

  /**
   * Formater la taille d'un fichier
   */
  formatFileSize(bytes: number): string {
    if (!bytes) return '0 B';
    
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Obtenir la classe CSS selon l'état du message
   */
  getMessageClass(message: Message): string {
    let classes = 'message-item';
    
    if (!message.is_read) {
      classes += ' unread';
    }
    
    if (message.is_important) {
      classes += ' important';
    }
    
    if (this.selectedMessage?.id === message.id) {
      classes += ' selected';
    }
    
    return classes;
  }
}
