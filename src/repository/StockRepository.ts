import { AppDataSource } from "../database/data-source";
import { Stock } from "../database/entities/Stock";
import { Batch } from "../database/entities/Batch";
import { Order } from "../database/entities/Order";
import { SystemError } from "../middlewares/SystemError";
import { RoleEnum } from "../database/enums/RoleEnum";
import { Between } from "typeorm";

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

            // Retorna lista vazia se não encontrar estoques ao invés de erro
            return stocks || [];
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

    async getHistory({
        merchandiseId,
        tipo,
        inicio,
        fim,
    }: {
        merchandiseId: string;
        tipo?: string;
        inicio?: string;
        fim?: string;
        }) {
        try {
            const batchRepo = AppDataSource.getRepository(Batch);
            const orderRepo = AppDataSource.getRepository(Order);

            const periodo =
                inicio && fim ? Between(new Date(inicio), new Date(fim)) : undefined;

            //ENTRADAS — Lotes (Batch)
            const entradas =
                !tipo || tipo === "entrada"
                    ? await batchRepo
                        .createQueryBuilder("batch")
                        .leftJoinAndSelect("batch.merchandises", "merchandise")
                        .where("merchandise.id = :id", { id: merchandiseId })
                        .andWhere(periodo ? "batch.expirationDate BETWEEN :inicio AND :fim" : "1=1", {
                            inicio,
                            fim,
                        })
                        .orderBy("batch.expirationDate", "DESC")
                        .getMany()
                    : [];

            //SAÍDAS — Pedidos (Order)
            const saidas =
                !tipo || tipo === "saida"
                    ? await orderRepo
                        .createQueryBuilder("order")
                        .leftJoinAndSelect("order.orderItems", "orderItem")
                        .leftJoinAndSelect("orderItem.merchandise", "merchandise")
                        .where("merchandise.id = :id", { id: merchandiseId })
                        .andWhere(periodo ? "order.creationDate BETWEEN :inicio AND :fim" : "1=1", {
                            inicio,
                            fim,
                        })
                        .orderBy("order.creationDate", "DESC")
                        .getMany()
                    : [];

            //Combina os dois tipos
            const historico = [
                ...entradas.map((e) => ({
                    id: e.id,
                    tipo: "entrada",
                    data: e.expirationDate,
                    quantidade: e.merchandises.length,
                })),
                ...saidas.map((s) => ({
                    id: s.id,
                    tipo: "saida",
                    data: s.withdrawalDate || s.creationDate,
                    quantidade: s.orderItems.length,
                })),
            ];

            //Ordena tudo por data
            return historico.sort(
                (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
            );
        } catch (error) {
            console.error("Erro ao buscar histórico de movimentações:", error);
            throw error;
        }
    }
}
