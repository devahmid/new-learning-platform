import { Component, OnInit } from '@angular/core';
import { WebsocketService } from '../../services/websocket.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MessageService } from '../../services/message.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent implements OnInit {
  // messages: string[] = [];
  // newMessage: string = '';

  // constructor(private wsService: WebsocketService) {}

  // ngOnInit() {
  //   this.wsService.onMessage().subscribe((msg) => {
  //     this.messages.push(msg);
  //   });
  // }

  // send() {
  //   if (this.newMessage.trim()) {
  //     this.wsService.sendMessage(this.newMessage);
  //     this.newMessage = '';
  //   }
  // }
  messages: any[] = [];
  senderId = 1;
  receiverId = 2;
  newMsg = '';

  constructor(private service: MessageService) { }

  ngOnInit() {
    this.service
      .getMessages(this.senderId, this.receiverId)
      .subscribe((msgs) => (this.messages = msgs));

    this.service
      .onNewMessage(this.senderId)
      .subscribe((msg) => this.messages.push(msg));

    this.service.onMessageUpdated(this.senderId).subscribe(updated => {
      const index = this.messages.findIndex(m => m.id === updated.id);
      if (index > -1) this.messages[index] = updated;
    });

  }

  send() {
    if (this.newMsg.trim()) {
      this.service.sendMessage({
        senderId: this.senderId,
        receiverId: this.receiverId,
        content: this.newMsg,
      });
      this.newMsg = '';
    }
  }

  delete(id: number) {
    this.service.deleteMessage(id, this.senderId);
    this.messages = this.messages.filter((m) => m.id !== id);
  }
  handleImageUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.service.sendMessage({
        senderId: this.senderId,
        receiverId: this.receiverId,
        content: '',
        imageUrl: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  }

  editMessage(id: number, newContent: string) {
    this.service.updateMessage({ id, userId: this.senderId, newContent });
  }
}
