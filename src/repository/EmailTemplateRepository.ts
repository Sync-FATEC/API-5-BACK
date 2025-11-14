import { AppDataSource } from "../database/data-source";
import { EmailTemplate } from "../database/entities/EmailTemplate";
import { EmailType } from "../database/enums/EmailType";

const repo = AppDataSource.getRepository(EmailTemplate);

export class EmailTemplateRepository {
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
}