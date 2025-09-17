import { Body, Controller, Post } from '@nestjs/common';
import { SendSmsDto } from './dto/send-sms.dto/send-sms.dto';
import { SendEmailDto } from './dto/send-email.dto/send-email.dto';
import { SmsService } from './sms/sms.service';
import { MailService } from 'src/mail/mail.service';

@Controller('notifications')
export class NotificationsController {
     constructor(
    private readonly mailService: MailService,
    private readonly smsService: SmsService,
  ) {}

  @Post('email')
  async sendEmail(@Body() dto: SendEmailDto) {
    console.log('🚀 Envoi email à:', dto);
    await this.mailService.sendEmail(dto.to, dto.subject, dto.content);
    return { status: 'ok' };
  }

  @Post('sms')
  async sendSms(@Body() dto: SendSmsDto) {
    await this.smsService.sendSms(dto.to, dto.message);
    return { status: 'ok' };
  }
}
