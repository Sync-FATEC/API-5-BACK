import { CommitmentNote } from '../database/entities/CommitmentNote';
import { NotificationService } from './NotificationService';
import { EmailLogService } from './EmailLogService';
import { EmailTemplateRepository } from '../repository/EmailTemplateRepository';
import { EmailTemplateService } from './EmailTemplateService';
import { EmailType } from '../database/enums/EmailType';
import { CommitmentNotePdfService } from './CommitmentNotePdfService';
import { Supplier } from '../database/entities/Supplier';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const notifier = new NotificationService();
const logger = new EmailLogService();
const templates = new EmailTemplateRepository();
const pdfService = new CommitmentNotePdfService();
const templateService = new EmailTemplateService();

function pickResponsavel(note: CommitmentNote): { nome: string; cargo: string } {
  const nome = note.nomeResponsavelManual && note.nomeResponsavelManual.trim().length > 0 && note.nomeResponsavelManualOverride
    ? note.nomeResponsavelManual
    : (note.nomeResponsavelExtraido || note.supplier?.nomeResponsavel || '');
  const cargo = note.cargoResponsavel || note.supplier?.cargoResponsavel || '';
  return { nome, cargo };
}

function ensureSupplierEmails(supplier?: Supplier): { primary: string; secondary?: string } {
  if (!supplier) throw new Error('Fornecedor não carregado na NE');
  if (!supplier.emailPrimario) throw new Error('Fornecedor sem e-mail primário');
  return { primary: supplier.emailPrimario, secondary: supplier.emailSecundario || undefined };
}

function renderTemplate(html: string, data: Record<string, string>): string {
  return html.replace(/\{\{(\w+)\}\}/g, (_, k) => data[k] ?? '');
}

function ensureRequiredFields(note: CommitmentNote): void {
  const { nome, cargo } = pickResponsavel(note);
  if (!note.numeroNota) throw new Error('Número da NE obrigatório');
  if (!note.dataNota) throw new Error('Data da NE obrigatória');
  if (!note.ug) throw new Error('UG obrigatória');
  if (!note.razaoSocial) throw new Error('Razão Social obrigatória');
  if (!note.cnpj) throw new Error('CNPJ obrigatório');
  if (!nome || nome.trim().length === 0) throw new Error('Nome do responsável obrigatório');
  if (!cargo || cargo.trim().length === 0) throw new Error('Cargo do responsável obrigatório');
}

