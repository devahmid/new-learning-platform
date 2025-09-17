import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from './question.entity';

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
  ) {}

  create(questionData: Partial<Question>): Promise<Question> {
    const question = this.questionRepository.create(questionData);
    return this.questionRepository.save(question);
  }

  findAll(): Promise<Question[]> {
    return this.questionRepository.find({ relations: ['quiz', 'answers'] });
  }

  findOne(id: number): Promise<Question> {
    return this.questionRepository.findOne({
      where: { id },
      relations: ['quiz', 'answers'],
    });
  }

  async update(id: number, updateData: Partial<Question>): Promise<Question> {
    await this.questionRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.questionRepository.delete(id);
  }
}
