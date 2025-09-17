import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './payment.entity';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { MailModule } from 'src/mail/mail.module';
import { Level } from 'src/level/level.entity';
import { ProfileModule } from 'src/profile/profile.module';
import { ChildProfile } from 'src/profile/child-profile.entity';
import { ParentProfile } from 'src/profile/parent-profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Payment,
      User,
      Level,
      ChildProfile,
      ParentProfile,
    ]),
    MailModule,
    ProfileModule,
  ],
  providers: [PaymentService, UserService],
  controllers: [PaymentController],
  exports: [PaymentService],
})
export class PaymentModule {}
