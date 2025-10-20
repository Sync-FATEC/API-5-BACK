import { SectionRepository } from '../repository/SectionRepository';
import { Section } from '../database/entities/Section';
import { OrderRepository } from '../repository/OrderRepository';
import { Between } from 'typeorm';
import { AppDataSource } from '../database/data-source';
import { MerchandiseType } from '../database/entities/MerchandiseType';

export interface ConsumptionAverageDTO {
  merchandiseTypeId: string;
  merchandiseTypeName: string;
  totalQuantity: number;
  averagePerDay: number;
}

export class SectionService {
  async getAll(): Promise<Section[]> {
    return await SectionRepository.find({ where: { isActive: true } });
  }

  async getById(id: string): Promise<Section | null> {
    return await SectionRepository.findOne({ where: { id }, relations: ['orders'] });
  }
  
  async getConsumptionAverage(sectionId: string, startDate: Date, endDate: Date): Promise<ConsumptionAverageDTO[]> {
    // Calculate total days in the period
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Get all orders for the section in the given period
    const orders = await OrderRepository.find({
      where: {
        section: { id: sectionId },
        isActive: true,
        creationDate: Between(startDate, endDate)
      },
      relations: ['orderItems', 'orderItems.merchandiseType']
    });
    
    // Group and sum quantities by merchandise type
    const consumptionMap = new Map<string, { id: string, name: string, total: number }>();
    
    for (const order of orders) {
      for (const item of order.orderItems) {
        if (!item.merchandiseType) continue;
        
        const typeId = item.merchandiseType.id;
        const current = consumptionMap.get(typeId) || { 
          id: typeId, 
          name: item.merchandiseType.name, 
          total: 0 
        };
        
        current.total += item.quantity;
        consumptionMap.set(typeId, current);
      }
    }
    
    // Convert to array and calculate averages
    return Array.from(consumptionMap.values()).map(entry => ({
      merchandiseTypeId: entry.id,
      merchandiseTypeName: entry.name,
      totalQuantity: entry.total,
      averagePerDay: daysDiff > 0 ? parseFloat((entry.total / daysDiff).toFixed(2)) : entry.total
    }));
  }

  async create(sectionData: Partial<Section>): Promise<Section> {
    const section = SectionRepository.create(sectionData);
    return await SectionRepository.save(section);
  }

  async update(id: string, sectionData: Partial<Section>): Promise<Section | null> {
    const section = await SectionRepository.findOne({ where: { id } });
    if (!section) return null;
    Object.assign(section, sectionData);
    return await SectionRepository.save(section);
  }

  async delete(id: string): Promise<boolean> {
    const result = await SectionRepository.update(id, { isActive: false });
    return result.affected !== 0;
  }
}
