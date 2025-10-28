import { AppDataSource } from "../database/data-source";
import { LogMerchandiseType } from "../database/entities/LogMerchandiseType";
import { MerchandiseType } from "../database/entities/MerchandiseType";

const repository = AppDataSource.getRepository(LogMerchandiseType);

export class LogMerchandiseTypeRepository {


    async getByMerchandiseTypeId(merchandiseTypeId: string) {
        try {
            const logs = await repository.find({
                where: { merchandiseType: { id: merchandiseTypeId } },
                relations: ['user', 'merchandiseType']
            });
            return logs;
        } catch (error) {
            console.error("Erro ao buscar logs do tipo de mercadoria", error);
            throw error;
        }
    }   

    async create(log: LogMerchandiseType[]) {
        try {
            const savedLog = await repository.save(log);
            return savedLog;
        } catch (error) {
            console.error("Erro ao criar o log do tipo de mercadoria", error);
            throw error;
        }
    }
}

export const logMerchandiseTypeRepository = new LogMerchandiseTypeRepository();