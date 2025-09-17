import { Course } from 'src/course/course.entity';
import { LessonProgress } from 'src/lesson-progress/lesson-progress.entity';
import { QuizResult } from 'src/quiz-result/quiz-result.entity';
import { User } from 'src/user/user.entity';
import { 
    Entity, 
    Column, 
    PrimaryGeneratedColumn, 
    ManyToOne, 
    OneToMany, 
    CreateDateColumn, 
    UpdateDateColumn 
  } from 'typeorm';
  
  @Entity()
  export class Enrollment {
    @PrimaryGeneratedColumn()
    id: number;
  
    @ManyToOne(() => User, (user) => user.enrollments)
    student: User;
  
    @ManyToOne(() => Course, (course) => course.enrollments)
    course: Course;
  
    @Column({ default: 0 })
    progress: number; 
  
    @OneToMany(() => QuizResult, (quizResult) => quizResult.enrollment)
    quizResults: QuizResult[];

    @OneToMany(() => LessonProgress, (lp) => lp.enrollment)
    lessonProgress: LessonProgress[];

  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }
  