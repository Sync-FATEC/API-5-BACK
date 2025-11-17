export const AllowedTemplateVariables = [
  'NUMERO_NE',
  'DATA_NE',
  'UG',
  'RAZAO_SOCIAL',
  'CNPJ',
  'NOME_RESPONSAVEL',
  'CARGO_RESPONSAVEL',
  'DATA_PREVISTA',
  'FREQUENCIA',
  'URGENCIA',
] as const;

export type TemplateVarsInput = Partial<Record<typeof AllowedTemplateVariables[number], string>>;

export const sampleVars: TemplateVarsInput = {
  NUMERO_NE: '2025NE000524',
  DATA_NE: '07/07/25',
  UG: '160462',
  RAZAO_SOCIAL: 'G. H. DE MOURA MATERIAIS PARA CONSTRUCAO',
  CNPJ: '12.345.678/0001-90',
  NOME_RESPONSAVEL: 'João Silva',
  CARGO_RESPONSAVEL: 'Gerente Comercial',
  DATA_PREVISTA: '30 dias',
  FREQUENCIA: 'SEG-QUI 09:30–11:30 / 13:00–16:00, SEX 08:00–11:30',
  URGENCIA: 'Normal',
};