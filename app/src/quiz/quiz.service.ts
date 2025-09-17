import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quiz } from './quiz.entity';

@Injectable()
export class QuizService {
  constructor(
    @InjectRepository(Quiz)
    private quizRepository: Repository<Quiz>,
  ) {}

  create(quizData: Partial<Quiz>): Promise<Quiz> {
    const quiz = this.quizRepository.create(quizData);
    return this.quizRepository.save(quiz);
  }

  findAll(): Promise<Quiz[]> {
    return this.quizRepository.find({ relations: ['course', 'questions'] });
  }

  findOne(id: number): Promise<Quiz> {
    return this.quizRepository.findOne({
      where: { id },
      relations: ['course', 'questions'],
    });
  }

  async update(id: number, updateData: Partial<Quiz>): Promise<Quiz> {
    await this.quizRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.quizRepository.delete(id);
  }
}
