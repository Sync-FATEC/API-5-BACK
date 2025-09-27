import { SystemError } from "../middlewares/SystemError";
import { MerchandiseRepository } from "../repository/MerchandiseRepository";
import { MerchandiseTypeRepository } from "../repository/MerchandiseTypeRepository";
import { MerchandiseType, StockAlert, StockAlertSummary } from "../types/ProductType";
import { RoleEnum } from "../database/enums/RoleEnum";

const merchandiseRepository = new MerchandiseRepository();
const merchandiseTypeRepository = new MerchandiseTypeRepository();

export class MerchandiseService {
    async createMerchandise(merchandise: MerchandiseType, validDate: Date) {
        try {
            // Validar se o tipo de mercadoria existe
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

    async updateMerchandise(id: string, merchandiseData: Partial<MerchandiseType>) {
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

    async getStockAlerts(): Promise<StockAlertSummary> {
        try {
            const stockData = await merchandiseRepository.getStockAlerts();
            
            const alerts: StockAlert[] = stockData.map((item: any): StockAlert => {
                const totalQuantity = parseInt(item.totalQuantity);
                const minimumStock = parseInt(item.minimumStock);
                
                // Calcular a diferença entre quantidade atual e quantidade mínima
                const differenceFromMinimum = totalQuantity - minimumStock;
                
                // Determinar o tipo de alerta baseado na diferença
                let alertType: 'normal' | 'warning' | 'critical' = 'normal';
                let alertMessage = '';
                
                if (differenceFromMinimum <= 0) {
                    // Estoque abaixo ou no limite mínimo
                    alertType = 'critical';
                    alertMessage = 'Estoque abaixo do mínimo - Reposição urgente necessária';
                } else if (differenceFromMinimum <= 50) {
                    // Diferença de até 50 unidades acima do mínimo
                    alertType = 'critical';
                    alertMessage = 'Estoque crítico - Próximo do limite mínimo';
                } else if (differenceFromMinimum <= 100) {
                    // Diferença de até 100 unidades acima do mínimo
                    alertType = 'warning';
                    alertMessage = 'Estoque baixo - Atenção necessária';
                }
                // Se a diferença for > 100, alertType permanece 'normal'
                
                return {
                    typeId: item.typeId,
                    typeName: item.typeName,
                    unitOfMeasure: item.unitOfMeasure,
                    minimumStock: minimumStock,
                    totalQuantity: totalQuantity,
                    itemCount: parseInt(item.itemCount),
                    alertType: alertType,
                    alertMessage: alertMessage,
                    needsAttention: alertType !== 'normal'
                };
            });

            // Filtrar apenas itens que precisam de atenção para retornar no endpoint
            const alertsNeeded = alerts.filter((alert: StockAlert) => alert.needsAttention);

            return {
                alerts: alertsNeeded,
                summary: {
                    total: alerts.length,
                    critical: alerts.filter((a: StockAlert) => a.alertType === 'critical').length,
                    warning: alerts.filter((a: StockAlert) => a.alertType === 'warning').length,
                    normal: alerts.filter((a: StockAlert) => a.alertType === 'normal').length
                }
            };
        } catch (error) {
            console.error("Erro ao buscar alertas de estoque:", error);
            throw error;
        }
    }
}