export class CommitmentNoteEmailService {
  async sendEntrada(note: CommitmentNote): Promise<void> {
    ensureRequiredFields(note);
    const emails = ensureSupplierEmails(note.supplier);
    const { nome, cargo } = pickResponsavel(note);
    const tpl = await templates.getByType(EmailType.ENTRADA);
    const subject = tpl?.subject || `Entrada de Nota de Empenho ${note.numeroNota}`;
    const rodape = tpl?.footer || '';
    const vars = {
      NUMERO_NE: note.numeroNota,
      DATA_NE: new Date(note.dataNota).toLocaleDateString(),
      UG: note.ug,
      RAZAO_SOCIAL: note.razaoSocial,
      CNPJ: note.cnpj,
      NOME_RESPONSAVEL: nome,
      CARGO_RESPONSAVEL: cargo,
      DATA_PREVISTA: new Date(note.dataPrevistaEntrega).toLocaleDateString(),
      FREQUENCIA: String(note.frequenciaCobrancaDias ?? 15),
      URGENCIA: note.urgencia || '',
    } as Record<string, string>;
    const rendered = tpl ? await templateService.renderByName(EmailType.ENTRADA, vars as any) : null;
    const html = rendered?.html ?? `
      <p>Prezado fornecedor,</p>
      <p>Foi registrada a Nota de Empenho <strong>${note.numeroNota}</strong>.</p>
      <ul>
        <li>UG: ${note.ug}</li>
        <li>Data: ${new Date(note.dataNota).toLocaleDateString()}</li>
        <li>Razão Social: ${note.razaoSocial}</li>
        <li>CNPJ: ${note.cnpj}</li>
        <li>Responsável: ${nome} (${cargo})</li>
      </ul>
      <p>${rodape}</p>
    `;
    let pdf: Buffer;
    console.log(`\n🔍 DEBUG sendEntrada - NE ${note.numeroNota}`);
    console.log(`   pdfFileUrl: ${note.pdfFileUrl || 'NÃO DEFINIDO'}`);
    console.log(`   pdfFileName: ${note.pdfFileName || 'NÃO DEFINIDO'}`);
    
    if (note.pdfFileUrl) {
      try {
        const filePath = resolve(process.cwd(), note.pdfFileUrl.replace(/^\//, ''));
        console.log(`   Tentando carregar de: ${filePath}`);
        
        if (!existsSync(filePath)) {
          console.error(`   ❌ Arquivo NÃO EXISTE no caminho!`);
          throw new Error(`Arquivo não encontrado: ${filePath}`);
        }
        
        pdf = readFileSync(filePath);
        console.log(`   ✅ PDF enviado carregado com sucesso! Tamanho: ${pdf.length} bytes`);
      } catch (error) {
        console.error(`   ❌ Erro ao carregar PDF enviado:`, error);
        console.warn(`   ⚠️ Gerando PDF automaticamente como fallback...`);
        pdf = await pdfService.generateCommitmentNotePdf(note);
      }
    } else {
      console.log(`   📄 Sem pdfFileUrl - gerando PDF automaticamente`);
      pdf = await pdfService.generateCommitmentNotePdf(note);
    }
    const attachments = [{ filename: note.pdfFileName || `NE-${note.numeroNota}.pdf`, content: pdf, contentType: 'application/pdf' }];
    const contentHash = EmailLogService.makeHash(subject, html, attachments);
    const res = await notifier.sendEmail(emails.primary, subject, html, { html, cc: emails.secondary, attachments });
    await logger.log({
      commitmentNoteId: note.id,
      supplierId: note.supplierId,
      tipo: EmailType.ENTRADA,
      to: emails.primary,
      cc: emails.secondary,
      status: res.success ? 'sucesso' : 'falha',
      motivoErro: res.success ? undefined : res.errorMessage,
      tentativa: 1,
      messageId: res.messageId,
      contentHash,
    });
  }

  async sendCobranca(note: CommitmentNote, historico: string, tentativa: number): Promise<void> {
    ensureRequiredFields(note);
    const emails = ensureSupplierEmails(note.supplier);
    const tpl = await templates.getByType(EmailType.COBRANCA);
    const subject = tpl?.subject || `Cobrança NE ${note.numeroNota}`;
    const rodape = tpl?.footer || '';
    const vars = {
      NUMERO_NE: note.numeroNota,
      UG: note.ug,
      RAZAO_SOCIAL: note.razaoSocial,
      CNPJ: note.cnpj,
      DATA_PREVISTA: new Date(note.dataPrevistaEntrega).toLocaleDateString(),
      FREQUENCIA: String(note.frequenciaCobrancaDias ?? 15),
      URGENCIA: note.urgencia || '',
      NOME_RESPONSAVEL: note.cargoResponsavel ? '' : '',
      CARGO_RESPONSAVEL: note.cargoResponsavel || '',
      HISTORICO_COBRANCAS: historico,
    } as any;
    const rendered = tpl ? await templateService.renderByName(EmailType.COBRANCA, vars as any) : null;
    const htmlBase = rendered?.html || `
      <p>Prezado fornecedor,</p>
      <p>Estamos reforçando a cobrança referente à Nota de Empenho <strong>${note.numeroNota}</strong>.</p>
      <p>Histórico:</p>
      <div>${historico}</div>
      <p>${rodape}</p>
    `;
    const html = htmlBase;
    const contentHash = EmailLogService.makeHash(subject, html);
    const res = await notifier.sendEmail(emails.primary, subject, html, { html, cc: emails.secondary });
    await logger.log({
      commitmentNoteId: note.id,
      supplierId: note.supplierId,
      tipo: EmailType.COBRANCA,
      to: emails.primary,
      cc: emails.secondary,
      status: res.success ? 'sucesso' : 'falha',
      motivoErro: res.success ? undefined : res.errorMessage,
      tentativa,
      messageId: res.messageId,
      contentHash,
    });
  }

  async sendFinalizacao(note: CommitmentNote): Promise<void> {
    ensureRequiredFields(note);
    const emails = ensureSupplierEmails(note.supplier);
    const tpl = await templates.getByType(EmailType.FINALIZACAO);
    const subject = tpl?.subject || `Finalização NE ${note.numeroNota}`;
    const rodape = tpl?.footer || '';
    const resumo = `NE ${note.numeroNota} finalizada em ${note.dataFinalizacao ? new Date(note.dataFinalizacao).toLocaleString() : ''}.`;
    const vars = {
      NUMERO_NE: note.numeroNota,
      RAZAO_SOCIAL: note.razaoSocial,
      CNPJ: note.cnpj,
      DATA_NE: new Date(note.dataNota).toLocaleDateString(),
      UG: note.ug,
    } as any;
    const rendered = tpl ? await templateService.renderByName(EmailType.FINALIZACAO, vars as any) : null;
    const htmlBase = rendered?.html || `
      <p>Prezado fornecedor,</p>
      <p>${resumo}</p>
      <p>${rodape}</p>
    `;
    const html = htmlBase;
    let pdf: Buffer;
    console.log(`\n🔍 DEBUG sendFinalizacao - NE ${note.numeroNota}`);
    console.log(`   pdfFileUrl: ${note.pdfFileUrl || 'NÃO DEFINIDO'}`);
    console.log(`   pdfFileName: ${note.pdfFileName || 'NÃO DEFINIDO'}`);
    
    if (note.pdfFileUrl) {
      try {
        const filePath = resolve(process.cwd(), note.pdfFileUrl.replace(/^\//, ''));
        console.log(`   Tentando carregar de: ${filePath}`);
        
        if (!existsSync(filePath)) {
          console.error(`   ❌ Arquivo NÃO EXISTE no caminho!`);
          throw new Error(`Arquivo não encontrado: ${filePath}`);
        }
        
        pdf = readFileSync(filePath);
        console.log(`   ✅ PDF enviado carregado com sucesso! Tamanho: ${pdf.length} bytes`);
      } catch (error) {
        console.error(`   ❌ Erro ao carregar PDF enviado:`, error);
        console.warn(`   ⚠️ Gerando PDF automaticamente como fallback...`);
        pdf = await pdfService.generateFinalizationReceipt(note);
      }
    } else {
      console.log(`   📄 Sem pdfFileUrl - gerando PDF automaticamente`);
      pdf = await pdfService.generateFinalizationReceipt(note);
    }
    const attachments = [{ filename: note.pdfFileName || `Encerramento-NE-${note.numeroNota}.pdf`, content: pdf, contentType: 'application/pdf' }];
    const contentHash = EmailLogService.makeHash(subject, html, attachments);
    const res = await notifier.sendEmail(emails.primary, subject, html, { html, cc: emails.secondary, attachments });
    await logger.log({
      commitmentNoteId: note.id,
      supplierId: note.supplierId,
      tipo: EmailType.FINALIZACAO,
      to: emails.primary,
      cc: emails.secondary,
      status: res.success ? 'sucesso' : 'falha',
      motivoErro: res.success ? undefined : res.errorMessage,
      tentativa: 1,
      messageId: res.messageId,
      contentHash,
    });
  }
}