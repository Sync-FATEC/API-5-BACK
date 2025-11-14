import nodemailer from 'nodemailer';
import twilio from 'twilio';

export class NotificationService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'localhost',
      port: Number(process.env.SMTP_PORT || 1025),
      secure: (process.env.SMTP_SECURE || 'false') === 'true',
      auth: process.env.SMTP_USER && process.env.SMTP_PASS ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      } : undefined,
    });
  }

  async sendEmail(
    to: string,
    subject: string,
    body: string,
    options?: { html?: string; cc?: string | string[]; bcc?: string | string[]; attachments?: Array<{ filename: string; content: Buffer | string; contentType?: string }> }
  ): Promise<{ success: boolean; messageId?: string; errorMessage?: string }> {
    try {
      const info = await this.transporter.sendMail({
        from: process.env.SMTP_FROM || 'no-reply@clinic.local',
        to,
        cc: options?.cc,
        bcc: options?.bcc,
        subject,
        text: options?.html ? undefined : body,
        html: options?.html ?? undefined,
        attachments: options?.attachments,
      });
      return { success: true, messageId: info?.messageId };
    } catch (error: any) {
      console.warn('Falha ao enviar e-mail (simulado/logado):', error);
      return { success: false, errorMessage: String(error?.message || error) };
    }
  }

  async sendSMS(phone: string, message: string) {
    try {
      const sid = process.env.TWILIO_ACCOUNT_SID;
      const token = process.env.TWILIO_AUTH_TOKEN;
      const from = process.env.TWILIO_FROM;
      if (sid && token && from) {
        const client = twilio(sid, token);
        await client.messages.create({ to: phone, from, body: message });
        return true;
      }
      console.log(`SMS (simulado) para ${phone}: ${message}`);
      return true;
    } catch (error) {
      console.warn('Falha ao enviar SMS (simulado/logado):', error);
      return false;
    }
  }
}