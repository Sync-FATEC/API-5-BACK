import { SectionRepository } from '../repository/SectionRepository';
import { Section } from '../database/entities/Section';

export class SectionService {
  async getAll(): Promise<Section[]> {
    return await SectionRepository.find();
  }

  async getById(id: string): Promise<Section | null> {
    return await SectionRepository.findOne({ where: { id }, relations: ['orders'] });
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
