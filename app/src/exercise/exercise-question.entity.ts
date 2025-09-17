import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exercise } from './exercise.entity';
import { ExerciseAnswer } from './exercise-answer.entity';

@Entity()
export class ExerciseQuestion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  @Column({ nullable: true })
  audioUrl?: string;

  @Column({ nullable: true })
  imageUrl?: string;

  @Column({ default: 1 })
  order: number;

  @Column({ type: 'json', nullable: true })
  metadata?: {
    pronunciation?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    hints?: string[];
  };

  @ManyToOne(() => Exercise, (exercise) => exercise.questions)
  exercise: Exercise;

  @Column({ nullable: true })
  exerciseId: number;

  @OneToMany(() => ExerciseAnswer, (answer) => answer.question, {
    cascade: true,
    eager: true,
  })
  answers: ExerciseAnswer[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
