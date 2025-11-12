import { AppDataSource } from "../database/data-source";
import { CommitmentNote } from "../database/entities/CommitmentNote";
import { SystemError } from "../middlewares/SystemError";

const repository = AppDataSource.getRepository(CommitmentNote);

export class CommitmentNoteRepository {
  async create(data: Partial<CommitmentNote>): Promise<CommitmentNote> {
    try {
      const entity = repository.create(data);
      return await repository.save(entity);
    } catch (error) {
      console.error("Erro ao criar Nota de Empenho", error);
      throw error;
    }
  }

  async listAll(): Promise<CommitmentNote[]> {
    try {
      return await repository.find();
    } catch (error) {
      console.error("Erro ao listar Notas de Empenho", error);
      throw error;
    }
  }

  async getById(id: string): Promise<CommitmentNote> {
    try {
      const entity = await repository.findOne({ where: { id } });
      if (!entity) {
        throw new SystemError("Nota de Empenho não encontrada");
      }
      return entity;
    } catch (error) {
      console.error("Erro ao buscar Nota de Empenho", error);
      throw error;
    }
  }

  async update(id: string, data: Partial<CommitmentNote>): Promise<CommitmentNote> {
    try {
      const current = await this.getById(id);
      const merged = repository.merge(current, data);
      return await repository.save(merged);
    } catch (error) {
      console.error("Erro ao atualizar Nota de Empenho", error);
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const current = await this.getById(id);
      await repository.remove(current);
      return true;
    } catch (error) {
      console.error("Erro ao excluir Nota de Empenho", error);
      throw error;
    }
  }
}