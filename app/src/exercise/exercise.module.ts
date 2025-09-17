import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExerciseController } from './exercise.controller';
import { ExercisePublicController } from './exercise-public.controller';
import { ExerciseAdminController } from './exercise-admin.controller';
import { ExerciseService } from './exercise.service';
import { Exercise } from './exercise.entity';
import { ExerciseQuestion } from './exercise-question.entity';
import { ExerciseAnswer } from './exercise-answer.entity';
import { Lesson } from '../lesson/lesson.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Exercise,
      ExerciseQuestion,
      ExerciseAnswer,
      Lesson,
    ]),
  ],
  controllers: [
    ExerciseController,
    ExercisePublicController,
    ExerciseAdminController,
  ],
  providers: [ExerciseService],
  exports: [ExerciseService],
})
export class ExerciseModule {}
