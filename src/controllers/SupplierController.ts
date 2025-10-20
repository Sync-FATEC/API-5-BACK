import { Request, Response, NextFunction } from "express";
import { SystemError } from "../middlewares/SystemError";
import { SupplierService } from "../services/SupplierService";
import { SupplierCreateType, SupplierUpdateType, SupplierSearchFilters } from "../types/SupplierType";

const supplierService = new SupplierService();

export class SupplierController {

    // Criar fornecedor
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const { 
                razaoSocial, 
                nomeResponsavel, 
                cargoResponsavel, 
                cnpj, 
                emailPrimario, 
                emailSecundario 
            } = req.body;

            if (!razaoSocial || !cnpj || !emailPrimario) {
                throw new SystemError("Razão Social, CNPJ e Email primário são obrigatórios");
            }

            const supplierData: SupplierCreateType = {
                razaoSocial,
                nomeResponsavel,
                cargoResponsavel,
                cnpj,
                emailPrimario,
                emailSecundario
            };

            const supplier = await supplierService.createSupplier(supplierData);
            
            res.status(201).json({
                success: true,
                data: supplier,
                message: "Fornecedor criado com sucesso"
            });
        } catch (error) {
            next(error);
        }
    }

    // Buscar todos os fornecedores com filtros
    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const {
                search,
                isActive,
                page = 1,
                limit = 10,
                sortBy = 'createdAt',
                sortOrder = 'DESC'
            } = req.query;

            const filters: SupplierSearchFilters = {
                search: search as string,
                isActive: isActive ? isActive === 'true' : undefined,
                page: parseInt(page as string) || 1,
                limit: parseInt(limit as string) || 10,
                sortBy: sortBy as any,
                sortOrder: sortOrder as any
            };

            const result = await supplierService.getAllSuppliers(filters);

            res.status(200).json({
                success: true,
                data: result,
                message: "Fornecedores obtidos com sucesso"
            });
        } catch (error) {
            next(error);
        }
    }

    // Buscar fornecedor por ID
    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;

            if (!id) {
                throw new SystemError("ID do fornecedor é obrigatório");
            }

            const supplier = await supplierService.getSupplierById(id);

            res.status(200).json({
                success: true,
                data: supplier,
                message: "Fornecedor encontrado com sucesso"
            });
        } catch (error) {
            next(error);
        }
    }

    // Buscar fornecedor por CNPJ
    async getByCnpj(req: Request, res: Response, next: NextFunction) {
        try {
            const { cnpj } = req.params;

            if (!cnpj) {
                throw new SystemError("CNPJ é obrigatório");
            }

            const supplier = await supplierService.getSupplierByCnpj(cnpj);

            if (!supplier) {
                return res.status(404).json({
                    success: false,
                    message: "Fornecedor não encontrado"
                });
            }

            res.status(200).json({
                success: true,
                data: supplier,
                message: "Fornecedor encontrado com sucesso"
            });
        } catch (error) {
            next(error);
        }
    }

    // Atualizar fornecedor
    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { 
                razaoSocial, 
                nomeResponsavel, 
                cargoResponsavel, 
                cnpj, 
                emailPrimario, 
                emailSecundario, 
                isActive 
            } = req.body;

            if (!id) {
                throw new SystemError("ID do fornecedor é obrigatório");
            }

            const updateData: SupplierUpdateType = {};

            // Atualizar apenas campos fornecidos
            if (razaoSocial !== undefined) updateData.razaoSocial = razaoSocial;
            if (nomeResponsavel !== undefined) updateData.nomeResponsavel = nomeResponsavel;
            if (cargoResponsavel !== undefined) updateData.cargoResponsavel = cargoResponsavel;
            if (cnpj !== undefined) updateData.cnpj = cnpj;
            if (emailPrimario !== undefined) updateData.emailPrimario = emailPrimario;
            if (emailSecundario !== undefined) updateData.emailSecundario = emailSecundario;
            if (isActive !== undefined) updateData.isActive = isActive;

            const updatedSupplier = await supplierService.updateSupplier(id, updateData);

            res.status(200).json({
                success: true,
                data: updatedSupplier,
                message: "Fornecedor atualizado com sucesso"
            });
        } catch (error) {
            next(error);
        }
    }

    // Deletar fornecedor (soft delete)
    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;

            if (!id) {
                throw new SystemError("ID do fornecedor é obrigatório");
            }

            await supplierService.deleteSupplier(id);

            res.status(200).json({
                success: true,
                message: "Fornecedor deletado com sucesso"
            });
        } catch (error) {
            next(error);
        }
    }

    // Reativar fornecedor
    async reactivate(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;

            if (!id) {
                throw new SystemError("ID do fornecedor é obrigatório");
            }

            const reactivatedSupplier = await supplierService.reactivateSupplier(id);

            res.status(200).json({
                success: true,
                data: reactivatedSupplier,
                message: "Fornecedor reativado com sucesso"
            });
        } catch (error) {
            next(error);
        }
    }

    // Obter estatísticas de fornecedores
    async getStats(req: Request, res: Response, next: NextFunction) {
        try {
            const stats = await supplierService.getSupplierStats();

            res.status(200).json({
                success: true,
                data: stats,
                message: "Estatísticas obtidas com sucesso"
            });
        } catch (error) {
            next(error);
        }
    }

    // Validar CNPJ
    async validateCnpj(req: Request, res: Response, next: NextFunction) {
        try {
            const { cnpj } = req.params;
            const { excludeId } = req.query;

            if (!cnpj) {
                throw new SystemError("CNPJ é obrigatório");
            }

            // Se é para excluir um ID da verificação (útil para edição)
            if (excludeId) {
                const existingSupplier = await supplierService.getSupplierById(excludeId as string);
                if (existingSupplier && existingSupplier.cnpj === cnpj) {
                    return res.status(200).json({
                        success: true,
                        isValid: true,
                        message: "CNPJ válido (mesmo fornecedor)"
                    });
                }
            }

            const existingSupplier = await supplierService.getSupplierByCnpj(cnpj);
            
            if (existingSupplier) {
                return res.status(400).json({
                    success: false,
                    isValid: false,
                    message: "CNPJ já cadastrado"
                });
            }

            res.status(200).json({
                success: true,
                isValid: true,
                message: "CNPJ disponível"
            });
        } catch (error) {
            next(error);
        }
    }
}
