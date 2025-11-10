import { SystemError } from "../middlewares/SystemError";
import { AppointmentRepository } from "../repository/AppointmentRepository";
import { SchedulerUtils } from "../utils/SchedulerUtils";
import { AppointmentStatus } from "../database/enums/AppointmentStatus";
import { UsersRepository } from "../repository/UsersRepository";
import { NotificationService } from "./NotificationService";

const repo = new AppointmentRepository();
const usersRepo = new UsersRepository();
const notifier = new NotificationService();

export class AppointmentService {
  async create(data: { pacienteId: string; examTypeId: string; dataHora: string; observacoes?: string }) {
    const { pacienteId, examTypeId, dataHora, observacoes } = data;
    if (!pacienteId || !examTypeId || !dataHora) throw new SystemError("Paciente, tipo de exame e data/hora são obrigatórios");
    const date = new Date(dataHora);
    if (isNaN(date.getTime())) throw new SystemError("Data/hora inválida");
    if (!SchedulerUtils.isWithinClinicHours(date)) throw new SystemError("Horário fora do funcionamento da clínica");
    const created = await repo.create({ pacienteId, examTypeId, dataHora: date, observacoes });
    // Notificar paciente (e-mail)
    const paciente = await usersRepo.getById(pacienteId);
    if (paciente?.email) {
      const msg = `Seu agendamento foi confirmado para ${created.dataHora.toLocaleString()}.`;
      await notifier.sendEmail(paciente.email, 'Confirmação de Agendamento', msg);
      // Notificação por SMS (opcional via env de teste)
      const smsTo = process.env.APPOINTMENT_SMS_TEST_TO;
      if (smsTo) {
        await notifier.sendSMS(smsTo, msg);
      }
    }
    return created;
  }

  async list(filters: { start?: string; end?: string; pacienteId?: string; examTypeId?: string; status?: AppointmentStatus }) {
    const parsed = {
      start: filters.start ? new Date(filters.start) : undefined,
      end: filters.end ? new Date(filters.end) : undefined,
      pacienteId: filters.pacienteId,
      examTypeId: filters.examTypeId,
      status: filters.status,
    };
    if (parsed.start && isNaN(parsed.start.getTime())) throw new SystemError("Data inicial inválida");
    if (parsed.end && isNaN(parsed.end.getTime())) throw new SystemError("Data final inválida");
    return repo.list(parsed);
  }

  async update(id: string, data: { dataHora?: string; status?: AppointmentStatus; observacoes?: string }) {
    const payload: any = {};
    if (data.dataHora) {
      const date = new Date(data.dataHora);
      if (isNaN(date.getTime())) throw new SystemError("Data/hora inválida");
      if (!SchedulerUtils.isWithinClinicHours(date)) throw new SystemError("Horário fora do funcionamento da clínica");
      payload.dataHora = date;
    }
    if (data.status) payload.status = data.status;
    if (data.observacoes !== undefined) payload.observacoes = data.observacoes;
    return repo.update(id, payload);
  }

  async cancel(id: string) {
    return repo.cancel(id);
  }
}