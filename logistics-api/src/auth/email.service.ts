import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  async sendVerificationEmail(email: string, token: string) {
    const verificationUrl = `http://localhost:5173/verify-email?token=${token}`;
    this.logger.log(`[MOCK EMAIL] Sending verification email to ${email}`);
    this.logger.log(`[MOCK EMAIL] Verification URL: ${verificationUrl}`);
    // In a real application, you would use a library like nodemailer or an external service.
    return Promise.resolve();
  }
}
