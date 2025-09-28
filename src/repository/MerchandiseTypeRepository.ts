import { AppDataSource } from "../database/data-source";
import { MerchandiseType } from "../database/entities/MerchandiseType";
import { SystemError } from "../middlewares/SystemError";
import { MerchandiseTypeType } from "../types/ProductTypeType";

const repository = AppDataSource.getRepository(MerchandiseType);

export class MerchandiseTypeRepository {
    async create(merchandiseType: MerchandiseTypeType) {
        try {
            const savedMerchandiseType = await repository.save(merchandiseType);
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
                relations: ['merchandises']
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

    async listAll(stockId?: string) {
        try {
            if (stockId) {
                // Filtrar tipos de mercadoria que têm produtos no stock específico
                return await repository
                    .createQueryBuilder('merchandiseType')
                    .leftJoinAndSelect('merchandiseType.merchandises', 'merchandise')
                    .leftJoinAndSelect('merchandise.stock', 'stock')
                    .where('stock.id = :stockId', { stockId })
                    .getMany();
            } else {
                // Retornar todos os tipos de mercadoria
                return await repository.find({
                    relations: ['merchandises']
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
}
