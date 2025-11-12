import { Request, Response, NextFunction } from "express";
import { ExamTypeService } from "../services/ExamTypeService";
import { SystemError } from "../middlewares/SystemError";

const service = new ExamTypeService();

export class ExamTypeController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { nome, descricao, duracaoEstimada, preparoNecessario } = req.body;
      const created = await service.create({ nome, descricao, duracaoEstimada, preparoNecessario });
      res.status(201).json({ success: true, data: created, message: "Tipo de exame criado" });
    } catch (error) { next(error); }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const list = await service.listAll();
      res.status(200).json({ success: true, data: list });
    } catch (error) { next(error); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new SystemError("ID é obrigatório");
      const { nome, descricao, duracaoEstimada, preparoNecessario } = req.body;
      const updated = await service.update(id, { nome, descricao, duracaoEstimada, preparoNecessario });
      res.status(200).json({ success: true, data: updated, message: "Tipo de exame atualizado" });
    } catch (error) { next(error); }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new SystemError("ID é obrigatório");
      await service.softDelete(id);
      res.status(200).json({ success: true, message: "Tipo de exame excluído" });
    } catch (error) { next(error); }
  }
}