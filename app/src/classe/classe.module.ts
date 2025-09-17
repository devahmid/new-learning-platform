import { Module } from '@nestjs/common';
import { ClasseService } from './classe.service';
import { ClasseController } from './classe.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Classe } from './classe.entity';
import { User } from 'src/user/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Classe, User])],
  providers: [ClasseService],
  controllers: [ClasseController],
  exports: [ClasseService],
})
export class ClasseModule {}
