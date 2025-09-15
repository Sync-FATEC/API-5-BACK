import { Request, Response, NextFunction } from "express";
import { ProductType } from "../types/ProductType";
import { SystemError } from "../middlewares/SystemError";
import { ProductService } from "../services/ProductService";

const productService = new ProductService();

export class ProductController {
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const { name, fichNumber, quantity, minimumStock, unitOfMeasure, group } = req.body;

            if (!name || !fichNumber || quantity === undefined || minimumStock === undefined || !unitOfMeasure || !group) {
                throw new SystemError("Dados incompletos");
            }

            const productData: ProductType = {
                name,
                fichNumber,
                quantity: Number(quantity),
                minimumStock: Number(minimumStock),
                unitOfMeasure,
                group
            };

            const product = await productService.createProduct(productData);
            res.status(201).json({
                success: true,
                data: product,
                message: "Produto criado com sucesso"
            });
        } catch (error) {
            next(error);
        }
    }

    async listAll(req: Request, res: Response, next: NextFunction) {
        try {
            const products = await productService.getAllProducts();
            res.status(200).json({
                success: true,
                data: products,
                message: "Produtos listados com sucesso"
            });
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            
            if (!id) {
                throw new SystemError("ID do produto é obrigatório");
            }

            const product = await productService.getProductById(id);
            res.status(200).json({
                success: true,
                data: product,
                message: "Produto encontrado com sucesso"
            });
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { name, fichNumber, quantity, minimumStock, unitOfMeasure, group } = req.body;

            if (!id) {
                throw new SystemError("ID do produto é obrigatório");
            }

            if (!name && !fichNumber && quantity === undefined && minimumStock === undefined && !unitOfMeasure && !group) {
                throw new SystemError("Nenhum dado fornecido para atualização");
            }

            const productData: Partial<ProductType> = {};
            
            if (name) productData.name = name;
            if (fichNumber) productData.fichNumber = fichNumber;
            if (quantity !== undefined) productData.quantity = Number(quantity);
            if (minimumStock !== undefined) productData.minimumStock = Number(minimumStock);
            if (unitOfMeasure) productData.unitOfMeasure = unitOfMeasure;
            if (group) productData.group = group;

            const updatedProduct = await productService.updateProduct(id, productData);
            res.status(200).json({
                success: true,
                data: updatedProduct,
                message: "Produto atualizado com sucesso"
            });
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            
            if (!id) {
                throw new SystemError("ID do produto é obrigatório");
            }

            if (!req.user?.userData?.role) {
                throw new SystemError("Permissão negada");
            }

            await productService.deleteProduct(id, req.user.userData.role);
            res.status(200).json({
                success: true,
                message: "Produto removido com sucesso"
            });
        } catch (error) {
            next(error);
        }
    }
}
