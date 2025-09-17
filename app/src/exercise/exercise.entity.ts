import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Lesson } from '../lesson/lesson.entity';
import { ExerciseQuestion } from './exercise-question.entity';

@Entity()
export class Exercise {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: [
      'flashcard',
      'translation',
      'listening',
      'multiple_choice',
      'fill_blank',
    ],
    default: 'flashcard',
  })
  type:
    | 'flashcard'
    | 'translation'
    | 'listening'
    | 'multiple_choice'
    | 'fill_blank';

  @Column({ default: 1 })
  order: number;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Lesson, (lesson) => lesson.exercises)
  lesson: Lesson;

  @Column({ nullable: true })
  lessonId: number;

  @OneToMany(() => ExerciseQuestion, (question) => question.exercise, {
    cascade: true,
    eager: true,
  })
  questions: ExerciseQuestion[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
