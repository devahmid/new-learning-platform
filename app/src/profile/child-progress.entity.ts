import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Course } from '../course/course.entity';
import { Lesson } from '../lesson/lesson.entity';

@Entity()
export class ChildProgress {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  child: User;

  @Column()
  childId: number;

  @ManyToOne(() => Course, { nullable: true })
  course: Course;

  @Column({ nullable: true })
  courseId: number;

  @ManyToOne(() => Lesson, { nullable: true })
  lesson: Lesson;

  @Column({ nullable: true })
  lessonId: number;

  @Column({ default: 0 })
  progressPercentage: number; // 0-100%

  @Column({ default: false })
  isCompleted: boolean;

  @Column({ default: 0 })
  timeSpent: number; // en minutes

  @Column({ default: 0 })
  attempts: number; // nombre de tentatives

  @Column({ default: 0 })
  score: number; // score sur 100

  @Column({ type: 'json', nullable: true })
  quizResults: {
    quizId: number;
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    completedAt: Date;
  }[];

  @Column({ type: 'json', nullable: true })
  lessonNotes: {
    note: string;
    timestamp: Date;
  }[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  lastAccessedAt: Date;

  @Column({ default: 'not_started' })
  status: 'not_started' | 'in_progress' | 'completed' | 'review_needed';
}




