import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Twilio } from 'twilio';

@Injectable()
export class SmsService {
     private client = new Twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

  async sendSms(to: string, body: string): Promise<void> {
    try {
      await this.client.messages.create({
        to,
        from: process.env.TWILIO_PHONE_NUMBER, // votre numéro Twilio
        body,
      });
    } catch (err) {
      throw new InternalServerErrorException('Échec envoi SMS');
    }
  }
}
