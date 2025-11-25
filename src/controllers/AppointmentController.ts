import { Request, Response, NextFunction } from "express";
import { AppointmentService } from "../services/AppointmentService";
import { SystemError } from "../middlewares/SystemError";
import { RoleEnum } from "../database/enums/RoleEnum";
import { AppointmentStatus } from "../database/enums/AppointmentStatus";
import { UsersRepository } from "../repository/UsersRepository";
import { PdfService } from "../services/PdfService";
import { AppointmentRepository } from "../repository/AppointmentRepository";

const service = new AppointmentService();
const usersRepo = new UsersRepository();
const pdfService = new PdfService();
const appointmentRepo = new AppointmentRepository();

export class AppointmentController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { pacienteId, examTypeId, dataHora, observacoes, dataRetirada } = req.body;
      const created = await service.create({ pacienteId, examTypeId, dataHora, observacoes, dataRetirada });
      res.status(201).json({ success: true, data: created, message: "Agendamento criado" });
    } catch (error) { next(error); }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { start, end, pacienteId, examTypeId, status } = req.query;

      // Se PACIENTE, força filtro por próprio id
      const role = req.user?.userData?.role as RoleEnum | undefined;
      const requesterId = req.user?.userData?.id as string | undefined;
      let effectivePacienteId = pacienteId as string | undefined;
      if (role === RoleEnum.PACIENTE) {
        if (!requesterId) throw new SystemError("Usuário não autenticado");
        effectivePacienteId = requesterId;
      }
      const list = await service.list({
        start: start as string | undefined,
        end: end as string | undefined,
        pacienteId: effectivePacienteId,
        examTypeId: examTypeId as string | undefined,
        status: status as AppointmentStatus | undefined,
      });
      res.status(200).json({ success: true, data: list });
    } catch (error) { next(error); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new SystemError("ID é obrigatório");
      const { dataHora, status, observacoes, examTypeId, dataRetirada } = req.body;
      const updated = await service.update(id, { dataHora, status, observacoes, examTypeId, dataRetirada });
      res.status(200).json({ success: true, data: updated, message: "Agendamento atualizado" });
    } catch (error) { next(error); }
  }

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new SystemError("ID é obrigatório");
      const canceled = await service.cancel(id);
      res.status(200).json({ success: true, data: canceled, message: "Agendamento cancelado" });
    } catch (error) { next(error); }
  }

  async receipt(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new SystemError("ID é obrigatório");
      const appointment = await appointmentRepo.findById(id);
      const role = req.user?.userData?.role as RoleEnum | undefined;
      const requesterId = req.user?.userData?.id as string | undefined;
      // PACIENTE só pode baixar o próprio recibo
      if (role === RoleEnum.PACIENTE && appointment.pacienteId !== requesterId) {
        return res.status(403).json({ error: 'Permissões insuficientes.' });
      }
      const pdf = await pdfService.generateAppointmentReceipt(appointment);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="comprovante-${appointment.id}.pdf"`);
      res.status(200).send(pdf);
    } catch (error) { next(error); }
  }

  async report(req: Request, res: Response, next: NextFunction) {
    try {
      const { start, end } = req.query;
      const list = await service.list({ start: start as string | undefined, end: end as string | undefined });
      // resumo por status e por tipo de exame
      const byStatus: Record<string, number> = {};
      const byExamType: Record<string, number> = {};
      for (const a of list) {
        byStatus[a.status] = (byStatus[a.status] || 0) + 1;
        const examName = a.examType?.nome || a.examTypeId;
        byExamType[examName] = (byExamType[examName] || 0) + 1;
      }
      res.status(200).json({ success: true, data: { total: list.length, byStatus, byExamType, items: list } });
    } catch (error) { next(error); }
  }

  async searchPatients(req: Request, res: Response, next: NextFunction) {
    try {
      const { q } = req.query;
      const patients = await usersRepo.searchPatients((q as string) || undefined);
      res.status(200).json({ success: true, data: patients });
    } catch (error) { next(error); }
  }
}