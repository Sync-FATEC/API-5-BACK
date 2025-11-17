import { SystemError } from "../middlewares/SystemError";
import { CommitmentNoteRepository } from "../repository/CommitmentNoteRepository";
import { CommitmentNoteCreateDTO, CommitmentNoteUpdateDTO, CommitmentNoteAdminUpdateDTO } from "../types/CommitmentNoteType";
import { RoleEnum } from "../database/enums/RoleEnum";
import { CommitmentNoteEmailService } from "./CommitmentNoteEmailService";

const repository = new CommitmentNoteRepository();
const emailService = new CommitmentNoteEmailService();

function toDate(value: string | Date): Date {
  return value instanceof Date ? value : new Date(value);
}

function diffDays(from: Date, to: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  const utc1 = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const utc2 = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.ceil((utc2 - utc1) / msPerDay);
}

export class CommitmentNoteService {
  async create(dto: CommitmentNoteCreateDTO, userRole: RoleEnum) {
    try {
      if (userRole !== RoleEnum.ADMIN) {
        throw new SystemError("Apenas administradores podem cadastrar notas de empenho");
      }

      if (!dto.supplierId) throw new SystemError("Fornecedor (supplierId) é obrigatório");
      if (!dto.numeroNota) throw new SystemError("Número da nota de empenho é obrigatório");
      if (dto.valor === undefined || dto.valor === null) throw new SystemError("Valor é obrigatório");
      if (!dto.dataNota) throw new SystemError("Data da nota de empenho é obrigatória");
      if (!dto.ug) throw new SystemError("UG é obrigatória");
      if (!dto.razaoSocial) throw new SystemError("Razão social é obrigatória");
      if (!dto.cnpj) throw new SystemError("CNPJ é obrigatório");

      const now = new Date();
      const dataPrevistaEntrega = dto.dataPrevistaEntrega ? toDate(dto.dataPrevistaEntrega) : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const diasParaEntrega = diffDays(now, dataPrevistaEntrega);

      const entityData = {
        supplierId: dto.supplierId,
        valor: dto.valor,
        numeroNota: dto.numeroNota,
        dataNota: toDate(dto.dataNota),
        ug: dto.ug,
        razaoSocial: dto.razaoSocial,
        cnpj: dto.cnpj,
        nomeResponsavelExtraido: dto.nomeResponsavelExtraido,
        nomeResponsavelManual: dto.nomeResponsavelManual,
        nomeResponsavelManualOverride: !!(dto.nomeResponsavelManual && dto.nomeResponsavelManual.trim().length > 0),
        cargoResponsavel: dto.cargoResponsavel,
        frequenciaCobrancaDias: dto.frequenciaCobrancaDias ?? 15,
        urgencia: dto.urgencia,
        dataPrevistaEntrega,
        diasRestantesEntrega: diasParaEntrega > 0 ? diasParaEntrega : 0,
        diasAtraso: diasParaEntrega < 0 ? Math.abs(diasParaEntrega) : 0,
        atrasado: diasParaEntrega < 0,
        isActive: true,
      };

      const created = await repository.create(entityData);
      try {
        await emailService.sendEntrada(created);
      } catch (e) {
        console.warn("Falha ao disparar e-mail de entrada de NE:", e);
      }
      return created;
    } catch (error) {
      console.error("Erro no serviço de Nota de Empenho (create):", error);
      throw error;
    }
  }

  async listAll() {
    try {
      return await repository.listAll();
    } catch (error) {
      console.error("Erro ao listar notas de empenho:", error);
      throw error;
    }
  }

  async getById(id: string) {
    try {
      return await repository.getById(id);
    } catch (error) {
      console.error("Erro ao buscar nota de empenho por ID:", error);
      throw error;
    }
  }

