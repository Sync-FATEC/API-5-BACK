import { Request, Response, NextFunction } from "express";
import { MerchandiseType } from "../types/ProductType";
import { SystemError } from "../middlewares/SystemError";
import { MerchandiseService } from "../services/MerchandiseService";
import { MerchandiseStatus } from "../database/entities/Merchandise";
import * as QRCode from 'qrcode';

const merchandiseService = new MerchandiseService();

export class MerchandiseController {
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const { typeId, quantity, status, validDate } = req.body;

            if (!typeId || quantity === undefined || !status || !validDate) {
                throw new SystemError("Dados incompletos. typeId, quantity, status e validDate são obrigatórios.");
            }

            const merchandiseData: MerchandiseType = {
                typeId,
                quantity: Number(quantity),
                status: status as MerchandiseStatus
            };

            const merchandise = await merchandiseService.createMerchandise(merchandiseData, validDate);

            res.status(201).json({
                success: true,
                data: merchandise,
                message: "Mercadoria criada com sucesso"
            });
        } catch (error) {
            next(error);
        }
    }

    async listAll(req: Request, res: Response, next: NextFunction) {
        try {
            const merchandises = await merchandiseService.getAllMerchandises();
            res.status(200).json({
                success: true,
                data: merchandises,
                message: "Mercadorias listadas com sucesso"
            });
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            
            if (!id) {
                throw new SystemError("ID da mercadoria é obrigatório");
            }

            const merchandise = await merchandiseService.getMerchandiseById(id);
            res.status(200).json({
                success: true,
                data: merchandise,
                message: "Mercadoria encontrada com sucesso"
            });
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { typeId, quantity, status } = req.body;

            if (!id) {
                throw new SystemError("ID da mercadoria é obrigatório");
            }

            if (!typeId && quantity === undefined && !status) {
                throw new SystemError("Nenhum dado fornecido para atualização");
            }

            const merchandiseData: Partial<MerchandiseType> = {};
            
            if (typeId) merchandiseData.typeId = typeId;
            if (quantity !== undefined) merchandiseData.quantity = Number(quantity);
            if (status) merchandiseData.status = status as MerchandiseStatus;

            const updatedMerchandise = await merchandiseService.updateMerchandise(id, merchandiseData);
            res.status(200).json({
                success: true,
                data: updatedMerchandise,
                message: "Mercadoria atualizada com sucesso"
            });
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            
            if (!id) {
                throw new SystemError("ID da mercadoria é obrigatório");
            }

            if (!req.user?.userData?.role) {
                throw new SystemError("Permissão negada");
            }

            await merchandiseService.deleteMerchandise(id, req.user.userData.role);
            res.status(200).json({
                success: true,
                message: "Mercadoria removida com sucesso"
            });
        } catch (error) {
            next(error);
        }
    }

    async generateQRCode(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { format } = req.query;
            
            if (!id) {
                throw new SystemError("ID da mercadoria é obrigatório");
            }

            const merchandise = await merchandiseService.getMerchandiseById(id);
            
            if (!merchandise) {
                throw new SystemError("Mercadoria não encontrada");
            }

            const qrCodeData = {
                id: merchandise.id,
                batchId: merchandise.batchId,
                typeId: merchandise.typeId,
                quantity: merchandise.quantity,
                status: merchandise.status
            };

            const qrCodeString = JSON.stringify(qrCodeData);

            const qrCodeFormat = (format as string)?.toLowerCase() === 'svg' ? 'svg' : 'png';

            if (qrCodeFormat === 'svg') {
                const qrCodeSvg = await QRCode.toString(qrCodeString, { type: 'svg' });
                
                res.setHeader('Content-Type', 'image/svg+xml');
                res.setHeader('Content-Disposition', `attachment; filename="merchandise-${id}-qrcode.svg"`);
                return res.status(200).send(qrCodeSvg);
            } else {
                const qrCodeBuffer = await QRCode.toBuffer(qrCodeString);
                
                res.setHeader('Content-Type', 'image/png');
                res.setHeader('Content-Disposition', `attachment; filename="merchandise-${id}-qrcode.png"`);
                return res.status(200).send(qrCodeBuffer);
            }
        } catch (error) {
            next(error);
        }
    }

    async getStockAlerts(req: Request, res: Response, next: NextFunction) {
        try {
            const stockAlerts = await merchandiseService.getStockAlerts();
            
            res.status(200).json({
                success: true,
                data: stockAlerts,
                message: "Alertas de estoque recuperados com sucesso"
            });
        } catch (error) {
            next(error);
        }
    }
}
