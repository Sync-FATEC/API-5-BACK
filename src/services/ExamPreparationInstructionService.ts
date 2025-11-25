import { SystemError } from "../middlewares/SystemError";
import { ExamPreparationInstructionRepository } from "../repository/ExamPreparationInstructionRepository";

const repo = new ExamPreparationInstructionRepository();

export class ExamPreparationInstructionService {
  async create(data: { examTypeId: string; titulo: string; conteudo: string; ordem?: number }) {
    if (!data.examTypeId) throw new SystemError("Tipo de exame é obrigatório");
    if (!data.titulo || data.titulo.trim().length < 3) throw new SystemError("Título deve ter ao menos 3 caracteres");
    if (!data.conteudo || data.conteudo.trim().length < 5) throw new SystemError("Conteúdo deve ter ao menos 5 caracteres");
    if (data.ordem !== undefined && data.ordem < 0) throw new SystemError("Ordem deve ser zero ou positivo");
    return repo.create({
      examTypeId: data.examTypeId,
      titulo: data.titulo.trim(),
      conteudo: data.conteudo.trim(),
      ordem: data.ordem ?? 0,
    });
  }

  async listByExamType(examTypeId: string) {
    if (!examTypeId) throw new SystemError("Tipo de exame é obrigatório");
    return repo.listByExamType(examTypeId);
  }

  async getById(id: string) {
    if (!id) throw new SystemError("ID é obrigatório");
    return repo.findById(id);
  }

  async update(id: string, data: { examTypeId?: string; titulo?: string; conteudo?: string; ordem?: number }) {
    if (!id) throw new SystemError("ID é obrigatório");
    if (data.titulo !== undefined && data.titulo.trim().length < 3) throw new SystemError("Título deve ter ao menos 3 caracteres");
    if (data.conteudo !== undefined && data.conteudo.trim().length < 5) throw new SystemError("Conteúdo deve ter ao menos 5 caracteres");
    if (data.ordem !== undefined && data.ordem < 0) throw new SystemError("Ordem deve ser zero ou positivo");
    return repo.update(id, {
      examTypeId: data.examTypeId,
      titulo: data.titulo?.trim(),
      conteudo: data.conteudo?.trim(),
      ordem: data.ordem,
    });
  }

  async softDelete(id: string) {
    if (!id) throw new SystemError("ID é obrigatório");
    return repo.softDelete(id);
  }
}