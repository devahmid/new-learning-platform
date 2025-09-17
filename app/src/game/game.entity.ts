import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../user/user.entity';

@Entity()
export class Game {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string; // Nom ou type de jeu

  @Column({ nullable: true })
  score: number; // Score du jeu, si pertinent

  @ManyToOne(() => User, (user) => user.games)
  player: User;

  @CreateDateColumn()
  playedAt: Date;
}
