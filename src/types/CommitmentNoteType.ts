export interface CommitmentNoteCreateDTO {
  supplierId: string;
  valor: number;
  numeroNota: string;
  dataNota: string | Date;
  ug: string;
  razaoSocial: string;
  cnpj: string;
  nomeResponsavelExtraido?: string;
  nomeResponsavelManual?: string;
  cargoResponsavel?: string;
  frequenciaCobrancaDias?: number; // default 15
  urgencia?: string;
  dataPrevistaEntrega?: string | Date; // default createdAt + 30 dias
  isActive?: boolean;
}

export type CommitmentNoteUpdateDTO = Partial<CommitmentNoteCreateDTO>;

export interface CommitmentNoteAdminUpdateDTO {
  processoAdm?: boolean;
  materialRecebido?: boolean;
  nfEntregueNoAlmox?: boolean;
  justificativaMais60Dias?: string;
  enviadoParaLiquidar?: boolean;
}