import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Level } from './level.entity';

@Injectable()
export class LevelService {
  constructor(
    @InjectRepository(Level)
    private levelRepository: Repository<Level>,
  ) {}

  create(level: Partial<Level>): Promise<Level> {
    const newLevel = this.levelRepository.create(level);
    return this.levelRepository.save(newLevel);
  }

  findAll(): Promise<Level[]> {
    return this.levelRepository.find();
  }

  findOne(id: number): Promise<Level> {
    return this.levelRepository.findOneBy({ id });
  }

  async update(id: number, updateLevel: Partial<Level>): Promise<Level> {
    await this.levelRepository.update(id, updateLevel);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.levelRepository.delete(id);
  }
}
