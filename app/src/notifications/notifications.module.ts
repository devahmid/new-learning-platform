import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { SmsService } from './sms/sms.service';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [MailModule],
  controllers: [NotificationsController],
  providers: [SmsService]
})
export class NotificationsModule { }
