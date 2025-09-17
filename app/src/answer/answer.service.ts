import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Answer } from './answer.entity';

@Injectable()
export class AnswerService {
  constructor(
    @InjectRepository(Answer)
    private answerRepository: Repository<Answer>,
  ) {}

  create(answerData: Partial<Answer>): Promise<Answer> {
    const answer = this.answerRepository.create(answerData);
    return this.answerRepository.save(answer);
  }

  findAll(): Promise<Answer[]> {
    return this.answerRepository.find({ relations: ['question'] });
  }

  findOne(id: number): Promise<Answer> {
    return this.answerRepository.findOne({
      where: { id },
      relations: ['question'],
    });
  }

  async update(id: number, updateData: Partial<Answer>): Promise<Answer> {
    await this.answerRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.answerRepository.delete(id);
  }
}
