import { Request, Response, NextFunction } from "express";
import { MerchandiseTypeType } from "../types/ProductTypeType";
import { SystemError } from "../middlewares/SystemError";
import { MerchandiseTypeService } from "../services/MerchandiseTypeService";
import { MerchandiseGroup } from "../database/enums/MerchandiseGroup";

const merchandiseTypeService = new MerchandiseTypeService();

export class MerchandiseTypeController {
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const { name, recordNumber, unitOfMeasure, controlled, minimumStock, group, stockId } = req.body;

            if (!name || !recordNumber || !unitOfMeasure || controlled === undefined || minimumStock === undefined || !group || !stockId) {
                throw new SystemError("Dados incompletos. Name, recordNumber, unitOfMeasure, controlled, minimumStock, group e stockId são obrigatórios.");
            }

            // Validar se o grupo é válido
            if (!Object.values(MerchandiseGroup).includes(group)) {
                throw new SystemError("Grupo inválido. Valores aceitos: " + Object.values(MerchandiseGroup).join(", "));
            }

            const merchandiseTypeData: MerchandiseTypeType = {
                name,
                recordNumber,
                unitOfMeasure,
                controlled: Boolean(controlled),
                minimumStock: Number(minimumStock),
                group,
                stockId
            };

            const merchandiseType = await merchandiseTypeService.createMerchandiseType(merchandiseTypeData);
            res.status(201).json({
                success: true,
                data: merchandiseType,
                message: "Tipo de mercadoria criado com sucesso"
            });
        } catch (error) {
            next(error);
        }
    }

    async listAll(req: Request, res: Response, next: NextFunction) {
        try {
            const { stockId } = req.params;
            const merchandiseTypes = await merchandiseTypeService.getAllMerchandiseTypes(stockId);
            res.status(200).json({
                success: true,
                data: merchandiseTypes,
                message: "Tipos de mercadoria listados com sucesso"
            });
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            
            if (!id) {
                throw new SystemError("ID do tipo de mercadoria é obrigatório");
            }

            const merchandiseType = await merchandiseTypeService.getMerchandiseTypeById(id);
            res.status(200).json({
                success: true,
                data: merchandiseType,
                message: "Tipo de mercadoria encontrado com sucesso"
            });
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { name, recordNumber, unitOfMeasure, controlled, minimumStock, group } = req.body;

            if (!id) {
                throw new SystemError("ID do tipo de mercadoria é obrigatório");
            }

            if (!name && !recordNumber && !unitOfMeasure && controlled === undefined && minimumStock === undefined && !group) {
                throw new SystemError("Nenhum dado fornecido para atualização");
            }

            // Validar grupo se fornecido
            if (group && !Object.values(MerchandiseGroup).includes(group)) {
                throw new SystemError("Grupo inválido. Valores aceitos: " + Object.values(MerchandiseGroup).join(", "));
            }

            const merchandiseTypeData: Partial<MerchandiseTypeType> = {};
            
            if (name) merchandiseTypeData.name = name;
            if (recordNumber) merchandiseTypeData.recordNumber = recordNumber;
            if (unitOfMeasure) merchandiseTypeData.unitOfMeasure = unitOfMeasure;
            if (controlled !== undefined) merchandiseTypeData.controlled = Boolean(controlled);
            if (minimumStock !== undefined) merchandiseTypeData.minimumStock = Number(minimumStock);
            if (group) merchandiseTypeData.group = group;

            const updatedMerchandiseType = await merchandiseTypeService.updateMerchandiseType(id, merchandiseTypeData);
            res.status(200).json({
                success: true,
                data: updatedMerchandiseType,
                message: "Tipo de mercadoria atualizado com sucesso"
            });
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            
            if (!id) {
                throw new SystemError("ID do tipo de mercadoria é obrigatório");
            }

            if (!req.user?.userData?.role) {
                throw new SystemError("Permissão negada");
            }

            await merchandiseTypeService.deleteMerchandiseType(id, req.user.userData.role);
            res.status(200).json({
                success: true,
                message: "Tipo de mercadoria removido com sucesso"
            });
        } catch (error) {
            next(error);
        }
    }

    async updateQuantityTotal(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { quantityTotal } = req.body;

            if (!id) {
                throw new SystemError("ID do tipo de mercadoria é obrigatório");
            }

            if (!req.user?.userData?.role) {
                throw new SystemError("Permissão negada");
            }

            if (quantityTotal === undefined || quantityTotal === null) {
                throw new SystemError("Quantidade total é obrigatória");
            }

            const updatedMerchandiseType = await merchandiseTypeService.updateQuantityTotal(id, Number(quantityTotal), req.user.userData.role);
            res.status(200).json({
                success: true,
                data: updatedMerchandiseType,
                message: "Quantidade total atualizada com sucesso"
            });
        } catch (error) {
            next(error);
        }
    }
}
