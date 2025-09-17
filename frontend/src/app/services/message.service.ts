import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io } from 'socket.io-client';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MessageService {
  // private socket = io(environment.apiUrl);

  // sendMessage(msg: {
  //   senderId: number;
  //   receiverId: number;
  //   content: string;
  //   imageUrl?: string;
  // }) {
  //   this.socket.emit('sendMessage', msg);
  // }

  // getMessages(userId1: number, userId2: number): Observable<any[]> {
  //   return new Observable((observer) => {
  //     this.socket.emit('getMessages', { userId1, userId2 });
  //     this.socket.on('getMessages', (messages) => observer.next(messages));
  //   });
  // }

  // onNewMessage(receiverId: number): Observable<any> {
  //   return new Observable((observer) => {
  //     this.socket.on(`messageTo:${receiverId}`, (msg) => observer.next(msg));
  //   });
  // }
  // updateMessage(payload: { id: number; userId: number; newContent: string }) {
  //   this.socket.emit('updateMessage', payload);
  // }

  // onMessageUpdated(userId: number): Observable<any> {
  //   return new Observable((observer) => {
  //     this.socket.on(`messageUpdated:${userId}`, (updated) =>
  //       observer.next(updated)
  //     );
  //   });
  // }

  // deleteMessage(messageId: number, userId: number) {
  //   this.socket.emit('deleteMessage', { messageId, userId });
  // }
}
