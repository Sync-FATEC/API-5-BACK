import { SystemError } from "../middlewares/SystemError";
import { ProductRepository } from "../repository/ProductRepository";
import { ProductTypeRepository } from "../repository/ProductTypeRepository";
import { ProductType } from "../types/ProductType";
import { RoleEnum } from "../database/enums/RoleEnum";

const productRepository = new ProductRepository();
const productTypeRepository = new ProductTypeRepository();

export class ProductService {
    async createProduct(product: ProductType, validDate: Date) {
        try {
            // Validar se o tipo de produto existe
            await productTypeRepository.getById(product.productTypeId);
            
            await productRepository.isValidFichNumber(product.fichNumber);
            
            if (product.quantity < 0) {
                throw new SystemError("A quantidade não pode ser negativa");
            }
            
            if (product.minimumStock < 0) {
                throw new SystemError("O estoque mínimo não pode ser negativo");
            }

            const savedProduct = await productRepository.create(product, validDate);
            return savedProduct;
        } catch (error) {
            console.error("Erro no serviço de criação de produto:", error);
            throw error;
        }
    }

    async getAllProducts() {
        try {
            return await productRepository.listAll();
        } catch (error) {
            console.error("Erro ao listar produtos:", error);
            throw error;
        }
    }

    async getProductById(id: string) {
        try {
            return await productRepository.getById(id);
        } catch (error) {
            console.error("Erro ao buscar produto por ID:", error);
            throw error;
        }
    }

    async updateProduct(id: string, productData: Partial<ProductType>) {
        try {
            // Validar se o tipo de produto existe (se estiver sendo alterado)
            if (productData.productTypeId) {
                await productTypeRepository.getById(productData.productTypeId);
            }
            
            if (productData.fichNumber) {
                await productRepository.isValidFichNumber(productData.fichNumber, id);
            }
            
            if (productData.quantity !== undefined && productData.quantity < 0) {
                throw new SystemError("A quantidade não pode ser negativa");
            }
            
            if (productData.minimumStock !== undefined && productData.minimumStock < 0) {
                throw new SystemError("O estoque mínimo não pode ser negativo");
            }

            return await productRepository.update(id, productData);
        } catch (error) {
            console.error("Erro ao atualizar produto:", error);
            throw error;
        }
    }

    async deleteProduct(id: string, userRole: RoleEnum) {
        try {
            if (userRole !== RoleEnum.ADMIN) {
                throw new SystemError("Apenas administradores podem excluir produtos");
            }

            const product = await productRepository.getById(id);
            
            if (!product) {
                throw new SystemError("Produto não encontrado");
            }

            await productRepository.delete(id);
            return { success: true, message: "Produto removido com sucesso" };
        } catch (error) {
            console.error("Erro ao excluir produto:", error);
            throw error;
        }
    }
}
