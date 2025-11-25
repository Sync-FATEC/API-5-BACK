import { SystemError } from "../middlewares/SystemError";
import { EmailTemplateRepository } from "../repository/EmailTemplateRepository";
import { TemplateParserService } from "./TemplateParserService";
import { AllowedTemplateVariables, TemplateVarsInput } from "./TemplateVariables";
import { EmailType } from "../database/enums/EmailType";

const repo = new EmailTemplateRepository();
const parser = new TemplateParserService();

export class EmailTemplateService {
  async list() { return repo.listAll(); }
  async get(id: string) { return repo.getById(id); }

  async upsert(type: EmailType, subject: string, html: string, footer?: string) {
    if (!type || !subject || !html) throw new SystemError('Tipo, assunto e HTML são obrigatórios');
    const validation = parser.validateTokens(html);
    if (validation.unknown.length) throw new SystemError(`Variáveis desconhecidas: ${validation.unknown.join(', ')}`);
    return repo.upsertTemplate(type, subject, html, footer);
  }

  async create(data: { name: string; subject: string; html: string }) {
    const type = (data.name as EmailType);
    return this.upsert(type, data.subject, data.html);
  }

  async update(id: string, data: { subject?: string; html?: string; footer?: string }) {
    if (data.html !== undefined) {
      const validation = parser.validateTokens(data.html);
      if (validation.unknown.length) throw new SystemError(`Variáveis desconhecidas: ${validation.unknown.join(', ')}`);
    }
    return repo.update(id, data);
  }

  async autosave(id: string, data: { subject?: string; html?: string; footer?: string }) {
    if (data.html !== undefined) {
      const validation = parser.validateTokens(data.html);
      if (validation.unknown.length) throw new SystemError(`Variáveis desconhecidas: ${validation.unknown.join(', ')}`);
    }
    return repo.autosave(id, data);
  }

  async versions(_id: string) { return repo.getVersions(_id); }
  async restore(id: string, versionId: string) { return repo.restoreVersion(id, versionId); }

  async preview(id: string, vars?: TemplateVarsInput) {
    const t = await repo.getById(id);
    const rendered = parser.render(t.html, vars || {} as any);
    if (!rendered.ok) throw new SystemError(rendered.error || 'Erro ao renderizar');
    return { subject: t.subject, html: rendered.html, missing: rendered.missing };
  }

  async renderByName(name: string, vars: TemplateVarsInput) {
    const type = (name as EmailType);
    const t = await repo.getByType(type);
    if (!t) throw new SystemError('Template não encontrado');
    const rendered = parser.render(t.html, vars);
    if (!rendered.ok) throw new SystemError(rendered.error || 'Erro ao renderizar');
    return { subject: t.subject, html: rendered.html };
  }

  allowedVars() { return AllowedTemplateVariables; }
}