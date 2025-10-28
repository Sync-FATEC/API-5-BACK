import { Repository } from "typeorm";
import { AppDataSource } from "../database/data-source";
import { EntryHistory } from "../database/entities/EntryHistory";
import { SystemError } from "../middlewares/SystemError";

export class EntryHistoryRepository {
    private repository: Repository<EntryHistory>;

    constructor() {
        this.repository = AppDataSource.getRepository(EntryHistory);
    }

    async create(entryData: Partial<EntryHistory>): Promise<EntryHistory> {
        try {
            const entry = this.repository.create(entryData);
            return await this.repository.save(entry);
        } catch (error) {
            console.error("Erro ao criar registro de entrada:", error);
            throw new SystemError("Erro ao registrar entrada no histórico");
        }
    }

    async getByMerchandiseTypeId(merchandiseTypeId: string): Promise<EntryHistory[]> {
        try {
            return await this.repository.find({
                where: { merchandiseTypeId },
                order: { entryDate: "DESC" }
            });
        } catch (error) {
            console.error("Erro ao buscar histórico de entradas:", error);
            throw new SystemError("Erro ao buscar histórico de entradas");
        }
    }
}