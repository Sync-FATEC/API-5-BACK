import { SystemError } from "../middlewares/SystemError";
import { MerchandiseRepository } from "../repository/MerchandiseRepository";
import { MerchandiseTypeRepository } from "../repository/MerchandiseTypeRepository";
import { MerchandiseTypeEnum } from "../types/ProductType";
import { RoleEnum } from "../database/enums/RoleEnum";

const merchandiseRepository = new MerchandiseRepository();
const merchandiseTypeRepository = new MerchandiseTypeRepository();

export class MerchandiseService {
    async createMerchandise(merchandise: MerchandiseTypeEnum, validDate: Date) {
        try {
            await merchandiseTypeRepository.getById(merchandise.typeId);
            
            if (merchandise.quantity < 0) {
                throw new SystemError("A quantidade não pode ser negativa");
            }

            const savedMerchandise = await merchandiseRepository.create(merchandise, validDate);
            return savedMerchandise;
        } catch (error) {
            console.error("Erro no serviço de criação de mercadoria:", error);
            throw error;
        }
    }

    async getAllMerchandises() {
        try {
            return await merchandiseRepository.listAll();
        } catch (error) {
            console.error("Erro ao listar mercadorias:", error);
            throw error;
        }
    }

    async getMerchandiseById(id: string) {
        try {
            return await merchandiseRepository.getById(id);
        } catch (error) {
            console.error("Erro ao buscar mercadoria por ID:", error);
            throw error;
        }
    }

    async updateMerchandise(id: string, merchandiseData: Partial<MerchandiseTypeEnum>) {
        try {
            // Validar se o tipo de mercadoria existe (se estiver sendo alterado)
            if (merchandiseData.typeId) {
                await merchandiseTypeRepository.getById(merchandiseData.typeId);
            }
            
            if (merchandiseData.quantity !== undefined && merchandiseData.quantity < 0) {
                throw new SystemError("A quantidade não pode ser negativa");
            }

            return await merchandiseRepository.update(id, merchandiseData);
        } catch (error) {
            console.error("Erro ao atualizar mercadoria:", error);
            throw error;
        }
    }

    async deleteMerchandise(id: string, userRole: RoleEnum) {
        try {
            if (userRole !== RoleEnum.ADMIN) {
                throw new SystemError("Apenas administradores podem excluir mercadorias");
            }

            const merchandise = await merchandiseRepository.getById(id);
            
            if (!merchandise) {
                throw new SystemError("Mercadoria não encontrada");
            }

            await merchandiseRepository.delete(id);
            return { success: true, message: "Mercadoria removida com sucesso" };
        } catch (error) {
            console.error("Erro ao excluir mercadoria:", error);
            throw error;
        }
    }
}
