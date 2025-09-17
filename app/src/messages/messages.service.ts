import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './message.entity';
import { Repository } from 'typeorm';
import { CreateMessageDto } from './create-message.dto';
import { UpdateMessageDto } from './update-message.dto';

@Injectable()
export class MessageService {
  constructor(@InjectRepository(Message) private repo: Repository<Message>) {}

  async create(dto: CreateMessageDto) {
    const message = this.repo.create(dto);
    return this.repo.save(message);
  }

  async findConversation(userId1: number, userId2: number) {
    return this.repo.find({
      where: [
        { senderId: userId1, receiverId: userId2, deletedBySender: false },
        { senderId: userId2, receiverId: userId1, deletedByReceiver: false },
      ],
      order: { timestamp: 'ASC' },
    });
  }

  async deleteMessage(id: number, userId: number) {
    const msg = await this.repo.findOneBy({ id });
    if (!msg) return null;
    if (msg.senderId === userId) msg.deletedBySender = true;
    if (msg.receiverId === userId) msg.deletedByReceiver = true;
    return this.repo.save(msg);
  }

  async markAsRead(messageId: number) {
    const msg = await this.repo.findOneBy({ id: messageId });
    if (!msg) return null;
    msg.read = true;
    return this.repo.save(msg);
  }

  async updateMessage(dto: UpdateMessageDto) {
    const msg = await this.repo.findOneBy({ id: dto.id });
    if (!msg || msg.senderId !== dto.userId) return null;
    if (dto.newContent) msg.content = dto.newContent;
    if (dto.imageUrl) msg.imageUrl = dto.imageUrl;
    msg.editedAt = new Date();
    return this.repo.save(msg);
  }
}
