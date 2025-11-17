import nodemailer from 'nodemailer';
import twilio from 'twilio';
import { NotificationLogRepository } from '../repository/NotificationLogRepository';
import { NotificationChannel, NotificationEvent } from '../database/entities/NotificationLog';
import { EmailTemplateService } from './EmailTemplateService';

export class NotificationService {
  private transporter;
  private logRepo = new NotificationLogRepository();
  private templateService = new EmailTemplateService();

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
    options?: { html?: string; cc?: string | string[]; bcc?: string | string[]; attachments?: Array<{ filename: string; content: Buffer | string; contentType?: string }>; meta?: { appointmentId?: string; event?: NotificationEvent } }
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
      await this.logRepo.log({
        appointmentId: options?.meta?.appointmentId,
        recipient: to,
        subject,
        content: options?.html ? (options.html as string) : body,
        channel: NotificationChannel.EMAIL,
        event: options?.meta?.event || NotificationEvent.SCHEDULED,
        success: true,
      });
      return { success: true, messageId: info?.messageId };
    } catch (error: any) {
      console.warn('Falha ao enviar e-mail (simulado/logado):', error);
      await this.logRepo.log({
        appointmentId: options?.meta?.appointmentId,
        recipient: to,
        subject,
        content: options?.html ? (options.html as string) : body,
        channel: NotificationChannel.EMAIL,
        event: options?.meta?.event || NotificationEvent.SCHEDULED,
        success: false,
        errorMessage: String(error?.message || error),
      });
      return { success: false, errorMessage: String(error?.message || error) };
    }
  }

  async sendTemplateEmail(to: string, templateName: string, vars: Record<string, string>, meta?: { appointmentId?: string; event?: NotificationEvent }) {
    const rendered = await this.templateService.renderByName(templateName, vars);
    return this.sendEmail(to, rendered.subject, '', { html: rendered.html, meta });
  }

  async sendSMS(phone: string, message: string, meta?: { appointmentId?: string; event?: NotificationEvent }) {
    try {
      const sid = process.env.TWILIO_ACCOUNT_SID;
      const token = process.env.TWILIO_AUTH_TOKEN;
      const from = process.env.TWILIO_FROM;
      if (sid && token && from) {
        const client = twilio(sid, token);
        await client.messages.create({ to: phone, from, body: message });
        await this.logRepo.log({
          appointmentId: meta?.appointmentId,
          recipient: phone,
          subject: 'SMS',
          content: message,
          channel: NotificationChannel.SMS,
          event: meta?.event || NotificationEvent.SCHEDULED,
          success: true,
        });
        return true;
      }
      console.log(`SMS (simulado) para ${phone}: ${message}`);
      await this.logRepo.log({
        appointmentId: meta?.appointmentId,
        recipient: phone,
        subject: 'SMS',
        content: message,
        channel: NotificationChannel.SMS,
        event: meta?.event || NotificationEvent.SCHEDULED,
        success: true,
      });
      return true;
    } catch (error) {
      console.warn('Falha ao enviar SMS (simulado/logado):', error);
      await this.logRepo.log({
        appointmentId: meta?.appointmentId,
        recipient: phone,
        subject: 'SMS',
        content: message,
        channel: NotificationChannel.SMS,
        event: meta?.event || NotificationEvent.SCHEDULED,
        success: false,
        errorMessage: String((error as any)?.message || error as any),
      });
      return false;
    }
  }
}