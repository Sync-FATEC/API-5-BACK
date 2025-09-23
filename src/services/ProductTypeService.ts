import { SystemError } from "../middlewares/SystemError";
import { ProductTypeRepository } from "../repository/ProductTypeRepository";
import { ProductTypeType } from "../types/ProductTypeType";
import { RoleEnum } from "../database/enums/RoleEnum";

const productTypeRepository = new ProductTypeRepository();

export class ProductTypeService {
    async createProductType(productType: ProductTypeType) {
        try {
            await productTypeRepository.isValidName(productType.name);
            await productTypeRepository.isValidNumeroFichas(productType.numeroFichas);
            
            if (productType.estoqueMinimo < 0) {
                throw new SystemError("O estoque mínimo não pode ser negativo");
            }
            
            const savedProductType = await productTypeRepository.create(productType);
            return savedProductType;
        } catch (error) {
            console.error("Erro no serviço de criação de tipo de produto:", error);
            throw error;
        }
    }

    async getAllProductTypes() {
        try {
            return await productTypeRepository.listAll();
        } catch (error) {
            console.error("Erro ao listar tipos de produto:", error);
            throw error;
        }
    }

    async getProductTypeById(id: string) {
        try {
            return await productTypeRepository.getById(id);
        } catch (error) {
            console.error("Erro ao buscar tipo de produto por ID:", error);
            throw error;
        }
    }

    async updateProductType(id: string, productTypeData: Partial<ProductTypeType>) {
        try {
            if (productTypeData.name) {
                await productTypeRepository.isValidName(productTypeData.name, id);
            }

            if (productTypeData.numeroFichas) {
                await productTypeRepository.isValidNumeroFichas(productTypeData.numeroFichas, id);
            }

            if (productTypeData.estoqueMinimo !== undefined && productTypeData.estoqueMinimo < 0) {
                throw new SystemError("O estoque mínimo não pode ser negativo");
            }

            return await productTypeRepository.update(id, productTypeData);
        } catch (error) {
            console.error("Erro ao atualizar tipo de produto:", error);
            throw error;
        }
    }

    async deleteProductType(id: string, userRole: RoleEnum) {
        try {
            if (userRole !== RoleEnum.ADMIN && userRole !== RoleEnum.SUPERVISOR) {
                throw new SystemError("Apenas administradores e supervisores podem excluir tipos de produto");
            }

            const productType = await productTypeRepository.getById(id);
            
            if (!productType) {
                throw new SystemError("Tipo de produto não encontrado");
            }

            await productTypeRepository.delete(id);
            return { success: true, message: "Tipo de produto removido com sucesso" };
        } catch (error) {
            console.error("Erro ao excluir tipo de produto:", error);
            throw error;
        }
    }
}
