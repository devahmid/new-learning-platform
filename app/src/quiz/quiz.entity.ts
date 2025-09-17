import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Course } from '../course/course.entity';
import { Question } from 'src/question/question.entity';

@Entity()
export class Quiz {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @ManyToOne(() => Course, (course) => course.quizzes)
  course: Course;

  @Column({ nullable: true })
  courseId: number; // Ajout de la colonne explicite

  @OneToMany(() => Question, (question) => question.quiz, { cascade: true })
  questions: Question[];
}
