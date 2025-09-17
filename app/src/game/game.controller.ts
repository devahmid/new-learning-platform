import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { GameService } from './game.service';
import { Game } from './game.entity';

@Controller('games')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post()
  create(@Body() createGameDto: Partial<Game>): Promise<Game> {
    return this.gameService.create(createGameDto);
  }

  @Get()
  findAll(): Promise<Game[]> {
    return this.gameService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Game> {
    return this.gameService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGameDto: Partial<Game>): Promise<Game> {
    return this.gameService.update(+id, updateGameDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.gameService.remove(+id);
  }
}
