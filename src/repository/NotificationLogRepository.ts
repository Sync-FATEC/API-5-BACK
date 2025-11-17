import { AppDataSource } from "../database/data-source";
import { NotificationLog, NotificationChannel, NotificationEvent } from "../database/entities/NotificationLog";

const repository = AppDataSource.getRepository(NotificationLog);

export class NotificationLogRepository {
  async log(params: { appointmentId?: string; recipient: string; subject: string; content: string; channel: NotificationChannel; event: NotificationEvent; success: boolean; errorMessage?: string }) {
    const entity = repository.create(params);
    return repository.save(entity);
  }

  async hasReminderSent(appointmentId: string) {
    return repository.exists({ where: { appointmentId, event: NotificationEvent.REMINDER, success: true } });
  }
}