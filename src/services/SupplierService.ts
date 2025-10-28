import { SystemError } from "../middlewares/SystemError";
import { SupplierRepository } from "../repository/SupplierRepository";
import { SupplierCreateType, SupplierUpdateType, SupplierSearchFilters, SupplierType } from "../types/SupplierType";

const supplierRepository = new SupplierRepository();

export class SupplierService {

    // Função para criar fornecedor
    async createSupplier(supplierData: SupplierCreateType): Promise<SupplierType> {
        try {
            // Validações de negócio
            this.validateSupplierData(supplierData);
            
            // Normalizar e validar CNPJ
            const normalizedCnpj = this.normalizeCnpj(supplierData.cnpj);
            if (!this.validateCnpj(normalizedCnpj)) {
                throw new SystemError("CNPJ inválido");
            }

            // Validar emails
            if (!this.validateEmail(supplierData.emailPrimario)) {
                throw new SystemError("Email primário inválido");
            }

            if (supplierData.emailSecundario && !this.validateEmail(supplierData.emailSecundario)) {
                throw new SystemError("Email secundário inválido");
            }

            // Criar fornecedor com CNPJ normalizado
            const supplierToCreate = {
                ...supplierData,
                cnpj: normalizedCnpj
            };

            const supplier = await supplierRepository.create(supplierToCreate);
            
            return this.formatSupplierResponse(supplier);
        } catch (error) {
            console.error("Erro no serviço de criação de fornecedor:", error);
            throw error;
        }
    }

    // Função para buscar todos os fornecedores
    async getAllSuppliers(filters: SupplierSearchFilters = {}) {
        try {
            const { suppliers, total } = await supplierRepository.findAll(filters);
            
            return {
                suppliers: suppliers.map(supplier => this.formatSupplierResponse(supplier)),
                total,
                page: filters.page || 1,
                limit: filters.limit || 10,
                totalPages: Math.ceil(total / (filters.limit || 10))
            };
        } catch (error) {
            console.error("Erro ao buscar fornecedores:", error);
            throw error;
        }
    }

    // Função para buscar fornecedor por ID
    async getSupplierById(id: string): Promise<SupplierType> {
        try {
            if (!id) {
                throw new SystemError("ID do fornecedor é obrigatório");
            }

            const supplier = await supplierRepository.findById(id);
            
            if (!supplier) {
                throw new SystemError("Fornecedor não encontrado");
            }

            return this.formatSupplierResponse(supplier);
        } catch (error) {
            console.error("Erro ao buscar fornecedor por ID:", error);
            throw error;
        }
    }

    // Função para buscar fornecedor por CNPJ
    async getSupplierByCnpj(cnpj: string): Promise<SupplierType | null> {
        try {
            if (!cnpj) {
                throw new SystemError("CNPJ é obrigatório");
            }

            const normalizedCnpj = this.normalizeCnpj(cnpj);
            const supplier = await supplierRepository.findByCnpj(normalizedCnpj);
            
            return supplier ? this.formatSupplierResponse(supplier) : null;
        } catch (error) {
            console.error("Erro ao buscar fornecedor por CNPJ:", error);
            throw error;
        }
    }

    // Função para atualizar fornecedor
    async updateSupplier(id: string, updateData: SupplierUpdateType): Promise<SupplierType> {
        try {
            if (!id) {
                throw new SystemError("ID do fornecedor é obrigatório");
            }

            // Validar dados de atualização
            if (updateData.cnpj) {
                const normalizedCnpj = this.normalizeCnpj(updateData.cnpj);
                if (!this.validateCnpj(normalizedCnpj)) {
                    throw new SystemError("CNPJ inválido");
                }
                updateData.cnpj = normalizedCnpj;
            }

            if (updateData.emailPrimario && !this.validateEmail(updateData.emailPrimario)) {
                throw new SystemError("Email primário inválido");
            }

            if (updateData.emailSecundario && !this.validateEmail(updateData.emailSecundario)) {
                throw new SystemError("Email secundário inválido");
            }

            const updatedSupplier = await supplierRepository.update(id, updateData);
            
            return this.formatSupplierResponse(updatedSupplier);
        } catch (error) {
            console.error("Erro ao atualizar fornecedor:", error);
            throw error;
        }
    }

