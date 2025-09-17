import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessonProgress } from './lesson-progress.entity';
import { Repository } from 'typeorm';
import { Enrollment } from 'src/enrollment/enrollment.entity';
import { Lesson } from 'src/lesson/lesson.entity';

@Injectable()
export class LessonProgressService {
    constructor(
        @InjectRepository(LessonProgress)
        private readonly repo: Repository<LessonProgress>,
      
        @InjectRepository(Enrollment)
        private readonly enrollmentRepo: Repository<Enrollment>,
      
        @InjectRepository(Lesson)
        private readonly lessonRepo: Repository<Lesson>,
      ) {}
      

      async markLessonAsDone(enrollmentId: number, lessonId: number): Promise<LessonProgress> {
        const enrollment = await this.enrollmentRepo.findOneBy({ id: enrollmentId });
        const lesson = await this.lessonRepo.findOneBy({ id: lessonId });
      
        if (!enrollment || !lesson) {
          throw new Error('Enrollment or Lesson not found');
        }
      
        let progress = await this.repo.findOne({
          where: { enrollment: { id: enrollmentId }, lesson: { id: lessonId } },
        });
      
        if (!progress) {
          progress = this.repo.create({
            enrollment,
            lesson,
            completed: true,
          });
        } else {
          progress.completed = true;
        }
      
        return this.repo.save(progress);
      }
      
      async getCompletedLessons(enrollmentId: number): Promise<LessonProgress[]> {
        return this.repo.find({
          where: { enrollment: { id: enrollmentId }, completed: true },
          relations: ['lesson'],
        });
      }
      
}
