import { Request, Response } from 'express';
import { SectionService, ConsumptionAverageDTO } from '../services/SectionService';
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
  
  async getConsumptionAverage(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.query;
      
      // Validate parameters
      if (!startDate || !endDate) {
        return res.status(400).json({ message: 'Missing required query parameters: startDate and endDate' });
      }
      
      // Parse dates
      const parsedStartDate = new Date(startDate as string);
      const parsedEndDate = new Date(endDate as string);
      
      // Validate dates
      if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
        return res.status(400).json({ message: 'Invalid date format. Use ISO format (YYYY-MM-DD)' });
      }
      
      if (parsedEndDate < parsedStartDate) {
        return res.status(400).json({ message: 'endDate must be after startDate' });
      }
      
      const consumptionData = await sectionService.getConsumptionAverage(id, parsedStartDate, parsedEndDate);
      return res.json(consumptionData);
    } catch (error) {
      console.error('Error calculating consumption average:', error);
      return res.status(500).json({ message: 'Failed to calculate consumption average' });
    }
  }
}
