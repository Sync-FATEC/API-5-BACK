import { AppDataSource } from "../database/data-source";
import { Batch } from "../database/entities/Batch";
import { Merchandise } from "../database/entities/Merchandise";
import { MerchandiseType } from "../database/entities/MerchandiseType";
import { SystemError } from "../middlewares/SystemError";
import { MerchandiseTypeEnum } from "../types/ProductType";

const repository = AppDataSource.getRepository(Merchandise);
const batchRepository = AppDataSource.getRepository(Batch);
const merchandiseTypeRepository = AppDataSource.getRepository(MerchandiseType);

export class MerchandiseRepository {
    async create(merchandise: MerchandiseTypeEnum, validDate: Date) {
        try {
            const batch = batchRepository.create({
                expirationDate: validDate
            });
            const savedBatch = await batchRepository.save(batch);

            const merchandiseWithBatch = {
                ...merchandise,
                batch: savedBatch,
                batchId: savedBatch.id
            };
            const savedMerchandise = await repository.save(merchandiseWithBatch);

            const currentMerchandiseType = await merchandiseTypeRepository.findOne({
                where: { id: merchandise.typeId }
            });

            if (currentMerchandiseType) {
                await merchandiseTypeRepository.update(merchandise.typeId, {
                    quantityTotal: currentMerchandiseType.quantityTotal + merchandise.quantity
                });
            }

            return savedMerchandise;
        } catch (error) {
            console.error("Erro ao criar a mercadoria", error);
            throw error;
        }
    }

    async getById(id: string) {
        try {
            const merchandise = await repository.findOne({
                where: { id },
                relations: ['type', 'batch', 'stock']
            });

            if (!merchandise) {
                throw new SystemError("Mercadoria não encontrada");
            }

            return merchandise;
        } catch (error) {
            console.error("Erro ao buscar a mercadoria", error);
            throw error;
        }
    }

    async listAll() {
        try {
            return await repository.find({
                relations: ['type', 'batch', 'stock']
            });
        } catch (error) {
            console.error("Erro ao listar mercadorias", error);
            throw error;
        }
    }

    async update(id: string, merchandiseData: Partial<MerchandiseTypeEnum>) {
        try {
            const merchandise = await this.getById(id);

            if (!merchandise) {
                throw new SystemError("Mercadoria não encontrada");
            }

            const updatedMerchandise = await repository.save({
                ...merchandise,
                ...merchandiseData
            });

            return updatedMerchandise;
        } catch (error) {
            console.error("Erro ao atualizar a mercadoria", error);
            throw error;
        }
    }

    async delete(id: string) {
        try {
            const merchandise = await this.getById(id);

            if (!merchandise) {
                throw new SystemError("Mercadoria não encontrada");
            }

            await repository.remove(merchandise);

            return true;
        } catch (error) {
            console.error("Erro ao excluir a mercadoria", error);
            throw error;
        }
    }
}
