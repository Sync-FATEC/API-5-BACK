import { AppDataSource } from '../database/data-source';
import { Section } from '../database/entities/Section';

export const SectionRepository = AppDataSource.getRepository(Section);
