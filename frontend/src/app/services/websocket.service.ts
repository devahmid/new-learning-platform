import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  //private socket: Socket;

  constructor() {
    //this.socket = io(environment.apiBaseUrl); 
  }

  sendMessage(message: string) {
    //this.socket.emit('message', message);
  }

  //onMessage(): Observable<string> {
    // return new Observable((observer) => {
    //   this.socket.on('message', (msg: string) => {
    //     observer.next(msg);
    //   });
    // });
  //}
}
