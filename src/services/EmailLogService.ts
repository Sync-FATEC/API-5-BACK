import crypto from 'crypto';
import { EmailType } from '../database/enums/EmailType';
import { EmailLogRepository } from '../repository/EmailLogRepository';

const repo = new EmailLogRepository();

export class EmailLogService {
  static makeHash(subject: string, body: string, attachments: Array<{ filename: string; content: Buffer | string }> = []): string {
    const h = crypto.createHash('sha256');
    h.update(subject);
    h.update(body);
    for (const a of attachments) {
      const buf = typeof a.content === 'string' ? Buffer.from(a.content) : a.content;
      h.update(buf);
    }
    return h.digest('hex');
  }

  async log(params: {
    commitmentNoteId: string;
    supplierId: string;
    tipo: EmailType;
    to: string;
    cc?: string;
    status: 'sucesso' | 'falha';
    motivoErro?: string;
    tentativa: number;
    messageId?: string;
    contentHash: string;
  }) {
    return repo.create({
      commitmentNoteId: params.commitmentNoteId,
      supplierId: params.supplierId,
      tipo: params.tipo,
      to: params.to,
      cc: params.cc,
      status: params.status,
      motivoErro: params.motivoErro,
      tentativa: params.tentativa,
      messageId: params.messageId,
      contentHash: params.contentHash,
    });
  }
}