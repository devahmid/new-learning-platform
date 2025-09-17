import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Enrollment } from 'src/enrollment/enrollment.entity';
import { Lesson } from 'src/lesson/lesson.entity';

@Entity()
export class LessonProgress {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Enrollment, (e) => e.lessonProgress)
  enrollment: Enrollment;

  @ManyToOne(() => Lesson)
  lesson: Lesson;

  @Column({ default: false })
  completed: boolean;
}
