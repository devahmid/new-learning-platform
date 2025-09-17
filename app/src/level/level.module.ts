import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Level } from './level.entity';
import { LevelService } from './level.service';
import { LevelController } from './level.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Level])],
  providers: [LevelService],
  controllers: [LevelController],
  exports: [LevelService],
})
export class LevelModule {}
