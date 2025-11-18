import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import twilio from 'twilio';
import { NotificationLogRepository } from '../repository/NotificationLogRepository';
import { NotificationChannel, NotificationEvent } from '../database/entities/NotificationLog';
import { EmailTemplateService } from './EmailTemplateService';

export class NotificationService {
  private transporter;
  private logRepo = new NotificationLogRepository();
  private templateService = new EmailTemplateService();

  constructor() {
    const emailUser = process.env.EMAIL;
    let emailPass = process.env.EMAIL_PASSWORD || "";
    emailPass = emailPass.replace(/\s/g, '');

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT || 0);
    const smtpSecure = (process.env.SMTP_SECURE || 'false') === 'true';
    const smtpUser = process.env.SMTP_USER || emailUser;
    const smtpPass = process.env.SMTP_PASS || emailPass;

    if (smtpHost) {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort || 465,
        secure: smtpSecure || (smtpPort === 465),
        pool: true,
        keepAlive: true,
        maxConnections: Number(process.env.SMTP_MAX_CONNECTIONS || 1),
        maxMessages: Number(process.env.SMTP_MAX_MESSAGES || 50),
        connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT || 30000),
        socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT || 30000),
        auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined,
        tls: process.env.SMTP_TLS_REJECT_UNAUTHORIZED === 'false' ? { rejectUnauthorized: false } : undefined,
      } as any);
    } else {
      this.transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        pool: true,
        keepAlive: true,
        maxConnections: Number(process.env.SMTP_MAX_CONNECTIONS || 1),
        maxMessages: Number(process.env.SMTP_MAX_MESSAGES || 50),
        connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT || 30000),
        socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT || 30000),
        auth: {
          user: emailUser,
          pass: emailPass,
        }
      } as any);
    }
  }

  async sendEmail(
    to: string,
    subject: string,
    body: string,
    options?: {
      html?: string;
      cc?: string | string[];
      bcc?: string | string[];
      attachments?: Array<{
        filename: string;
        content: Buffer | string;
        contentType?: string;
      }>;
      meta?: { appointmentId?: string; event?: NotificationEvent };
    }
  ): Promise<{ success: boolean; messageId?: string; errorMessage?: string }> {
    let lastError: any = null;
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const info = await this.transporter.sendMail({
          from: process.env.SMTP_FROM || process.env.EMAIL || 'no-reply@sistema.local',
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
        lastError = error;
        if (attempt < 2) {
          await new Promise((r) => setTimeout(r, 500));
          continue;
        }
      }
    }
    await this.logRepo.log({
      appointmentId: options?.meta?.appointmentId,
      recipient: to,
      subject,
      content: options?.html ? (options.html as string) : body,
      channel: NotificationChannel.EMAIL,
      event: options?.meta?.event || NotificationEvent.SCHEDULED,
      success: false,
      errorMessage: String(lastError?.message || lastError),
    });
    return { success: false, errorMessage: String(lastError?.message || lastError) };
  }

  async sendTemplateEmail(
    to: string,
    templateName: string,
    vars: Record<string, string>,
    meta?: { appointmentId?: string; event?: NotificationEvent }
  ) {
    const rendered = await this.templateService.renderByName(templateName, vars);
    return this.sendEmail(to, rendered.subject, '', { html: rendered.html, meta });
  }

  async sendSMS(
    phone: string,
    message: string,
    meta?: { appointmentId?: string; event?: NotificationEvent }
  ) {
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
          subject: "SMS",
          content: message,
          channel: NotificationChannel.SMS,
          event: meta?.event || NotificationEvent.SCHEDULED,
          success: true,
        });

        return true;
      }

      // Modo simulado (não tem Twilio configurado)
      console.log(`SMS (simulado) para ${phone}: ${message}`);

      await this.logRepo.log({
        appointmentId: meta?.appointmentId,
        recipient: phone,
        subject: "SMS",
        content: message,
        channel: NotificationChannel.SMS,
        event: meta?.event || NotificationEvent.SCHEDULED,
        success: true,
      });

      return true;

    } catch (error: any) {
      console.warn("Falha ao enviar SMS:", error);

      await this.logRepo.log({
        appointmentId: meta?.appointmentId,
        recipient: phone,
        subject: "SMS",
        content: message,
        channel: NotificationChannel.SMS,
        event: meta?.event || NotificationEvent.SCHEDULED,
        success: false,
        errorMessage: String(error?.message || error),
      });

      return false;
    }
  }
}