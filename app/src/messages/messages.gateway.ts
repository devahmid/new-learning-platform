import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'http';
import { MessageService } from './messages.service';
import { CreateMessageDto } from './create-message.dto';
import { UpdateMessageDto } from './update-message.dto';

// @WebSocketGateway()
// export class MessagesGateway {
//   @SubscribeMessage('message')
//   handleMessage(client: any, payload: any): string {
//     return 'Hello world!';
//   }
// }
@WebSocketGateway()
export class MessageGateway {
  @WebSocketServer() server: Server;

  constructor(private service: MessageService) {}

  @SubscribeMessage('sendMessage')
  async handleSend(@MessageBody() data: CreateMessageDto) {
    const saved = await this.service.create(data);
    this.server.emit(`messageTo:${data.receiverId}`, saved);
    return saved;
  }

  @SubscribeMessage('getMessages')
  async handleGet(
    @MessageBody() payload: { userId1: number; userId2: number },
  ) {
    return this.service.findConversation(payload.userId1, payload.userId2);
  }

  @SubscribeMessage('deleteMessage')
  async handleDelete(
    @MessageBody() payload: { messageId: number; userId: number },
  ) {
    return this.service.deleteMessage(payload.messageId, payload.userId);
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(@MessageBody() messageId: number) {
    return this.service.markAsRead(messageId);
  }

  @SubscribeMessage('updateMessage')
  async handleUpdate(@MessageBody() dto: UpdateMessageDto) {
    const updated = await this.service.updateMessage(dto);
    this.server.emit(`messageUpdated:${updated.receiverId}`, updated);
    return updated;
  }
}
