import { AppDataSource } from "../database/data-source";
import { EmailLog } from "../database/entities/EmailLog";

const repo = AppDataSource.getRepository(EmailLog);

export class EmailLogRepository {
  async create(data: Partial<EmailLog>): Promise<EmailLog> {
    const entity = repo.create(data);
    return repo.save(entity);
  }

  async listByCommitmentNote(commitmentNoteId: string): Promise<EmailLog[]> {
    return repo.find({ where: { commitmentNoteId } });
  }

  async listBySupplier(supplierId: string): Promise<EmailLog[]> {
    return repo.find({ where: { supplierId } });
  }
}