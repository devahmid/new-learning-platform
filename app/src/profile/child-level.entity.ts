import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Level } from '../level/level.entity';

@Entity()
export class ChildLevel {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  child: User;

  @Column()
  childId: number;

  @ManyToOne(() => Level, { nullable: true })
  level: Level;

  @Column({ nullable: true })
  levelId: number;

  @Column({ default: 'debutant' })
  currentLevel: 'debutant' | 'intermediaire' | 'avance' | 'expert';

  @Column({ default: 1 })
  levelNumber: number; // 1, 2, 3, etc.

  @Column({ default: 0 })
  experiencePoints: number; // XP gagnés

  @Column({ default: 0 })
  totalLessonsCompleted: number;

  @Column({ default: 0 })
  totalQuizzesPassed: number;

  @Column({ default: 0 })
  streakDays: number; // jours consécutifs d'apprentissage

  @Column({ type: 'json', nullable: true })
  achievements: {
    id: string;
    name: string;
    description: string;
    unlockedAt: Date;
    icon: string;
  }[];

  @Column({ type: 'json', nullable: true })
  learningPath: {
    subject: string;
    currentUnit: number;
    totalUnits: number;
    unitProgress: number;
  }[];

  @Column({ default: 'active' })
  status: 'active' | 'paused' | 'completed';

  @Column({ nullable: true })
  lastStudyDate: Date;

  @Column({ nullable: true })
  nextReviewDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}




