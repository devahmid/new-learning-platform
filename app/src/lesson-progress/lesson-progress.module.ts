import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LessonProgress } from './lesson-progress.entity';
import { LessonProgressService } from './lesson-progress.service';
import { LessonProgressController } from './lesson-progress.controller';
import { Enrollment } from 'src/enrollment/enrollment.entity';
import { Lesson } from 'src/lesson/lesson.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
          LessonProgress,
          Enrollment,   
          Lesson        
        ]),
      ],
  providers: [LessonProgressService],
  controllers: [LessonProgressController],
  exports: [LessonProgressService],
})
export class LessonProgressModule {}
