export type SupplierType = {
    id?: string;
    razaoSocial: string;
    nomeResponsavel?: string;
    cargoResponsavel?: string;
    cnpj: string;
    emailPrimario: string;
    emailSecundario?: string;
    isActive?: boolean;
}

export type SupplierCreateType = Omit<SupplierType, 'id'>;

export type SupplierUpdateType = {
    razaoSocial?: string;
    nomeResponsavel?: string;
    cargoResponsavel?: string;
    cnpj?: string;
    emailPrimario?: string;
    emailSecundario?: string;
    isActive?: boolean;
}

export type SupplierSearchFilters = {
    search?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
    sortBy?: 'razaoSocial' | 'cnpj' | 'createdAt';
    sortOrder?: 'ASC' | 'DESC';
}
