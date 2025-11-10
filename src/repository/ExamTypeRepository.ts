import { AppDataSource } from "../database/data-source";
import { ExamType } from "../database/entities/ExamType";
import { SystemError } from "../middlewares/SystemError";

const repository = AppDataSource.getRepository(ExamType);

export class ExamTypeRepository {
  async create(data: Partial<ExamType>) {
    try {
      const exists = await repository.findOne({ where: { nome: data.nome, isActive: true } });
      if (exists) throw new SystemError("Tipo de exame já cadastrado");
      const saved = await repository.save(repository.create(data));
      return saved;
    } catch (error) {
      throw error;
    }
  }

  async listAll() {
    return repository.find({ where: { isActive: true }, order: { nome: 'ASC' } });
  }

  async findById(id: string) {
    const found = await repository.findOne({ where: { id, isActive: true } });
    if (!found) throw new SystemError("Tipo de exame não encontrado");
    return found;
  }

  async update(id: string, data: Partial<ExamType>) {
    const entity = await this.findById(id);
    if (data.nome && data.nome !== entity.nome) {
      const conflict = await repository.findOne({ where: { nome: data.nome, isActive: true } });
      if (conflict) throw new SystemError("Nome de tipo de exame já utilizado");
    }
    Object.assign(entity, data);
    return repository.save(entity);
  }

  async softDelete(id: string) {
    const entity = await this.findById(id);
    entity.isActive = false;
    return repository.save(entity);
  }
}