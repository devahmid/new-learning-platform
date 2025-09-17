import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizResult } from './quiz-result.entity';
import { QuizResultService } from './quiz-result.service';
import { QuizResultController } from './quiz-result.controller';

@Module({
  imports: [TypeOrmModule.forFeature([QuizResult])],
  providers: [QuizResultService],
  controllers: [QuizResultController],
  exports: [QuizResultService],
})
export class QuizResultModule {}
