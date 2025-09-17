import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Lesson } from '../lesson/lesson.entity';
import { Category } from '../category/category.entity';
import { Level } from '../level/level.entity';
import { Enrollment } from 'src/enrollment/enrollment.entity';
import { Quiz } from 'src/quiz/quiz.entity';
import { Subcategory } from 'src/subcategory/entities/subcategory.entity';

@Entity()
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ nullable: true })
  videoUrl?: string;

  @Column({ nullable: true })
  pdfUrl?: string;

  @ManyToOne(() => User, (user) => user.id)
  instructor: User;

  @Column({ nullable: true })
  instructorId: number;

  @ManyToOne(() => Category, (category) => category.courses, { nullable: true })
  category?: Category;

  @Column({ nullable: true })
  categoryId: number;

  @ManyToOne(() => Subcategory, (sub) => sub.courses)
  subcategory: Subcategory;

  @Column({ nullable: true })
  subcategoryId: number;

  @ManyToOne(() => Level, (level) => level.courses)
  level: Level;

  @Column({ nullable: true })
  levelId: number;

  @OneToMany(() => Enrollment, (enrollment) => enrollment.course)
  enrollments: Enrollment[];

  @OneToMany(() => Quiz, (quiz) => quiz.course, { cascade: true })
  quizzes: Quiz[];

  @OneToMany(() => Lesson, (lesson) => lesson.course, { cascade: true })
  lessons: Lesson[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
