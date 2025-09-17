// src/schedule/schedule.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Classe } from '../classe/classe.entity';

@Entity()
export class Schedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  day: string; // exemple : 'Lundi', 'Mardi'

  @Column()
  startHour: string; // exemple : '08:00'

  @Column()
  endHour: string; // exemple : '10:00'

  @ManyToOne(() => Classe, classe => classe.schedule, { onDelete: 'CASCADE' })
  classe: Classe;
}
