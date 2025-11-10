import { SystemError } from "../middlewares/SystemError";
import { ExamTypeRepository } from "../repository/ExamTypeRepository";

const repo = new ExamTypeRepository();

export class ExamTypeService {
  async create(data: { nome: string; descricao?: string; duracaoEstimada: number; preparoNecessario?: string }) {
    if (!data.nome || !data.duracaoEstimada) throw new SystemError("Nome e duração estimada são obrigatórios");
    if (data.duracaoEstimada <= 0) throw new SystemError("Duração estimada deve ser maior que zero");
    return repo.create({
      nome: data.nome.trim(),
      descricao: data.descricao?.trim(),
      duracaoEstimada: data.duracaoEstimada,
      preparoNecessario: data.preparoNecessario?.trim(),
      isActive: true,
    });
  }

  async listAll() {
    return repo.listAll();
  }

  async update(id: string, data: { nome?: string; descricao?: string; duracaoEstimada?: number; preparoNecessario?: string }) {
    if (data.duracaoEstimada !== undefined && data.duracaoEstimada <= 0) throw new SystemError("Duração estimada deve ser maior que zero");
    return repo.update(id, data);
  }

  async softDelete(id: string) {
    return repo.softDelete(id);
  }
}