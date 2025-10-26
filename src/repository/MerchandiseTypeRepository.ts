import { AppDataSource } from "../database/data-source";
import { MerchandiseType } from "../database/entities/MerchandiseType";
import { Stock } from "../database/entities/Stock";
import { SystemError } from "../middlewares/SystemError";
import { MerchandiseTypeType } from "../types/ProductTypeType";

const repository = AppDataSource.getRepository(MerchandiseType);

export class MerchandiseTypeRepository {
    async create(merchandiseType: MerchandiseTypeType) {
        try {
            const stock = await AppDataSource.getRepository(Stock).findOne({
                where: { id: merchandiseType.stockId }
            });

            if (!stock) {
                throw new SystemError("Stock não encontrado");
            }

            const savedMerchandiseType = await repository.save({
                ...merchandiseType,
                stock
            });
            return savedMerchandiseType;
        } catch (error) {
            console.error("Erro ao criar o tipo de mercadoria", error);
            throw error;
        }
    }

    async getById(id: string) {
        try {
            const merchandiseType = await repository.findOne({
                where: { id },
                relations: ['stock', 'merchandises']
            });

            if (!merchandiseType) {
                throw new SystemError("Tipo de mercadoria não encontrado");
            }

            return merchandiseType;
        } catch (error) {
            console.error("Erro ao buscar o tipo de mercadoria", error);
            throw error;
        }
    }

    async getByRecordNumber(recordNumber: string) {
        try {
            const merchandiseType = await repository.findOne({
                where: { recordNumber },
                relations: ['stock', 'merchandises']
            });

            if (!merchandiseType) {
                throw new SystemError("Tipo de mercadoria não encontrado com este número de ficha");
            }

            return merchandiseType;
        } catch (error) {
            console.error("Erro ao buscar o tipo de mercadoria por número de ficha", error);
            throw error;
        }
    }

    async listAll(stockId?: string) {
        try {
            if (stockId) {
                // Filtrar tipos de mercadoria por stockId
                return await repository.find({
                    where: { stockId },
                    relations: ['stock', 'merchandises']
                });
            } else {
                // Retornar todos os tipos de mercadoria
                return await repository.find({
                    relations: ['stock', 'merchandises']
                });
            }
        } catch (error) {
            console.error("Erro ao listar tipos de mercadoria", error);
            throw error;
        }
    }

    async update(id: string, merchandiseTypeData: Partial<MerchandiseTypeType>) {
        try {
            const merchandiseType = await this.getById(id);

            if (!merchandiseType) {
                throw new SystemError("Tipo de mercadoria não encontrado");
            }

            const updatedMerchandiseType = await repository.save({
                ...merchandiseType,
                ...merchandiseTypeData
            });

            return updatedMerchandiseType;
        } catch (error) {
            console.error("Erro ao atualizar o tipo de mercadoria", error);
            throw error;
        }
    }

    async delete(id: string) {
        try {
            const merchandiseType = await this.getById(id);

            if (!merchandiseType) {
                throw new SystemError("Tipo de mercadoria não encontrado");
            }

            await repository.remove(merchandiseType);

            return true;
        } catch (error) {
            console.error("Erro ao excluir o tipo de mercadoria", error);
            throw error;
        }
    }

    async isValidName(name: string, id?: string) {
        try {
            const query = repository.createQueryBuilder("merchandiseType")
                .where("merchandiseType.name = :name", { name });

            if (id) {
                query.andWhere("merchandiseType.id != :id", { id });
            }

            const count = await query.getCount();

            if (count > 0) {
                throw new SystemError("Já existe um tipo de mercadoria com este nome");
            }

            return true;
        } catch (error) {
            console.error("Erro ao validar nome do tipo de mercadoria", error);
            throw error;
        }
    }

    async isValidRecordNumber(recordNumber: string, id?: string) {
        try {
            const query = repository.createQueryBuilder("merchandiseType")
                .where("merchandiseType.recordNumber = :recordNumber", { recordNumber });

            if (id) {
                query.andWhere("merchandiseType.id != :id", { id });
            }

            const count = await query.getCount();

            if (count > 0) {
                throw new SystemError("Já existe um tipo de mercadoria com este número de registro");
            }

            return true;
        } catch (error) {
            console.error("Erro ao validar número de registro do tipo de mercadoria", error);
            throw error;
        }
    }

    async getMerchandisesWithBatches(merchandiseTypeId: string) {
        try {
            const merchandiseType = await repository.findOne({
                where: { id: merchandiseTypeId },
                relations: [
                    'merchandises',
                    'merchandises.batch',
                    'stock'
                ]
            });

            if (!merchandiseType) {
                throw new SystemError("Tipo de mercadoria não encontrado");
            }

            return {
                merchandiseType: {
                    id: merchandiseType.id,
                    name: merchandiseType.name,
                    recordNumber: merchandiseType.recordNumber,
                    unitOfMeasure: merchandiseType.unitOfMeasure,
                    quantityTotal: merchandiseType.quantityTotal,
                    controlled: merchandiseType.controlled,
                    minimumStock: merchandiseType.minimumStock,
                    group: merchandiseType.group,
                    stock: {
                        id: merchandiseType.stock.id,
                        name: merchandiseType.stock.name
                    }
                },
                merchandises: merchandiseType.merchandises.map(merchandise => ({
                    id: merchandise.id,
                    quantity: merchandise.quantity,
                    status: merchandise.status,
                    batch: {
                        id: merchandise.batch.id,
                        expirationDate: merchandise.batch.expirationDate
                    }
                }))
            };
        } catch (error) {
            console.error("Erro ao buscar mercadorias com lotes", error);
            throw error;
        }
    }
}
