import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminUserController } from './admin-user.controller';
import { AdminService } from './admin.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { Course } from '../course/course.entity';
import { Lesson } from '../lesson/lesson.entity';
import { Quiz } from '../quiz/quiz.entity';
import { QuizResult } from '../quiz-result/quiz-result.entity';
import { Enrollment } from '../enrollment/enrollment.entity';
import { LessonProgress } from '../lesson-progress/lesson-progress.entity';
import { LevelModule } from '../level/level.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Course,
      Lesson,
      Quiz,
      QuizResult,
      Enrollment,
      LessonProgress,
    ]),
    LevelModule,
    UserModule,
  ],
  controllers: [AdminController, AdminUserController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
