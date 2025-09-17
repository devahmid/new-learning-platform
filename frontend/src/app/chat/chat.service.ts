import { Injectable } from '@angular/core';
import io from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  // private socket = io('http://localhost:8080');

  // sendMessage(message: string) {
  //   this.socket.emit('sendMessage', message);
  // }

  // receiveMessage(callback: (message: string) => void) {
  //   this.socket.on('message', callback);
  // }
}
