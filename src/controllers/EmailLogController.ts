import { Request, Response, NextFunction } from 'express';
import { EmailLogRepository } from '../repository/EmailLogRepository';
import { SystemError } from '../middlewares/SystemError';

const repo = new EmailLogRepository();

export class EmailLogController {
  async listByCommitmentNote(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new SystemError('ID da NE é obrigatório');
      const logs = await repo.listByCommitmentNote(id);
      res.status(200).json({ success: true, data: logs });
    } catch (error) {
      next(error);
    }
  }

  async listBySupplier(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new SystemError('ID do fornecedor é obrigatório');
      const logs = await repo.listBySupplier(id);
      res.status(200).json({ success: true, data: logs });
    } catch (error) {
      next(error);
    }
  }
}