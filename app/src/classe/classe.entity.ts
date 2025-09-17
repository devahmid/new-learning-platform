// src/classe/classe.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne } from 'typeorm';
import { User } from '../user/user.entity';
import { Schedule } from 'src/schedule/schedule.entity';

@Entity()
export class Classe {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  color?: string;

  @OneToMany(() => User, user => user.classe)
  students: User[];

  @OneToMany(() => Schedule, s => s.classe, { cascade: true })
  schedule: Schedule[];


  @ManyToOne(() => User, { nullable: true, eager: true })
  teacher: User;

}
