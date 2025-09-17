import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { LevelService } from './level.service';
import { Level } from './level.entity';

@Controller('levels')
export class LevelController {
  constructor(private readonly levelService: LevelService) {}

  @Post()
  create(@Body() createLevelDto: Partial<Level>): Promise<Level> {
    return this.levelService.create(createLevelDto);
  }

  @Get()
  findAll(): Promise<Level[]> {
    return this.levelService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Level> {
    return this.levelService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLevelDto: Partial<Level>): Promise<Level> {
    return this.levelService.update(+id, updateLevelDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.levelService.remove(+id);
  }
}
