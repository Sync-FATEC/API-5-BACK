import { AppDataSource } from "../database/data-source";
import { ProductType } from "../database/entities/ProductType";
import { SystemError } from "../middlewares/SystemError";
import { ProductTypeType } from "../types/ProductTypeType";

const repository = AppDataSource.getRepository(ProductType);

export class ProductTypeRepository {
    async create(productType: ProductTypeType) {
        try {
            const savedProductType = await repository.save(productType);
            return savedProductType;
        } catch (error) {
            console.error("Erro ao criar o tipo de produto", error);
            throw error;
        }
    }

    async getById(id: string) {
        try {
            const productType = await repository.findOne({
                where: { id, isActive: true },
                relations: ['products']
            });

            if (!productType) {
                throw new SystemError("Tipo de produto não encontrado");
            }

            return productType;
        } catch (error) {
            console.error("Erro ao buscar o tipo de produto", error);
            throw error;
        }
    }

    async listAll() {
        try {
            return await repository.find({
                where: { isActive: true },
                relations: ['products']
            });
        } catch (error) {
            console.error("Erro ao listar tipos de produto", error);
            throw error;
        }
    }

    async update(id: string, productTypeData: Partial<ProductTypeType>) {
        try {
            const productType = await this.getById(id);

            if (!productType) {
                throw new SystemError("Tipo de produto não encontrado");
            }

            const updatedProductType = await repository.save({
                ...productType,
                ...productTypeData,
                updatedAt: new Date()
            });

            return updatedProductType;
        } catch (error) {
            console.error("Erro ao atualizar o tipo de produto", error);
            throw error;
        }
    }

    async delete(id: string) {
        try {
            const productType = await this.getById(id);

            if (!productType) {
                throw new SystemError("Tipo de produto não encontrado");
            }

            await repository.update(id, { 
                isActive: false,
                updatedAt: new Date()
            });

            return true;
        } catch (error) {
            console.error("Erro ao excluir o tipo de produto", error);
            throw error;
        }
    }

    async isValidName(name: string, id?: string) {
        try {
            const query = repository.createQueryBuilder("productType")
                .where("productType.name = :name", { name })
                .andWhere("productType.isActive = :isActive", { isActive: true });

            if (id) {
                query.andWhere("productType.id != :id", { id });
            }

            const count = await query.getCount();

            if (count > 0) {
                throw new SystemError("Já existe um tipo de produto com este nome");
            }

            return true;
        } catch (error) {
            console.error("Erro ao validar nome do tipo de produto", error);
            throw error;
        }
    }

    async isValidNumeroFichas(numeroFichas: string, id?: string) {
        try {
            const query = repository.createQueryBuilder("productType")
                .where("productType.numeroFichas = :numeroFichas", { numeroFichas })
                .andWhere("productType.isActive = :isActive", { isActive: true });

            if (id) {
                query.andWhere("productType.id != :id", { id });
            }

            const count = await query.getCount();

            if (count > 0) {
                throw new SystemError("Já existe um tipo de produto com este número de fichas");
            }

            return true;
        } catch (error) {
            console.error("Erro ao validar número de fichas do tipo de produto", error);
            throw error;
        }
    }
}
