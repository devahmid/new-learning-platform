import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './course.entity';
import { Lesson } from '../lesson/lesson.entity';
import { Category } from '../category/category.entity';
import { Subcategory } from '../subcategory/entities/subcategory.entity';
import { Level } from '../level/level.entity';
import { User } from '../user/user.entity';
import { Quiz } from '../quiz/quiz.entity';
import { Question } from '../question/question.entity';
import { Answer } from '../answer/answer.entity';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { CourseSeedService } from './course-seed.service';
import { CourseSeedController } from './course-seed.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Course,
      Lesson,
      Category,
      Subcategory,
      Level,
      User,
      Quiz,
      Question,
      Answer,
    ]),
  ],
  controllers: [CourseController, CourseSeedController],
  providers: [CourseService, CourseSeedService],
})
export class CourseModule {}
