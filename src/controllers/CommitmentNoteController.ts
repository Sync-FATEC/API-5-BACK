import { Request, Response, NextFunction } from "express";
import { SystemError } from "../middlewares/SystemError";
import { CommitmentNoteService } from "../services/CommitmentNoteService";
import { RoleEnum } from "../database/enums/RoleEnum";

const service = new CommitmentNoteService();

export class CommitmentNoteController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const role: RoleEnum | undefined = req.user?.userData?.role as RoleEnum | undefined;
      if (!role) throw new SystemError("Permissão negada");
      const created = await service.create(req.body, role);
      res.status(201).json({ success: true, data: created, message: "Nota de Empenho criada com sucesso" });
    } catch (error) {
      next(error);
    }
  }

  async listAll(req: Request, res: Response, next: NextFunction) {
    try {
      const list = await service.listAll();
      res.status(200).json({ success: true, data: list, message: "Notas de Empenho listadas com sucesso" });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new SystemError("ID da Nota de Empenho é obrigatório");
      const entity = await service.getById(id);
      res.status(200).json({ success: true, data: entity, message: "Nota de Empenho encontrada com sucesso" });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const role: RoleEnum | undefined = req.user?.userData?.role as RoleEnum | undefined;
      if (!id) throw new SystemError("ID da Nota de Empenho é obrigatório");
      if (!role) throw new SystemError("Permissão negada");
      const updated = await service.update(id, req.body, role);
      res.status(200).json({ success: true, data: updated, message: "Nota de Empenho atualizada com sucesso" });
    } catch (error) {
      next(error);
    }
  }

  async updateAdminFields(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const role: RoleEnum | undefined = req.user?.userData?.role as RoleEnum | undefined;
      if (!id) throw new SystemError("ID da Nota de Empenho é obrigatório");
      if (!role) throw new SystemError("Permissão negada");
      const updated = await service.updateAdminFields(id, req.body, role);
      res.status(200).json({ success: true, data: updated, message: "Campos administrativos atualizados com sucesso" });
    } catch (error) {
      next(error);
    }
  }

  async finalize(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const role: RoleEnum | undefined = req.user?.userData?.role as RoleEnum | undefined;
      if (!id) throw new SystemError("ID da Nota de Empenho é obrigatório");
      if (!role) throw new SystemError("Permissão negada");
      const updated = await service.finalize(id, role);
      res.status(200).json({ success: true, data: updated, message: "Nota de Empenho finalizada com sucesso" });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const role: RoleEnum | undefined = req.user?.userData?.role as RoleEnum | undefined;
      if (!id) throw new SystemError("ID da Nota de Empenho é obrigatório");
      if (!role) throw new SystemError("Permissão negada");
      const result = await service.delete(id, role);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}