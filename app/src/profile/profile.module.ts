import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChildProfile } from './child-profile.entity';
import { ParentProfile } from './parent-profile.entity';
import { ChildProgress } from './child-progress.entity';
import { ChildLevel } from './child-level.entity';
import { ChildProgressService } from './child-progress.service';
import { ChildProgressController } from './child-progress.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChildProfile,
      ParentProfile,
      ChildProgress,
      ChildLevel,
    ]),
  ],
  controllers: [ChildProgressController],
  providers: [ChildProgressService],
  exports: [ChildProgressService],
})
export class ProfileModule {}
