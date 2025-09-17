import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Message, Conversation, MessageFilters, SendMessageRequest, SendTemplateMessageRequest, MessageStats } from '../models/messaging.model';

@Injectable({
  providedIn: 'root'
})
export class MessagingService {
  private apiUrl = 'https://centre-culturel-olivier.fr/api';
  private messagesSubject = new BehaviorSubject<Message[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);
  private conversationsSubject = new BehaviorSubject<Conversation[]>([]);

  public messages$ = this.messagesSubject.asObservable();
  public unreadCount$ = this.unreadCountSubject.asObservable();
  public conversations$ = this.conversationsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUnreadCount();
  }

  /**
   * Envoyer un message
   */
  sendMessage(messageData: SendMessageRequest): Observable<Message> {
    return this.http.post<Message>(`${this.apiUrl}/messages/send`, messageData)
      .pipe(
        tap(() => {
          this.loadMessages();
          this.loadUnreadCount();
        }),
        catchError(error => {
          console.error('Erreur lors de l\'envoi du message:', error);
          throw error;
        })
      );
  }

  /**
   * Récupérer les messages
   */
  getMessages(filters?: MessageFilters): Observable<Message[]> {
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof MessageFilters];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<Message[]>(`${this.apiUrl}/messages`, { params })
      .pipe(
        tap(messages => {
          this.messagesSubject.next(messages);
        }),
        catchError(error => {
          console.error('Erreur lors du chargement des messages:', error);
          throw error;
        })
      );
  }

  /**
   * Charger les messages
   */
  loadMessages(filters?: MessageFilters): void {
    this.getMessages(filters).subscribe();
  }

  /**
   * Récupérer un message par ID
   */
  getMessage(id: number): Observable<Message> {
    return this.http.get<Message>(`${this.apiUrl}/messages/${id}`)
      .pipe(
        tap(message => {
          // Mettre à jour la liste des messages
          const messages = this.messagesSubject.value;
          const index = messages.findIndex(m => m.id === id);
          if (index !== -1) {
            messages[index] = message;
            this.messagesSubject.next([...messages]);
          }
        }),
        catchError(error => {
          console.error('Erreur lors du chargement du message:', error);
          throw error;
        })
      );
  }

  /**
   * Marquer un message comme lu
   */
  markAsRead(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/messages/${id}/read`, {})
      .pipe(
        tap(() => {
          // Mettre à jour le message localement
          const messages = this.messagesSubject.value;
          const message = messages.find(m => m.id === id);
          if (message) {
            message.is_read = true;
            message.read_at = new Date().toISOString();
            this.messagesSubject.next([...messages]);
            this.loadUnreadCount();
          }
        }),
        catchError(error => {
          console.error('Erreur lors de la mise à jour du message:', error);
          throw error;
        })
      );
  }

  /**
   * Marquer un message comme important
   */
  toggleImportant(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/messages/${id}/important`, {})
      .pipe(
        tap(() => {
          // Mettre à jour le message localement
          const messages = this.messagesSubject.value;
          const message = messages.find(m => m.id === id);
          if (message) {
            message.is_important = !message.is_important;
            this.messagesSubject.next([...messages]);
          }
        }),
        catchError(error => {
          console.error('Erreur lors de la mise à jour du message:', error);
          throw error;
        })
      );
  }

  /**
   * Archiver un message
   */
  archiveMessage(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/messages/${id}/archive`, {})
      .pipe(
        tap(() => {
          // Retirer le message de la liste
          const messages = this.messagesSubject.value.filter(m => m.id !== id);
          this.messagesSubject.next(messages);
        }),
        catchError(error => {
          console.error('Erreur lors de l\'archivage du message:', error);
          throw error;
        })
      );
  }

  /**
   * Supprimer un message
   */
  deleteMessage(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/messages/${id}`)
      .pipe(
        tap(() => {
          // Retirer le message de la liste
          const messages = this.messagesSubject.value.filter(m => m.id !== id);
          this.messagesSubject.next(messages);
        }),
        catchError(error => {
          console.error('Erreur lors de la suppression du message:', error);
          throw error;
        })
      );
  }

  /**
   * Récupérer les conversations
   */
  getConversations(limit: number = 20): Observable<Conversation[]> {
    const params = new HttpParams().set('limit', limit.toString());
    
    return this.http.get<Conversation[]>(`${this.apiUrl}/messages/conversations`, { params })
      .pipe(
        tap(conversations => {
          this.conversationsSubject.next(conversations);
        }),
        catchError(error => {
          console.error('Erreur lors du chargement des conversations:', error);
          throw error;
        })
      );
  }

  /**
   * Charger les conversations
   */
  loadConversations(limit?: number): void {
    this.getConversations(limit).subscribe();
  }

  /**
   * Récupérer les messages d'une conversation
   */
  getConversationMessages(otherUserId: number, limit: number = 50): Observable<Message[]> {
    const params = new HttpParams().set('limit', limit.toString());
    
    return this.http.get<Message[]>(`${this.apiUrl}/messages/conversations/${otherUserId}`, { params })
      .pipe(
        catchError(error => {
          console.error('Erreur lors du chargement des messages de conversation:', error);
          throw error;
        })
      );
  }

  /**
   * Rechercher des messages
   */
  searchMessages(query: string, limit: number = 20): Observable<Message[]> {
    const params = new HttpParams()
      .set('q', query)
      .set('limit', limit.toString());
    
    return this.http.get<Message[]>(`${this.apiUrl}/messages/search`, { params })
      .pipe(
        catchError(error => {
          console.error('Erreur lors de la recherche:', error);
          throw error;
        })
      );
  }

  /**
   * Récupérer le nombre de messages non lus
   */
  getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/messages/unread/count`)
      .pipe(
        tap(result => {
          this.unreadCountSubject.next(result.count);
        }),
        catchError(error => {
          console.error('Erreur lors du chargement du nombre de messages non lus:', error);
          throw error;
        })
      );
  }

  /**
   * Charger le nombre de messages non lus
   */
  loadUnreadCount(): void {
    this.getUnreadCount().subscribe();
  }

  /**
   * Récupérer les templates de messages
   */
  getTemplates(filters?: any): Observable<any[]> {
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<any[]>(`${this.apiUrl}/messages/templates`, { params })
      .pipe(
        catchError(error => {
          console.error('Erreur lors du chargement des templates:', error);
          throw error;
        })
      );
  }

  /**
   * Créer un template
   */
  createTemplate(templateData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/messages/templates`, templateData)
      .pipe(
        catchError(error => {
          console.error('Erreur lors de la création du template:', error);
          throw error;
        })
      );
  }

  /**
   * Envoyer un message avec template
   */
  sendTemplateMessage(templateData: SendTemplateMessageRequest): Observable<Message> {
    return this.http.post<Message>(`${this.apiUrl}/messages/send-template`, templateData)
      .pipe(
        tap(() => {
          this.loadMessages();
          this.loadUnreadCount();
        }),
        catchError(error => {
          console.error('Erreur lors de l\'envoi du message template:', error);
          throw error;
        })
      );
  }

  /**
   * Récupérer les statistiques des messages
   */
  getMessageStats(): Observable<MessageStats> {
    // Cette méthode pourrait être implémentée côté backend
    const messages = this.messagesSubject.value;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const stats: MessageStats = {
      total: messages.length,
      unread: messages.filter(m => !m.is_read).length,
      important: messages.filter(m => m.is_important).length,
      archived: messages.filter(m => m.is_archived).length,
      sent_today: messages.filter(m => 
        new Date(m.created_at) >= today && m.sender_id === this.getCurrentUserId()
      ).length,
      received_today: messages.filter(m => 
        new Date(m.created_at) >= today && m.recipient_id === this.getCurrentUserId()
      ).length
    };

    return new Observable(observer => {
      observer.next(stats);
      observer.complete();
    });
  }

  /**
   * Obtenir l'ID de l'utilisateur actuel
   */
  private getCurrentUserId(): number {
    // Implémentation selon votre système d'authentification
    const user = localStorage.getItem('currentUser');
    if (user) {
      return JSON.parse(user).id;
    }
    return 1; // ID par défaut pour les tests
  }

  /**
   * Formater la date d'un message
   */
  formatMessageDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'À l\'instant';
    } else if (diffInHours < 24) {
      return `Il y a ${Math.floor(diffInHours)}h`;
    } else if (diffInHours < 48) {
      return 'Hier';
    } else {
      return date.toLocaleDateString('fr-FR');
    }
  }

  /**
   * Tronquer le contenu d'un message
   */
  truncateMessage(content: string, maxLength: number = 100): string {
    if (content.length <= maxLength) {
      return content;
    }
    return content.substring(0, maxLength) + '...';
  }

  /**
   * Récupérer la liste des utilisateurs pour les destinataires
   */
  getUsers(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/messages/users`);
  }
}
