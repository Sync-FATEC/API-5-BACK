import { Request, Response, NextFunction } from "express";
import { ProductTypeType } from "../types/ProductTypeType";
import { SystemError } from "../middlewares/SystemError";
import { ProductTypeService } from "../services/ProductTypeService";

const productTypeService = new ProductTypeService();

export class ProductTypeController {
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const { name, numeroFichas, unidadeMedida, controlada, estoqueMinimo, description } = req.body;

            if (!name || !numeroFichas || !unidadeMedida || controlada === undefined || estoqueMinimo === undefined) {
                throw new SystemError("Dados incompletos. Nome, número de fichas, unidade de medida, controlada e estoque mínimo são obrigatórios.");
            }

            const productTypeData: ProductTypeType = {
                name,
                numeroFichas,
                unidadeMedida,
                controlada: Boolean(controlada),
                estoqueMinimo: Number(estoqueMinimo),
                description: description || undefined
            };

            const productType = await productTypeService.createProductType(productTypeData);
            res.status(201).json({
                success: true,
                data: productType,
                message: "Tipo de produto criado com sucesso"
            });
        } catch (error) {
            next(error);
        }
    }

    async listAll(req: Request, res: Response, next: NextFunction) {
        try {
            const productTypes = await productTypeService.getAllProductTypes();
            res.status(200).json({
                success: true,
                data: productTypes,
                message: "Tipos de produto listados com sucesso"
            });
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            
            if (!id) {
                throw new SystemError("ID do tipo de produto é obrigatório");
            }

            const productType = await productTypeService.getProductTypeById(id);
            res.status(200).json({
                success: true,
                data: productType,
                message: "Tipo de produto encontrado com sucesso"
            });
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { name, numeroFichas, unidadeMedida, controlada, estoqueMinimo, description } = req.body;

            if (!id) {
                throw new SystemError("ID do tipo de produto é obrigatório");
            }

            if (!name && !numeroFichas && !unidadeMedida && controlada === undefined && estoqueMinimo === undefined && !description) {
                throw new SystemError("Nenhum dado fornecido para atualização");
            }

            const productTypeData: Partial<ProductTypeType> = {};
            
            if (name) productTypeData.name = name;
            if (numeroFichas) productTypeData.numeroFichas = numeroFichas;
            if (unidadeMedida) productTypeData.unidadeMedida = unidadeMedida;
            if (controlada !== undefined) productTypeData.controlada = Boolean(controlada);
            if (estoqueMinimo !== undefined) productTypeData.estoqueMinimo = Number(estoqueMinimo);
            if (description !== undefined) productTypeData.description = description;

            const updatedProductType = await productTypeService.updateProductType(id, productTypeData);
            res.status(200).json({
                success: true,
                data: updatedProductType,
                message: "Tipo de produto atualizado com sucesso"
            });
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            
            if (!id) {
                throw new SystemError("ID do tipo de produto é obrigatório");
            }

            if (!req.user?.userData?.role) {
                throw new SystemError("Permissão negada");
            }

            await productTypeService.deleteProductType(id, req.user.userData.role);
            res.status(200).json({
                success: true,
                message: "Tipo de produto removido com sucesso"
            });
        } catch (error) {
            next(error);
        }
    }
}
