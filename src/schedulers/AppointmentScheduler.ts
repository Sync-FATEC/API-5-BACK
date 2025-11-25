import { AppDataSource } from "../database/data-source";
import { Appointment } from "../database/entities/Appointment";
import { AppointmentStatus } from "../database/enums/AppointmentStatus";
import { NotificationService } from "../services/NotificationService";
import { NotificationLogRepository } from "../repository/NotificationLogRepository";
import { appointmentReminderTemplate } from "../templates/email/AppointmentTemplates";
import { UsersRepository } from "../repository/UsersRepository";
import { NotificationEvent } from "../database/entities/NotificationLog";

export class AppointmentScheduler {
  private intervalId: any;
  private notifier = new NotificationService();
  private logRepo = new NotificationLogRepository();
  private usersRepo = new UsersRepository();

  startScheduler(minutes: number = 30) {
    if (this.intervalId) return;
    this.intervalId = setInterval(() => this.run(), minutes * 60 * 1000);
    this.run();
  }

  stopScheduler() {
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = null;
  }

  async triggerOnce() { await this.run(); }

  private async run() {
    try {
      const repo = AppDataSource.getRepository(Appointment);
      const now = new Date();
      const cutoff = new Date(now.getTime() + (Number(process.env.APPOINTMENT_REMINDER_HOURS || 24) * 60 * 60 * 1000));
      const upcoming = await repo.createQueryBuilder('a')
        .where('a.status = :status', { status: AppointmentStatus.AGENDADO })
        .andWhere('a.dataHora > :now AND a.dataHora <= :cutoff', { now, cutoff })
        .orderBy('a.dataHora', 'ASC')
        .getMany();

      for (const appt of upcoming) {
        const alreadySent = await this.logRepo.hasReminderSent(appt.id);
        if (alreadySent) continue;
        const paciente = await this.usersRepo.getById(appt.pacienteId);
        const email = paciente?.email;
        if (!email) continue;
        const html = appointmentReminderTemplate({
          pacienteNome: paciente.name ?? email,
          examNome: appt.examType?.nome ?? appt.examTypeId,
          dataHora: appt.dataHora.toLocaleString(),
          instrucoes: appt.examType?.preparoNecessario ?? undefined,
        });
        await this.notifier.sendEmail(email, 'Lembrete de Exame', 'Lembrete: seu exame está próximo.', { html, meta: { appointmentId: appt.id, event: NotificationEvent.REMINDER } });
      }
    } catch (error) {
      console.error('Erro no AppointmentScheduler:', error);
    }
  }
}