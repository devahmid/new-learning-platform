import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { QuizResultService } from './quiz-result.service';
import { QuizResult } from './quiz-result.entity';

@Controller('quiz-results')
export class QuizResultController {
  constructor(private readonly quizResultService: QuizResultService) {}

  @Post()
  create(@Body() createQuizResultDto: Partial<QuizResult>): Promise<QuizResult> {
    return this.quizResultService.create(createQuizResultDto);
  }

  @Get()
  findAll(): Promise<QuizResult[]> {
    return this.quizResultService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<QuizResult> {
    return this.quizResultService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateQuizResultDto: Partial<QuizResult>): Promise<QuizResult> {
    return this.quizResultService.update(+id, updateQuizResultDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.quizResultService.remove(+id);
  }
}
