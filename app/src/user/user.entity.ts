import { IsPhoneNumber } from 'class-validator';
import { Classe } from 'src/classe/classe.entity';
import { Enrollment } from 'src/enrollment/enrollment.entity';
import { Game } from 'src/game/game.entity';
import { Level } from 'src/level/level.entity';
import { Payment } from 'src/payment/payment.entity';
import { ChildProfile } from 'src/profile/child-profile.entity';
import { ParentProfile } from 'src/profile/parent-profile.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
  OneToMany,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: true })
  email: string | null;

  @Column({ nullable: true })
  @IsPhoneNumber('FR')
  phoneNumber: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({ type: 'enum', enum: ['parent', 'child'], default: 'parent' })
  type: 'parent' | 'child';

  @ManyToOne(() => User, (user) => user.children, { nullable: true })
  parent: User;

  @OneToMany(() => User, (user) => user.parent, { cascade: ['remove'] })
  children: User[];

  @OneToMany(() => Enrollment, (enrollment) => enrollment.student)
  enrollments: Enrollment[];

  @OneToMany(() => Game, (game) => game.player)
  games: Game[];

  @Column({ default: 'user' })
  role: string;

  @ManyToOne(() => Level, { nullable: true, eager: true })
  @JoinColumn({ name: 'levelId' })
  level: Level;

  @Column({ nullable: true })
  levelId: number;

  @OneToMany(() => Payment, (payment) => payment.user)
  payments: Payment[];

  @ManyToOne(() => Classe, (classe) => classe.students, { nullable: true })
  classe: Classe;

  @OneToOne(() => ParentProfile, (p) => p.user, { cascade: true, eager: true })
  parentProfile: ParentProfile;

  @OneToOne(() => ChildProfile, (c) => c.user, { cascade: true, eager: true })
  childProfile: ChildProfile;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  resetToken: string;

  @Column({ nullable: true })
  resetTokenExpiration: Date;
}
