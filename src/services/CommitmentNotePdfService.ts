import PDFDocument from 'pdfkit';
import { CommitmentNote } from '../database/entities/CommitmentNote';

export class CommitmentNotePdfService {
  async generateCommitmentNotePdf(note: CommitmentNote): Promise<Buffer> {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    return new Promise<Buffer>((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.fontSize(18).text('Nota de Empenho', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Número: ${note.numeroNota}`);
      doc.text(`Data da NE: ${new Date(note.dataNota).toLocaleDateString()}`);
      doc.text(`UG: ${note.ug}`);
      doc.text(`Fornecedor: ${note.razaoSocial}`);
      doc.text(`CNPJ: ${note.cnpj}`);
      const respNome = note.nomeResponsavelManual && note.nomeResponsavelManual.trim().length > 0 && note.nomeResponsavelManualOverride ? note.nomeResponsavelManual : (note.nomeResponsavelExtraido || note.supplier?.nomeResponsavel || '');
      const respCargo = note.cargoResponsavel || note.supplier?.cargoResponsavel || '';
      doc.text(`Responsável: ${respNome}`);
      doc.text(`Cargo: ${respCargo}`);
      doc.text(`Valor: ${note.valor}`);
      doc.text(`Data Prevista Entrega: ${new Date(note.dataPrevistaEntrega).toLocaleDateString()}`);
      doc.text(`Atrasado: ${note.atrasado ? 'Sim' : 'Não'}`);
      doc.end();
    });
  }

  async generateFinalizationReceipt(note: CommitmentNote): Promise<Buffer> {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    return new Promise<Buffer>((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.fontSize(18).text('Comprovante de Encerramento de NE', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`NE: ${note.numeroNota}`);
      doc.text(`Fornecedor: ${note.razaoSocial}`);
      doc.text(`CNPJ: ${note.cnpj}`);
      doc.text(`UG: ${note.ug}`);
      doc.text(`Data de Finalização: ${note.dataFinalizacao ? new Date(note.dataFinalizacao).toLocaleString() : ''}`);
      doc.text(`Processo Adm: ${note.processoAdm ? 'Sim' : 'Não'}`);
      doc.text(`Material Recebido: ${note.materialRecebido ? 'Sim' : 'Não'}`);
      doc.text(`NF no Almoxarifado: ${note.nfEntregueNoAlmox ? 'Sim' : 'Não'}`);
      if (note.justificativaMais60Dias) doc.text(`Justificativa >60 dias: ${note.justificativaMais60Dias}`);
      doc.text(`Enviado para liquidar: ${note.enviadoParaLiquidar ? 'Sim' : 'Não'}`);
      doc.end();
    });
  }
}