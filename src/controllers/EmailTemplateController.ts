import { Request, Response, NextFunction } from "express";
import { SystemError } from "../middlewares/SystemError";
import { EmailTemplateService } from "../services/EmailTemplateService";

const service = new EmailTemplateService();

export class EmailTemplateController {
  async list(req: Request, res: Response, next: NextFunction) { try { const data = await service.list(); res.status(200).json({ success: true, data }); } catch (e) { next(e); } }
  async get(req: Request, res: Response, next: NextFunction) { try { const { id } = req.params; if (!id) throw new SystemError('ID é obrigatório'); const data = await service.get(id); res.status(200).json({ success: true, data }); } catch (e) { next(e); } }
  async create(req: Request, res: Response, next: NextFunction) { try { const { name, subject, html } = req.body; const created = await service.create({ name, subject, html }); res.status(201).json({ success: true, data: created }); } catch (e) { next(e); } }
  async update(req: Request, res: Response, next: NextFunction) { try { const { id } = req.params; const { subject, html } = req.body; const updated = await service.update(id, { subject, html }); res.status(200).json({ success: true, data: updated }); } catch (e) { next(e); } }
  async autosave(req: Request, res: Response, next: NextFunction) { try { const { id } = req.params; const { subject, html } = req.body; const saved = await service.autosave(id, { subject, html }); res.status(200).json({ success: true, data: saved }); } catch (e) { next(e); } }
  async versions(req: Request, res: Response, next: NextFunction) { try { const { id } = req.params; const list = await service.versions(id); res.status(200).json({ success: true, data: list }); } catch (e) { next(e); } }
  async restore(req: Request, res: Response, next: NextFunction) { try { const { id, versionId } = req.params as any; const updated = await service.restore(id, versionId); res.status(200).json({ success: true, data: updated }); } catch (e) { next(e); } }
  async preview(req: Request, res: Response, next: NextFunction) { try { const { id } = req.params; const data = await service.preview(id, req.body?.vars); res.status(200).json({ success: true, data }); } catch (e) { next(e); } }
  async allowed(req: Request, res: Response, next: NextFunction) { try { const data = service.allowedVars(); res.status(200).json({ success: true, data }); } catch (e) { next(e); } }
}