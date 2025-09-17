import { AnswerService } from './answer.service';
import { Answer } from './answer.entity';
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';

@Controller('answers')
export class AnswerController {
  constructor(private readonly answerService: AnswerService) {}

  @Post()
  create(@Body() createAnswerDto: Partial<Answer>): Promise<Answer> {
    return this.answerService.create(createAnswerDto);
  }

  @Get()
  findAll(): Promise<Answer[]> {
    return this.answerService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Answer> {
    return this.answerService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAnswerDto: Partial<Answer>): Promise<Answer> {
    return this.answerService.update(+id, updateAnswerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.answerService.remove(+id);
  }
}
