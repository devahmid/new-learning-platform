import { Module } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Schedule } from './schedule.entity';
import { Classe } from 'src/classe/classe.entity';
import { User } from 'src/user/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Schedule, Classe, User])],
  providers: [ScheduleService],
  controllers: [ScheduleController],
  exports: [ScheduleService] 
})
export class ScheduleModule {}
