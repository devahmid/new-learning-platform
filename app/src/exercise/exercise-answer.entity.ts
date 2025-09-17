import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ExerciseQuestion } from './exercise-question.entity';

@Entity()
export class ExerciseAnswer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  @Column({ default: false })
  isCorrect: boolean;

  @Column({ default: 1 })
  order: number;

  @Column({ type: 'json', nullable: true })
  metadata?: {
    pronunciation?: string;
    explanation?: string;
  };

  @ManyToOne(() => ExerciseQuestion, (question) => question.answers)
  question: ExerciseQuestion;

  @Column({ nullable: true })
  questionId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
