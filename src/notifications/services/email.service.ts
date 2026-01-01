import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);

    constructor(private readonly mailerService: MailerService) {}

    async sendEmail(to: string, subject: string, body: string): Promise<void> {
        try {
            await this.mailerService.sendMail({
                to,
                subject,
                text: body,
            });

            this.logger.log(`Email sent successfully to ${to}`);
        } catch (error) {
            this.logger.error(
                `Failed to send email to ${to}: ${error.message}`,
            );
            throw error;
        }
    }

    async sendReportEmail(
        to: string,
        subject: string,
        content: string,
    ): Promise<void> {
        return this.sendEmail(to, subject, content);
    }
}
