import { SystemError } from "../middlewares/SystemError";
import { AppointmentRepository } from "../repository/AppointmentRepository";
import { SchedulerUtils } from "../utils/SchedulerUtils";
import { AppointmentStatus } from "../database/enums/AppointmentStatus";
import { UsersRepository } from "../repository/UsersRepository";
import { NotificationService } from "./NotificationService";
import { AppDataSource } from "../database/data-source";
import { Appointment } from "../database/entities/Appointment";
import { ExamType } from "../database/entities/ExamType";

const repo = new AppointmentRepository();
const usersRepo = new UsersRepository();
const notifier = new NotificationService();

export class AppointmentService {
  async create(data: { pacienteId: string; examTypeId: string; dataHora: string; observacoes?: string; dataRetirada?: string }) {
    const { pacienteId, examTypeId, dataHora, observacoes, dataRetirada } = data;
    if (!pacienteId || !examTypeId || !dataHora) throw new SystemError("Paciente, tipo de exame e data/hora são obrigatórios");
    const date = new Date(dataHora);
    if (isNaN(date.getTime())) throw new SystemError("Data/hora inválida");
    if (!SchedulerUtils.isWithinClinicHours(date)) throw new SystemError("Horário fora do funcionamento da clínica");
    let retiradaDate: Date | undefined;
    if (dataRetirada) {
      const r = new Date(dataRetirada);
      if (isNaN(r.getTime())) throw new SystemError("Data de retirada inválida");
      retiradaDate = r;
    }
    const created = await repo.create({ pacienteId, examTypeId, dataHora: date, observacoes, dataRetirada: retiradaDate });
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

  async update(
    id: string,
    data: { dataHora?: string; status?: AppointmentStatus; observacoes?: string; examTypeId?: string; dataRetirada?: string }
  ) {
    const payload: Partial<Appointment> = {};

    // Buscar agendamento atual para validações comparativas
    const current = await repo.findById(id);

    // Validar e preparar data/hora
    if (data.dataHora) {
      const date = new Date(data.dataHora);
      if (isNaN(date.getTime())) throw new SystemError("Data/hora inválida");
      if (!SchedulerUtils.isWithinClinicHours(date)) throw new SystemError("Horário fora do funcionamento da clínica");
      payload.dataHora = date;
    }

    // Permitir alteração de tipo de exame
    if (data.examTypeId) {
      payload.examTypeId = data.examTypeId;
    }

    if (data.status) payload.status = data.status;
    if (data.observacoes !== undefined) payload.observacoes = data.observacoes;
    if (data.dataRetirada !== undefined) {
      // Permite limpar o valor enviando null
      // Nota: req.body pode trazer null explicitamente
      // Aqui, se null, vamos persistir null na coluna (nullable)
      // Caso contrário, validamos e persistimos a data
      // @ts-ignore - runtime pode fornecer null
      if (data.dataRetirada === null) {
        // Persistir remoção
        // TypeORM aceita null em colunas nullable
        payload.dataRetirada = null as unknown as Date | undefined;
      } else {
        const r = new Date(data.dataRetirada);
        if (isNaN(r.getTime())) throw new SystemError("Data de retirada inválida");
        payload.dataRetirada = r;
      }
    }

    // Se houve alteração de examTypeId ou dataHora, validar conflitos
    const effectiveExamTypeId = payload.examTypeId ?? current.examTypeId;
    const effectiveDate = payload.dataHora ?? current.dataHora;

    // Validar se o tipo de exame existe e está ativo
    const examTypeRepo = AppDataSource.getRepository(ExamType);
    const examType = await examTypeRepo.findOne({ where: { id: effectiveExamTypeId, isActive: true } });
    if (!examType) throw new SystemError("Tipo de exame não encontrado");

    const windowMinutes = examType.duracaoEstimada;
    const start = effectiveDate;
    const end = SchedulerUtils.addMinutes(start, windowMinutes);
    const startMinus = SchedulerUtils.addMinutes(start, -windowMinutes);

    const appointmentRepo = AppDataSource.getRepository(Appointment);

    // Conflitos para o mesmo tipo de exame (exclui o próprio)
    const conflictsSameExam = await appointmentRepo
      .createQueryBuilder('a')
      .where('a.examTypeId = :examTypeId', { examTypeId: effectiveExamTypeId })
      .andWhere('a.status != :cancelado', { cancelado: AppointmentStatus.CANCELADO })
      .andWhere('a.id != :id', { id })
      .andWhere('a.dataHora < :end AND a.dataHora > :startMinus', { end, startMinus })
      .getMany();

    if (conflictsSameExam.length > 0) {
      throw new SystemError("Conflito de agendamento para este tipo de exame");
    }

    // Conflitos para o mesmo paciente (exclui o próprio)
    const conflictsSamePatient = await appointmentRepo
      .createQueryBuilder('a')
      .where('a.pacienteId = :pacienteId', { pacienteId: current.pacienteId })
      .andWhere('a.status != :cancelado', { cancelado: AppointmentStatus.CANCELADO })
      .andWhere('a.id != :id', { id })
      .andWhere('a.dataHora BETWEEN :start AND :end', { start, end })
      .getMany();

    if (conflictsSamePatient.length > 0) {
      throw new SystemError("Paciente possui outro agendamento no período selecionado");
    }

    return repo.update(id, payload);
  }

  async cancel(id: string) {
    return repo.cancel(id);
  }
}