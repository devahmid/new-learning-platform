import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lesson } from './lesson.entity';

@Injectable()
export class LessonService {
  constructor(
    @InjectRepository(Lesson)
    private lessonRepository: Repository<Lesson>,
  ) {}

  create(lessonData: Partial<Lesson>): Promise<Lesson> {
    const lesson = this.lessonRepository.create(lessonData);
    return this.lessonRepository.save(lesson);
  }

  findAll(): Promise<Lesson[]> {
    return this.lessonRepository.find();
  }

  findOne(id: number): Promise<Lesson> {
    return this.lessonRepository.findOneBy({ id });
  }

  async update(id: number, updateData: Partial<Lesson>): Promise<Lesson> {
    await this.lessonRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.lessonRepository.delete(id);
  }
}
