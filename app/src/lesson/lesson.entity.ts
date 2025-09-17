import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Course } from '../course/course.entity';
import { Exercise } from '../exercise/exercise.entity';

@Entity()
export class Lesson {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  videoUrl?: string;

  @Column({ nullable: true })
  fileUrl?: string;

  @Column({ nullable: true, type: 'text' })
  content?: string;

  @Column({ default: 1 })
  order: number;

  @ManyToOne(() => Course, (course) => course.lessons)
  course: Course;

  @Column({ nullable: true })
  courseId: number;

  @OneToMany(() => Exercise, (exercise) => exercise.lesson, { cascade: true })
  exercises: Exercise[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
