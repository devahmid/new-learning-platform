import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  senderId: number;

  @Column()
  receiverId: number;

  @Column()
  content: string;

  @Column({ nullable: true })
  editedAt: Date;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ default: false })
  read: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;

  @Column({ default: false })
  deletedBySender: boolean;

  @Column({ default: false })
  deletedByReceiver: boolean;
}
