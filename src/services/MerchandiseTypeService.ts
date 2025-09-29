import { SystemError } from "../middlewares/SystemError";
import { MerchandiseTypeRepository } from "../repository/MerchandiseTypeRepository";
import { MerchandiseTypeType } from "../types/ProductTypeType";
import { RoleEnum } from "../database/enums/RoleEnum";

const merchandiseTypeRepository = new MerchandiseTypeRepository();

export class MerchandiseTypeService {
    async createMerchandiseType(merchandiseType: MerchandiseTypeType) {
        try {
            await merchandiseTypeRepository.isValidName(merchandiseType.name);
            await merchandiseTypeRepository.isValidRecordNumber(merchandiseType.recordNumber);
            
            if (merchandiseType.minimumStock < 0) {
                throw new SystemError("O estoque mínimo não pode ser negativo");
            }
            
            const savedMerchandiseType = await merchandiseTypeRepository.create(merchandiseType);
            return savedMerchandiseType;
        } catch (error) {
            console.error("Erro no serviço de criação de tipo de mercadoria:", error);
            throw error;
        }
    }

    async getAllMerchandiseTypes(stockId?: string) {
        try {
            return await merchandiseTypeRepository.listAll(stockId);
        } catch (error) {
            console.error("Erro ao listar tipos de mercadoria:", error);
            throw error;
        }
    }

    async getMerchandiseTypeById(id: string) {
        try {
            return await merchandiseTypeRepository.getById(id);
        } catch (error) {
            console.error("Erro ao buscar tipo de mercadoria por ID:", error);
            throw error;
        }
    }

    async updateMerchandiseType(id: string, merchandiseTypeData: Partial<MerchandiseTypeType>) {
        try {
            if (merchandiseTypeData.name) {
                await merchandiseTypeRepository.isValidName(merchandiseTypeData.name, id);
            }

            if (merchandiseTypeData.recordNumber) {
                await merchandiseTypeRepository.isValidRecordNumber(merchandiseTypeData.recordNumber, id);
            }

            if (merchandiseTypeData.minimumStock !== undefined && merchandiseTypeData.minimumStock < 0) {
                throw new SystemError("O estoque mínimo não pode ser negativo");
            }

            return await merchandiseTypeRepository.update(id, merchandiseTypeData);
        } catch (error) {
            console.error("Erro ao atualizar tipo de mercadoria:", error);
            throw error;
        }
    }

    async deleteMerchandiseType(id: string, userRole: RoleEnum) {
        try {
            if (userRole !== RoleEnum.ADMIN && userRole !== RoleEnum.SUPERVISOR) {
                throw new SystemError("Apenas administradores e supervisores podem excluir tipos de mercadoria");
            }

            const merchandiseType = await merchandiseTypeRepository.getById(id);
            
            if (!merchandiseType) {
                throw new SystemError("Tipo de mercadoria não encontrado");
            }

            await merchandiseTypeRepository.delete(id);
            return { success: true, message: "Tipo de mercadoria removido com sucesso" };
        } catch (error) {
            console.error("Erro ao excluir tipo de mercadoria:", error);
            throw error;
        }
    }

    async updateQuantityTotal(id: string, quantityTotal: number, userRole: RoleEnum) {
        try {
            if (userRole !== RoleEnum.ADMIN) {
                throw new SystemError("Apenas administradores podem atualizar a quantidade total");
            }

            if (quantityTotal < 0) {
                throw new SystemError("A quantidade total não pode ser negativa");
            }

            return await merchandiseTypeRepository.update(id, { quantityTotal });
        } catch (error) {
            console.error("Erro ao atualizar quantidade total:", error);
            throw error;
        }
    }
}
