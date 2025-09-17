import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParentRegistration } from './entities/parent-registration.entity';
import { RegistrationService } from './registration.service';
import { RegistrationController } from './registration.controller';
import { Child } from './entities/child.entity';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [TypeOrmModule.forFeature([ParentRegistration, Child]), MailModule],
  controllers: [RegistrationController],
  providers: [RegistrationService],
  exports: [RegistrationService],
})
export class RegistrationModule {}

