import { AppDataSource } from "../database/data-source";
import { ExamPreparationInstruction } from "../database/entities/ExamPreparationInstruction";
import { ExamType } from "../database/entities/ExamType";
import { SystemError } from "../middlewares/SystemError";

const repository = AppDataSource.getRepository(ExamPreparationInstruction);
const examTypeRepository = AppDataSource.getRepository(ExamType);

export class ExamPreparationInstructionRepository {
  async create(data: Partial<ExamPreparationInstruction>) {
    try {
      const examType = await examTypeRepository.findOne({ where: { id: data.examTypeId, isActive: true } });
      if (!examType) throw new SystemError("Tipo de exame não encontrado ou inativo");

      const entity = repository.create({
        examTypeId: data.examTypeId!,
        titulo: data.titulo!,
        conteudo: data.conteudo!,
        ordem: data.ordem ?? 0,
        isActive: true,
      });
      return repository.save(entity);
    } catch (error) {
      throw error;
    }
  }

  async listByExamType(examTypeId: string) {
    return repository.find({ where: { examTypeId, isActive: true }, order: { ordem: 'ASC', titulo: 'ASC' } });
  }

  async findById(id: string) {
    const found = await repository.findOne({ where: { id, isActive: true } });
    if (!found) throw new SystemError("Instrução de preparo não encontrada");
    return found;
  }

  async update(id: string, data: Partial<ExamPreparationInstruction>) {
    const entity = await this.findById(id);
    if (data.examTypeId && data.examTypeId !== entity.examTypeId) {
      const examType = await examTypeRepository.findOne({ where: { id: data.examTypeId, isActive: true } });
      if (!examType) throw new SystemError("Tipo de exame não encontrado ou inativo");
    }
    Object.assign(entity, {
      titulo: data.titulo ?? entity.titulo,
      conteudo: data.conteudo ?? entity.conteudo,
      ordem: data.ordem ?? entity.ordem,
      examTypeId: data.examTypeId ?? entity.examTypeId,
    });
    return repository.save(entity);
  }

  async softDelete(id: string) {
    const entity = await this.findById(id);
    entity.isActive = false;
    return repository.save(entity);
  }
}