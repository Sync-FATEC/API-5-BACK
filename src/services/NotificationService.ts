import nodemailer from 'nodemailer';
import twilio from 'twilio';

export class NotificationService {
  private transporter;

  constructor() {
    // Configuração via variáveis de ambiente (placeholder)
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'localhost',
      port: Number(process.env.SMTP_PORT || 1025),
      secure: false,
      auth: process.env.SMTP_USER && process.env.SMTP_PASS ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      } : undefined,
    });
  }

  async sendEmail(to: string, subject: string, text: string) {
    try {
      await this.transporter.sendMail({ from: process.env.SMTP_FROM || 'no-reply@clinic.local', to, subject, text });
      return true;
    } catch (error) {
      console.warn('Falha ao enviar e-mail (simulado/logado):', error);
      return false;
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