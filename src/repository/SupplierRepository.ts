import { Like, Repository } from "typeorm";
import { AppDataSource } from "../database/data-source";
import { Supplier } from "../database/entities/Supplier";
import { SystemError } from "../middlewares/SystemError";
import { SupplierCreateType, SupplierUpdateType, SupplierSearchFilters } from "../types/SupplierType";

const repository = AppDataSource.getRepository(Supplier);

export class SupplierRepository {
    
    // Função para criar fornecedor
    async create(supplierData: SupplierCreateType): Promise<Supplier> {
        try {
            // Verificar se CNPJ já existe
            await this.validateUniqueCnpj(supplierData.cnpj);
            
            const supplier = repository.create(supplierData);
            const savedSupplier = await repository.save(supplier);
            
            return savedSupplier;
        } catch (error) {
            console.error("Erro ao criar fornecedor", error);
            throw error;
        }
    }

    // Função para buscar todos os fornecedores com filtros
    async findAll(filters: SupplierSearchFilters = {}): Promise<{ suppliers: Supplier[], total: number }> {
        try {
            const {
                search,
                isActive,
                page = 1,
                limit = 10,
                sortBy = 'createdAt',
                sortOrder = 'DESC'
            } = filters;

            const queryBuilder = repository.createQueryBuilder('supplier');

            // Aplicar filtros
            if (search) {
                queryBuilder.where(
                    '(supplier.razaoSocial ILIKE :search OR supplier.cnpj LIKE :search OR supplier.emailPrimario ILIKE :search OR supplier.nomeResponsavel ILIKE :search)',
                    { search: `%${search}%` }
                );
            }

            if (isActive !== undefined) {
                if (search) {
                    queryBuilder.andWhere('supplier.isActive = :isActive', { isActive });
                } else {
                    queryBuilder.where('supplier.isActive = :isActive', { isActive });
                }
            }

            // Ordenação
            queryBuilder.orderBy(`supplier.${sortBy}`, sortOrder);

            // Paginação
            const offset = (page - 1) * limit;
            queryBuilder.skip(offset).take(limit);

            const [suppliers, total] = await queryBuilder.getManyAndCount();

            return { suppliers, total };
        } catch (error) {
            console.error("Erro ao buscar fornecedores", error);
            throw error;
        }
    }

    // Função para buscar fornecedor por ID
    async findById(id: string): Promise<Supplier | null> {
        try {
            const supplier = await repository.findOne({
                where: { id }
            });
            
            return supplier;
        } catch (error) {
            console.error("Erro ao buscar fornecedor por ID", error);
            throw error;
        }
    }

    // Função para buscar fornecedor por CNPJ
    async findByCnpj(cnpj: string): Promise<Supplier | null> {
        try {
            const supplier = await repository.findOne({
                where: { cnpj }
            });
            
            return supplier;
        } catch (error) {
            console.error("Erro ao buscar fornecedor por CNPJ", error);
            throw error;
        }
    }

    // Função para atualizar fornecedor
    async update(id: string, updateData: SupplierUpdateType): Promise<Supplier> {
        try {
            const supplier = await this.findById(id);
            
            if (!supplier) {
                throw new SystemError("Fornecedor não encontrado");
            }

            // Se está atualizando o CNPJ, verificar se o novo CNPJ já existe em outro fornecedor
            if (updateData.cnpj && updateData.cnpj !== supplier.cnpj) {
                await this.validateUniqueCnpj(updateData.cnpj, id);
            }

            // Atualizar apenas os campos fornecidos
            Object.keys(updateData).forEach(key => {
                const value = updateData[key as keyof SupplierUpdateType];
                if (value !== undefined) {
                    (supplier as any)[key] = value;
                }
            });

            const updatedSupplier = await repository.save(supplier);
            return updatedSupplier;
        } catch (error) {
            console.error("Erro ao atualizar fornecedor", error);
            throw error;
        }
    }

    // Função para deletar fornecedor (soft delete)
    async delete(id: string): Promise<void> {
        try {
            const supplier = await this.findById(id);
            
            if (!supplier) {
                throw new SystemError("Fornecedor não encontrado");
            }

            // Soft delete - apenas desativa o fornecedor
            supplier.isActive = false;
            await repository.save(supplier);
        } catch (error) {
            console.error("Erro ao deletar fornecedor", error);
            throw error;
        }
    }

    // Função para deletar permanentemente
    async permanentDelete(id: string): Promise<void> {
        try {
            const supplier = await this.findById(id);
            
            if (!supplier) {
                throw new SystemError("Fornecedor não encontrado");
            }

            await repository.remove(supplier);
        } catch (error) {
            console.error("Erro ao deletar permanentemente fornecedor", error);
            throw error;
        }
    }

    // Função para reativar fornecedor
    async reactivate(id: string): Promise<Supplier> {
        try {
            const supplier = await this.findById(id);
            
            if (!supplier) {
                throw new SystemError("Fornecedor não encontrado");
            }

            supplier.isActive = true;
            const reactivatedSupplier = await repository.save(supplier);
            return reactivatedSupplier;
        } catch (error) {
            console.error("Erro ao reativar fornecedor", error);
            throw error;
        }
    }

    // Função auxiliar para validar CNPJ único
    private async validateUniqueCnpj(cnpj: string, excludeId?: string): Promise<void> {
        try {
            const queryBuilder = repository.createQueryBuilder('supplier');
            queryBuilder.where('supplier.cnpj = :cnpj', { cnpj });
            
            if (excludeId) {
                queryBuilder.andWhere('supplier.id != :excludeId', { excludeId });
            }

            const existingSupplier = await queryBuilder.getOne();

            if (existingSupplier) {
                throw new SystemError("CNPJ já cadastrado");
            }
        } catch (error) {
            if (error instanceof SystemError) {
                throw error;
            }
            console.error("Erro ao validar CNPJ único", error);
            throw new SystemError("Erro ao validar CNPJ");
        }
    }

    // Função para contar fornecedores ativos
    async countActiveSuppliers(): Promise<number> {
        try {
            const count = await repository.count({
                where: { isActive: true }
            });
            return count;
        } catch (error) {
            console.error("Erro ao contar fornecedores ativos", error);
            throw error;
        }
    }

    // Função para buscar fornecedores recentes
    async findRecentSuppliers(limit: number = 5): Promise<Supplier[]> {
        try {
            const suppliers = await repository.find({
                where: { isActive: true },
                order: { createdAt: 'DESC' },
                take: limit
            });

            return suppliers;
        } catch (error) {
            console.error("Erro ao buscar fornecedores recentes", error);
            throw error;
        }
    }
}
