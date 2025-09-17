import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private users: Record<string, string> = {}; // socketId => username

  handleConnection(client: Socket) {
    console.log(`Client connecté: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const username = this.users[client.id];
    delete this.users[client.id];
    this.server.emit('users', Object.values(this.users));
    this.server.emit('message', { user: 'System', text: `${username} a quitté le chat` });
  }

  @SubscribeMessage('join')
  handleJoin(client: Socket, username: string) {
    this.users[client.id] = username;
    this.server.emit('users', Object.values(this.users));
    this.server.emit('message', { user: 'System', text: `${username} a rejoint le chat` });
  }

  @SubscribeMessage('message')
  handleMessage(@MessageBody() data: { user: string; text: string }) {
    this.server.emit('message', data);
  }
}
