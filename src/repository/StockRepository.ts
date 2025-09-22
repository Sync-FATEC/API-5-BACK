import { AppDataSource } from "../database/data-source";
import { Stock } from "../database/entities/Stock";
import { SystemError } from "../middlewares/SystemError";
import { RoleEnum } from "../database/enums/RoleEnum";

const repository = AppDataSource.getRepository(Stock);

export class StockRepository {
    async getStocksByUserId(userId: string, userRole: string) {
        try {
            let stocks;

            if (userRole === RoleEnum.ADMIN) {
                stocks = await repository.find();
            } else {
                stocks = await repository.find({
                    where: { userStocks: { user: { firebaseUid: userId } } },
                });
            }

            if (!stocks || stocks.length === 0) {
                throw new SystemError("Nenhum estoque encontrado para o usuário fornecido");
            }

            return stocks;
        } catch (error) {
            console.error("Erro ao buscar estoques do usuário", error);
            throw error;
        }
    }

    async updateStock(stockId: string, name: string, location: string) {
        try {
            await repository.update(stockId, {
                name,
                location,
            });
        } catch (error) {
            console.error("Erro ao atualizar estoque", error);
            throw error;
        }
    }

    async createStock(name: string, location: string) {
        try {
            const stock = repository.create({
                name,
                location,
            });

            return await repository.save(stock);
        } catch (error) {
            console.error("Erro ao criar estoque", error);
            throw error;
        }
    }

    async deleteStock(stockId: string) {
        try {
            await repository.update(stockId, { active: false });
        } catch (error) {
            console.error("Erro ao excluir estoque", error);
            throw error;
        }
    }
}
