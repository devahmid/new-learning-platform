import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuizResult } from './quiz-result.entity';

@Injectable()
export class QuizResultService {
  constructor(
    @InjectRepository(QuizResult)
    private quizResultRepository: Repository<QuizResult>,
  ) {}

  create(quizResultData: Partial<QuizResult>): Promise<QuizResult> {
    const quizResult = this.quizResultRepository.create(quizResultData);
    return this.quizResultRepository.save(quizResult);
  }

  findAll(): Promise<QuizResult[]> {
    return this.quizResultRepository.find({ relations: ['enrollment', 'quiz'] });
  }

  findOne(id: number): Promise<QuizResult> {
    return this.quizResultRepository.findOne({
      where: { id },
      relations: ['enrollment', 'quiz'],
    });
  }

  async update(id: number, updateData: Partial<QuizResult>): Promise<QuizResult> {
    await this.quizResultRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.quizResultRepository.delete(id);
  }
}
