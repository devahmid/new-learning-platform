import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MailModule } from 'src/mail/mail.module';
import { Level } from 'src/level/level.entity';
import { ChildProfile } from 'src/profile/child-profile.entity';
import { ParentProfile } from 'src/profile/parent-profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Level, ChildProfile, ParentProfile]),
    MailModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