  async update(id: string, dto: CommitmentNoteUpdateDTO, userRole: RoleEnum) {
    try {
      if (userRole !== RoleEnum.ADMIN) {
        throw new SystemError("Apenas administradores podem atualizar notas de empenho");
      }

      // Bloquear edição de campos extraídos da nota que alimentam e-mail
      const forbiddenKeys: (keyof CommitmentNoteUpdateDTO)[] = [
        'supplierId', 'valor', 'numeroNota', 'dataNota', 'ug', 'razaoSocial', 'cnpj', 'nomeResponsavelExtraido'
      ];
      const attemptedForbidden = forbiddenKeys.filter((k) => (dto as any)[k] !== undefined);
      if (attemptedForbidden.length > 0) {
        throw new SystemError(
          `Os campos ${attemptedForbidden.join(', ')} não são editáveis (extraídos da nota e usados no e-mail).`
        );
      }

      const dataPrevistaEntrega = dto.dataPrevistaEntrega ? toDate(dto.dataPrevistaEntrega) : undefined;
      const now = new Date();
      let diasRestantesEntrega: number | undefined = undefined;
      let diasAtraso: number | undefined = undefined;
      let atrasado: boolean | undefined = undefined;

      if (dataPrevistaEntrega) {
        const diasParaEntrega = diffDays(now, dataPrevistaEntrega);
        diasRestantesEntrega = diasParaEntrega > 0 ? diasParaEntrega : 0;
        diasAtraso = diasParaEntrega < 0 ? Math.abs(diasParaEntrega) : 0;
        atrasado = diasParaEntrega < 0;
      }

      const overrideFlag = dto.nomeResponsavelManual !== undefined
        ? !!(dto.nomeResponsavelManual && dto.nomeResponsavelManual.trim().length > 0)
        : undefined;

      // Whitelist de campos permitidos para edição
      return await repository.update(id, {
        nomeResponsavelManual: dto.nomeResponsavelManual ?? undefined,
        nomeResponsavelManualOverride: overrideFlag ?? undefined,
        cargoResponsavel: dto.cargoResponsavel ?? undefined,
        frequenciaCobrancaDias: dto.frequenciaCobrancaDias ?? undefined,
        urgencia: dto.urgencia ?? undefined,
        dataPrevistaEntrega,
        diasRestantesEntrega,
        diasAtraso,
        atrasado,
        isActive: dto.isActive ?? undefined,
      });
    } catch (error) {
      console.error("Erro ao atualizar nota de empenho:", error);
      throw error;
    }
  }

  async updateAdminFields(id: string, dto: CommitmentNoteAdminUpdateDTO, userRole: RoleEnum) {
    try {
      if (userRole !== RoleEnum.ADMIN) {
        throw new SystemError("Apenas administradores podem editar campos administrativos da nota de empenho");
      }
      return await repository.update(id, {
        processoAdm: dto.processoAdm ?? undefined,
        materialRecebido: dto.materialRecebido ?? undefined,
        nfEntregueNoAlmox: dto.nfEntregueNoAlmox ?? undefined,
        justificativaMais60Dias: dto.justificativaMais60Dias ?? undefined,
        enviadoParaLiquidar: dto.enviadoParaLiquidar ?? undefined,
      });
    } catch (error) {
      console.error("Erro ao atualizar campos administrativos da nota de empenho:", error);
      throw error;
    }
  }

  async finalize(id: string, userRole: RoleEnum) {
    try {
      if (userRole !== RoleEnum.ADMIN) {
        throw new SystemError("Apenas administradores podem finalizar notas de empenho");
      }
      const current = await repository.getById(id);
      if (current.finalizada) {
        throw new SystemError("Nota de empenho já está finalizada");
      }
      const updated = await repository.update(id, {
        finalizada: true,
        dataFinalizacao: new Date(),
      });
      try {
        await emailService.sendFinalizacao(updated);
      } catch (e) {
        console.warn("Falha ao disparar e-mail de finalização de NE:", e);
      }
      return updated;
    } catch (error) {
      console.error("Erro ao finalizar nota de empenho:", error);
      throw error;
    }
  }

  async delete(id: string, userRole: RoleEnum) {
    try {
      if (userRole !== RoleEnum.ADMIN) {
        throw new SystemError("Apenas administradores podem excluir notas de empenho");
      }
      await repository.delete(id);
      return { success: true, message: "Nota de Empenho removida com sucesso" };
    } catch (error) {
      console.error("Erro ao excluir nota de empenho:", error);
      throw error;
    }
  }
}