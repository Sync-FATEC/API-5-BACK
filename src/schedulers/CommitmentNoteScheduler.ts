import { AppDataSource } from '../database/data-source';
import { CommitmentNote } from '../database/entities/CommitmentNote';
import { EmailLog } from '../database/entities/EmailLog';
import { EmailType } from '../database/enums/EmailType';
import { CommitmentNoteEmailService } from '../services/CommitmentNoteEmailService';

export class CommitmentNoteScheduler {
  private interval: NodeJS.Timeout | null = null;
  private emailService = new CommitmentNoteEmailService();

  startScheduler(intervalMinutes: number = 60): void {
    const intervalMs = intervalMinutes * 60 * 1000;
    this.runOnce();
    this.interval = setInterval(() => this.runOnce(), intervalMs);
    console.log(`Scheduler de NE iniciado a cada ${intervalMinutes} minutos`);
  }

  stopScheduler(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      console.log('Scheduler de NE parado');
    }
  }

  private async runOnce(): Promise<void> {
    try {
      const repoNote = AppDataSource.getRepository(CommitmentNote);
      const repoLog = AppDataSource.getRepository(EmailLog);
      const notes = await repoNote.find({ where: { finalizada: false, isActive: true } });
      for (const note of notes) {
        const logs = await repoLog.find({ where: { commitmentNoteId: note.id, tipo: EmailType.COBRANCA } });
        const last = logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
        const freqDays = note.frequenciaCobrancaDias || 15;
        const now = new Date();
        const baseDate = last ? new Date(last.createdAt) : new Date(note.createdAt);
        const nextDate = new Date(baseDate.getTime() + freqDays * 24 * 60 * 60 * 1000);
        const shouldSend = now >= nextDate && (note.atrasado || note.diasRestantesEntrega <= 0);
        if (!shouldSend) continue;
        const tentativa = (last?.tentativa || 0) + 1;
        const maxRetries = Number(process.env.NE_REMINDER_MAX_RETRIES || 5);
        if (tentativa > maxRetries) continue;
        const historico = logs.map(l => `${l.createdAt.toISOString()} - ${l.status}`).join('<br/>');
        try {
          await this.emailService.sendCobranca(note, historico, tentativa);
        } catch (e) {
          console.warn('Falha no disparo de cobrança de NE:', e);
        }
      }
    } catch (error) {
      console.error('Erro no scheduler de NE:', error);
    }
  }
}