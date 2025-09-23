import { AppDataSource } from "../database/data-source";
import { Batch } from "../database/entities/Batch";
import { Product } from "../database/entities/Product";
import { SystemError } from "../middlewares/SystemError";
import { ProductType } from "../types/ProductType";

const repository = AppDataSource.getRepository(Product);
const batchRepository = AppDataSource.getRepository(Batch);

export class ProductRepository {
    async create(product: ProductType, validDate: Date) {
        try {
            const savedProduct = await repository.save(product);

            const batch = await batchRepository.save({
                expirationDate: validDate,
                product: savedProduct
            });

            return {savedProduct, batch};
        } catch (error) {
            console.error("Erro ao criar o produto", error);
            throw error;
        }
    }

    async getById(id: string) {
        try {
            const product = await repository.findOne({
                where: { id },
                relations: ['productType']
            });

            if (!product) {
                throw new SystemError("Produto não encontrado");
            }

            return product;
        } catch (error) {
            console.error("Erro ao buscar o produto", error);
            throw error;
        }
    }

    async listAll() {
        try {
            return await repository.find({
                where: { isActive: true },
                relations: ['productType']
            });
        } catch (error) {
            console.error("Erro ao listar produtos", error);
            throw error;
        }
    }

    async update(id: string, productData: Partial<ProductType>) {
        try {
            const product = await this.getById(id);

            if (!product) {
                throw new SystemError("Produto não encontrado");
            }

            const updatedProduct = await repository.save({
                ...product,
                ...productData,
                updatedAt: new Date()
            });

            return updatedProduct;
        } catch (error) {
            console.error("Erro ao atualizar o produto", error);
            throw error;
        }
    }

    async delete(id: string) {
        try {
            const product = await this.getById(id);

            if (!product) {
                throw new SystemError("Produto não encontrado");
            }

            await repository.update(id, { 
                isActive: false,
                updatedAt: new Date()
            });

            return true;
        } catch (error) {
            console.error("Erro ao excluir o produto", error);
            throw error;
        }
    }

    async isValidFichNumber(fichNumber: string, id?: string) {
        try {
            const query = repository.createQueryBuilder("product")
                .where("product.fichNumber = :fichNumber", { fichNumber })
                .andWhere("product.isActive = :isActive", { isActive: true });

            if (id) {
                query.andWhere("product.id != :id", { id });
            }

            const count = await query.getCount();

            if (count > 0) {
                throw new SystemError("Já existe um produto com este número de ficha");
            }

            return true;
        } catch (error) {
            console.error("Erro ao validar número de ficha", error);
            throw error;
        }
    }
}
