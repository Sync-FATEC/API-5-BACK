import { Request, Response, NextFunction } from "express";
import { ProductType } from "../types/ProductType";
import { SystemError } from "../middlewares/SystemError";
import { ProductService } from "../services/ProductService";
import * as QRCode from 'qrcode';

const productService = new ProductService();

export class ProductController {
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const { name, fichNumber, quantity, minimumStock, unitOfMeasure, group, productTypeId } = req.body;

            if (!name || !fichNumber || quantity === undefined || minimumStock === undefined || !unitOfMeasure || !group || !productTypeId) {
                throw new SystemError("Dados incompletos. Todos os campos são obrigatórios, incluindo o tipo de produto.");
            }

            const productData: ProductType = {
                name,
                fichNumber,
                quantity: Number(quantity),
                minimumStock: Number(minimumStock),
                unitOfMeasure,
                group,
                productTypeId
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
            const { name, fichNumber, quantity, minimumStock, unitOfMeasure, group, productTypeId } = req.body;

            if (!id) {
                throw new SystemError("ID do produto é obrigatório");
            }

            if (!name && !fichNumber && quantity === undefined && minimumStock === undefined && !unitOfMeasure && !group && !productTypeId) {
                throw new SystemError("Nenhum dado fornecido para atualização");
            }

            const productData: Partial<ProductType> = {};
            
            if (name) productData.name = name;
            if (fichNumber) productData.fichNumber = fichNumber;
            if (quantity !== undefined) productData.quantity = Number(quantity);
            if (minimumStock !== undefined) productData.minimumStock = Number(minimumStock);
            if (unitOfMeasure) productData.unitOfMeasure = unitOfMeasure;
            if (group) productData.group = group;
            if (productTypeId) productData.productTypeId = productTypeId;

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

    async generateQRCode(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { format } = req.query;
            
            if (!id) {
                throw new SystemError("ID do produto é obrigatório");
            }

            const product = await productService.getProductById(id);
            
            if (!product) {
                throw new SystemError("Produto não encontrado");
            }

            const qrCodeData = {
                id: product.id,
                name: product.name,
                fichNumber: product.fichNumber,
                quantity: product.quantity,
                unitOfMeasure: product.unitOfMeasure,
                group: product.group
            };

            const qrCodeString = JSON.stringify(qrCodeData);

            const qrCodeFormat = (format as string)?.toLowerCase() === 'svg' ? 'svg' : 'png';

            if (qrCodeFormat === 'svg') {
                const qrCodeSvg = await QRCode.toString(qrCodeString, { type: 'svg' });
                
                res.setHeader('Content-Type', 'image/svg+xml');
                res.setHeader('Content-Disposition', `attachment; filename="product-${id}-qrcode.svg"`);
                return res.status(200).send(qrCodeSvg);
            } else {
                const qrCodeBuffer = await QRCode.toBuffer(qrCodeString);
                
                res.setHeader('Content-Type', 'image/png');
                res.setHeader('Content-Disposition', `attachment; filename="product-${id}-qrcode.png"`);
                return res.status(200).send(qrCodeBuffer);
            }
        } catch (error) {
            next(error);
        }
    }
}