    // Função para deletar fornecedor (soft delete)
    async deleteSupplier(id: string): Promise<void> {
        try {
            if (!id) {
                throw new SystemError("ID do fornecedor é obrigatório");
            }

            await supplierRepository.delete(id);
        } catch (error) {
            console.error("Erro ao deletar fornecedor:", error);
            throw error;
        }
    }

    // Função para reativar fornecedor
    async reactivateSupplier(id: string): Promise<SupplierType> {
        try {
            if (!id) {
                throw new SystemError("ID do fornecedor é obrigatório");
            }

            const reactivatedSupplier = await supplierRepository.reactivate(id);
            
            return this.formatSupplierResponse(reactivatedSupplier);
        } catch (error) {
            console.error("Erro ao reativar fornecedor:", error);
            throw error;
        }
    }

    // Função para obter estatísticas de fornecedores
    async getSupplierStats() {
        try {
            const activeCount = await supplierRepository.countActiveSuppliers();
            const recentSuppliers = await supplierRepository.findRecentSuppliers(5);
            
            return {
                activeCount,
                recentSuppliers: recentSuppliers.map(supplier => this.formatSupplierResponse(supplier))
            };
        } catch (error) {
            console.error("Erro ao buscar estatísticas de fornecedores:", error);
            throw error;
        }
    }

    // Funções auxiliares de validação

    private validateSupplierData(supplierData: SupplierCreateType): void {
        if (!supplierData.razaoSocial?.trim()) {
            throw new SystemError("Razão Social é obrigatória");
        }

        if (!supplierData.cnpj?.trim()) {
            throw new SystemError("CNPJ é obrigatório");
        }

        if (!supplierData.emailPrimario?.trim()) {
            throw new SystemError("Email primário é obrigatório");
        }

        // Validar tamanhos
        if (supplierData.razaoSocial.length > 255) {
            throw new SystemError("Razão Social deve ter no máximo 255 caracteres");
        }

        if (supplierData.nomeResponsavel && supplierData.nomeResponsavel.length > 255) {
            throw new SystemError("Nome do Responsável deve ter no máximo 255 caracteres");
        }

        if (supplierData.cargoResponsavel && supplierData.cargoResponsavel.length > 255) {
            throw new SystemError("Cargo do Responsável deve ter no máximo 255 caracteres");
        }
    }

    private validateEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    private normalizeCnpj(cnpj: string): string {
        // Remove todos os caracteres não numéricos
        return cnpj.replace(/\D/g, '');
    }

    private validateCnpj(cnpj: string): boolean {
        // Remove caracteres não numéricos
        cnpj = cnpj.replace(/\D/g, '');

        // Verifica se tem 14 dígitos
        if (cnpj.length !== 14) return false;

        // Verifica se todos os dígitos são iguais
        if (/^(\d)\1+$/.test(cnpj)) return false;

        // Validação dos dígitos verificadores
        let tamanho = cnpj.length - 2;
        let numeros = cnpj.substring(0, tamanho);
        let digitos = cnpj.substring(tamanho);
        let soma = 0;
        let pos = tamanho - 7;

        for (let i = tamanho; i >= 1; i--) {
            soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
            if (pos < 2) pos = 9;
        }

        let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
        if (resultado !== parseInt(digitos.charAt(0))) return false;

        tamanho = tamanho + 1;
        numeros = cnpj.substring(0, tamanho);
        soma = 0;
        pos = tamanho - 7;

        for (let i = tamanho; i >= 1; i--) {
            soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
            if (pos < 2) pos = 9;
        }

        resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
        if (resultado !== parseInt(digitos.charAt(1))) return false;

        return true;
    }

    private formatSupplierResponse(supplier: any): SupplierType {
        return {
            id: supplier.id,
            razaoSocial: supplier.razaoSocial,
            nomeResponsavel: supplier.nomeResponsavel,
            cargoResponsavel: supplier.cargoResponsavel,
            cnpj: this.formatCnpjDisplay(supplier.cnpj),
            emailPrimario: supplier.emailPrimario,
            emailSecundario: supplier.emailSecundario,
            isActive: supplier.isActive
        };
    }

    private formatCnpjDisplay(cnpj: string): string {
        // Formata CNPJ para exibição: 00.000.000/0000-00
        if (cnpj && cnpj.length === 14) {
            return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
        }
        return cnpj;
    }
}
