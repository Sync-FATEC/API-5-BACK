import { Request, Response } from 'express';
import { SectionService } from '../services/SectionService';
import { SectionDTO } from '../types/OrderSectionDTO';

const sectionService = new SectionService();

export class SectionController {
  async getAll(req: Request, res: Response) {
    const sections = await sectionService.getAll();
    return res.json(sections);
  }

  async getById(req: Request, res: Response) {
    const { id } = req.params;
    const section = await sectionService.getById(id);
    if (!section) return res.status(404).json({ message: 'Section not found' });
    return res.json(section);
  }

  async create(req: Request, res: Response) {
    const data: SectionDTO = req.body;
    if (!data.name) {
      return res.status(400).json({ message: 'Missing required field: name' });
    }
    const section = await sectionService.create(data);
    return res.status(201).json(section);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const data: SectionDTO = req.body;
    if (!data.name) {
      return res.status(400).json({ message: 'Missing required field: name' });
    }
    const section = await sectionService.update(id, data);
    if (!section) return res.status(404).json({ message: 'Section not found' });
    return res.json(section);
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    const success = await sectionService.delete(id);
    if (!success) return res.status(404).json({ message: 'Section not found' });
    return res.status(204).send();
  }
}
