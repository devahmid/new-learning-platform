import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { Enrollment } from '../enrollment/enrollment.entity';
import { Quiz } from 'src/quiz/quiz.entity';

@Entity()
export class QuizResult {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Enrollment, (enrollment) => enrollment.quizResults)
  enrollment: Enrollment;

  @ManyToOne(() => Quiz)
  quiz: Quiz;

  @Column()
  score: number; 

  @Column({ default: false })
  validated: boolean; 

  @CreateDateColumn()
  createdAt: Date;
}
