import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { Quiz } from './quiz.entity';

@Controller('quizzes')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post()
  create(@Body() createQuizDto: Partial<Quiz>): Promise<Quiz> {
    return this.quizService.create(createQuizDto);
  }

  @Get()
  findAll(): Promise<Quiz[]> {
    return this.quizService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Quiz> {
    return this.quizService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateQuizDto: Partial<Quiz>): Promise<Quiz> {
    return this.quizService.update(+id, updateQuizDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.quizService.remove(+id);
  }
}
