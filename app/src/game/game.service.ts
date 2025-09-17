import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from './game.entity';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Game)
    private gameRepository: Repository<Game>,
  ) {}

  create(gameData: Partial<Game>): Promise<Game> {
    const game = this.gameRepository.create(gameData);
    return this.gameRepository.save(game);
  }

  findAll(): Promise<Game[]> {
    return this.gameRepository.find({ relations: ['player'] });
  }

  findOne(id: number): Promise<Game> {
    return this.gameRepository.findOne({
      where: { id },
      relations: ['player'],
    });
  }

  async update(id: number, updateData: Partial<Game>): Promise<Game> {
    await this.gameRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.gameRepository.delete(id);
  }
}
