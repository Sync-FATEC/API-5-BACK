import { Request, Response, NextFunction } from "express";
import { SystemError } from "../middlewares/SystemError";
import { ExamPreparationInstructionService } from "../services/ExamPreparationInstructionService";

const service = new ExamPreparationInstructionService();

export class ExamPreparationInstructionController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { examTypeId, titulo, conteudo, ordem } = req.body;
      const created = await service.create({ examTypeId, titulo, conteudo, ordem });
      res.status(201).json({ success: true, data: created, message: "Instrução de preparo criada" });
    } catch (error) { next(error); }
  }

  async listByExamType(req: Request, res: Response, next: NextFunction) {
    try {
      const { examTypeId } = req.params;
      if (!examTypeId) throw new SystemError("Tipo de exame é obrigatório");
      const list = await service.listByExamType(examTypeId);
      res.status(200).json({ success: true, data: list });
    } catch (error) { next(error); }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new SystemError("ID é obrigatório");
      const found = await service.getById(id);
      res.status(200).json({ success: true, data: found });
    } catch (error) { next(error); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { examTypeId, titulo, conteudo, ordem } = req.body;
      const updated = await service.update(id, { examTypeId, titulo, conteudo, ordem });
      res.status(200).json({ success: true, data: updated, message: "Instrução de preparo atualizada" });
    } catch (error) { next(error); }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new SystemError("ID é obrigatório");
      await service.softDelete(id);
      res.status(200).json({ success: true, message: "Instrução de preparo excluída" });
    } catch (error) { next(error); }
  }
}