import { AppDataSource } from "../database/data-source";
import { Appointment } from "../database/entities/Appointment";
import { SystemError } from "../middlewares/SystemError";
import { ExamType } from "../database/entities/ExamType";
import { SchedulerUtils } from "../utils/SchedulerUtils";
import { AppointmentStatus } from "../database/enums/AppointmentStatus";

const repository = AppDataSource.getRepository(Appointment);
const examTypeRepo = AppDataSource.getRepository(ExamType);

export class AppointmentRepository {
  async create(data: { pacienteId: string; examTypeId: string; dataHora: Date; observacoes?: string; dataRetirada?: Date }) {
    const examType = await examTypeRepo.findOne({ where: { id: data.examTypeId, isActive: true } });
    if (!examType) throw new SystemError("Tipo de exame não encontrado");

    const start = data.dataHora;
    const end = SchedulerUtils.addMinutes(start, examType.duracaoEstimada);

    // Verificar conflitos para o mesmo tipo de exame
    const conflictsSameExam = await repository
      .createQueryBuilder('a')
      .where('a.examTypeId = :examTypeId', { examTypeId: data.examTypeId })
      .andWhere('a.status != :cancelado', { cancelado: AppointmentStatus.CANCELADO })
      .andWhere('a.dataHora < :end AND a.dataHora > :startMinus', { end, startMinus: SchedulerUtils.addMinutes(start, -examType.duracaoEstimada) })
      .getMany();

    if (conflictsSameExam.length > 0) {
      throw new SystemError("Conflito de agendamento para este tipo de exame");
    }

    // Verificar conflitos para o mesmo paciente
    const conflictsSamePatient = await repository
      .createQueryBuilder('a')
      .where('a.pacienteId = :pacienteId', { pacienteId: data.pacienteId })
      .andWhere('a.status != :cancelado', { cancelado: AppointmentStatus.CANCELADO })
      .andWhere('a.dataHora BETWEEN :start AND :end', { start, end })
      .getMany();

    if (conflictsSamePatient.length > 0) {
      throw new SystemError("Paciente possui outro agendamento no período selecionado");
    }

    const created = repository.create({ ...data });
    return repository.save(created);
  }

  async list(filters: { start?: Date; end?: Date; pacienteId?: string; examTypeId?: string; status?: AppointmentStatus }) {
    const qb = repository.createQueryBuilder('a');
    if (filters.pacienteId) qb.andWhere('a.pacienteId = :pacienteId', { pacienteId: filters.pacienteId });
    if (filters.examTypeId) qb.andWhere('a.examTypeId = :examTypeId', { examTypeId: filters.examTypeId });
    if (filters.status) qb.andWhere('a.status = :status', { status: filters.status });
    if (filters.start) qb.andWhere('a.dataHora >= :start', { start: filters.start });
    if (filters.end) qb.andWhere('a.dataHora <= :end', { end: filters.end });
    qb.orderBy('a.dataHora', 'ASC');
    return qb.getMany();
  }

  async findById(id: string) {
    const found = await repository.findOne({ where: { id } });
    if (!found) throw new SystemError("Agendamento não encontrado");
    return found;
  }

  async update(id: string, data: Partial<Appointment>) {
    const entity = await this.findById(id);
    Object.assign(entity, data);
    return repository.save(entity);
  }

  async cancel(id: string) {
    const entity = await this.findById(id);
    entity.status = AppointmentStatus.CANCELADO;
    return repository.save(entity);
  }
}