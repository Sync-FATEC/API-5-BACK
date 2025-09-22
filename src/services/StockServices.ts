import { StockRepository } from "../repository/StockRepository";
import { UsersRepository } from "../repository/UsersRepository";

const stockRepository = new StockRepository()
const userRepository = new UsersRepository()

export class StockServices {
    async getStockByUser(userId: string) {
        try {
            const userRole = await userRepository.getUserRole(userId);

            return await stockRepository.getStocksByUserId(userId, userRole);
        } catch (error) {
            console.error("Erro no serviço de login:", error);
            throw error;
        }
    }

    async createStock(name: string, location: string) {
        try {
            return await stockRepository.createStock(name, location);
        } catch (error) {
            console.error("Erro no serviço de criação de estoque:", error);
            throw error;
        }
    }

    async updateStock(stockId: string, name: string, location: string) {
        try {
            await stockRepository.updateStock(stockId, name, location);
        } catch (error) {
            console.error("Erro no serviço de atualização de estoque:", error);
            throw error;
        }
    }

    async deleteStock(stockId: string) {
        try {
            await stockRepository.deleteStock(stockId);
        } catch (error) {
            console.error("Erro no serviço de exclusão de estoque:", error);
            throw error;
        }
    }
}