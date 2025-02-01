import { Injectable } from '@nestjs/common';
import Twilio from 'twilio';

@Injectable()
export class TwilioService {
  private client: Twilio.Twilio;

  constructor() {
    this.client = Twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
    );
  }

  async sendSms(to: string, message: string) {
    try {
      const response = await this.client.messages.create({
        body: message,
        from: 'Spa Meitar', // Alphanumeric Sender ID
        to: to, // Recipient's number in E.164 format
      });

      console.log('SMS sent successfully:', response.sid);
      return response;
    } catch (error) {
      console.error('Error sending SMS:', error);
      throw error;
    }
  }
}
