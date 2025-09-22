import { NextFunction, Request, Response } from "express";
import { StockServices } from "../services/StockServices";
import { SystemError } from "../middlewares/SystemError";

const stockServices = new StockServices();

export class StockController {
    async getStockByUser(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.uid;

            if (!userId) {
                throw new SystemError("Usuario nao autenticado")
            }
            
            const stock = await stockServices.getStockByUser(userId)

            res.status(200).json({
                success: true,
                data: stock,
            });
        } catch (error) {
            next(error)
        }
    }

    async createStock(req: Request, res: Response, next: NextFunction) {
        try {

            const { name, location } = req.body;

            const stock = await stockServices.createStock(name, location)

            res.status(201).json({
                success: true,
                data: [stock]
            });
        } catch (error) {
            next(error)
        }
    }

    async updateStock(req: Request, res: Response, next: NextFunction) {
        try {
            const stockId = req.params.stockId;
            const { name, location } = req.body;
            await stockServices.updateStock(stockId, name, location);
            res.status(200).json({
                success: true,
                message: "Estoque atualizado com sucesso",
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteStock(req: Request, res: Response, next: NextFunction) {
        try {
            const stockId = req.params.stockId;
            await stockServices.deleteStock(stockId);
            res.status(200).json({
                success: true,
                message: "Estoque excluído com sucesso",
            });
        } catch (error) {
            next(error);
        }
    }
}