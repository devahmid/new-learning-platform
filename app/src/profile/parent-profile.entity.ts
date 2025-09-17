import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from 'src/user/user.entity';

@Entity()
export class ParentProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column({ nullable: true })
  secondaryPhone?: string;

  @Column('simple-array', { nullable: true })
  platforms: string[]; // ['WhatsApp', 'Telegram']

  @Column('simple-array', { nullable: true })
  preferredGroups: string[];

  @Column({ default: false })
  emailOnly: boolean;

  @Column({ nullable: true })
  address: string;

}
