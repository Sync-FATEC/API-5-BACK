import { AppDataSource } from "../database/data-source";
import { EmailTemplate } from "../database/entities/EmailTemplate";
import { EmailType } from "../database/enums/EmailType";

const repo = AppDataSource.getRepository(EmailTemplate);

export class EmailTemplateRepository {
  async listAll(): Promise<EmailTemplate[]> {
    return repo.find();
  }

  async getById(id: string): Promise<EmailTemplate> {
    const found = await repo.findOne({ where: { id } });
    if (!found) throw new Error('Template não encontrado');
    return found;
  }
  async getByType(type: EmailType): Promise<EmailTemplate | null> {
    return repo.findOne({ where: { type } });
  }

  async upsertTemplate(type: EmailType, subject: string, html: string, footer?: string): Promise<EmailTemplate> {
    const current = await this.getByType(type);
    if (current) {
      current.subject = subject;
      current.html = html;
      current.footer = footer;
      return repo.save(current);
    }
    const entity = repo.create({ type, subject, html, footer });
    return repo.save(entity);
  }

  async create(data: { type: EmailType; subject: string; html: string; footer?: string }): Promise<EmailTemplate> {
    const entity = repo.create(data);
    return repo.save(entity);
  }

  async update(id: string, data: { subject?: string; html?: string; footer?: string }): Promise<EmailTemplate> {
    const found = await repo.findOne({ where: { id } });
    if (!found) throw new Error('Template não encontrado');
    if (data.subject !== undefined) found.subject = data.subject;
    if (data.html !== undefined) found.html = data.html;
    if (data.footer !== undefined) found.footer = data.footer;
    return repo.save(found);
  }

  async autosave(id: string, data: { subject?: string; html?: string; footer?: string }): Promise<EmailTemplate> {
    return this.update(id, data);
  }

  async getVersions(_id: string): Promise<any[]> {
    return [];
  }

  async restoreVersion(id: string, _versionId: string): Promise<EmailTemplate> {
    const found = await repo.findOne({ where: { id } });
    if (!found) throw new Error('Template não encontrado');
    return found;
  }
}