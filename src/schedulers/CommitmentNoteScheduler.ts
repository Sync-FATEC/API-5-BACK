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
      console.log('Verificando NEs para cobrança por atraso...');
      const repoNote = AppDataSource.getRepository(CommitmentNote);
      const repoLog = AppDataSource.getRepository(EmailLog);
      const notes = await repoNote.find({ where: { finalizada: false, isActive: true } });
      for (const note of notes) {
        const logs = await repoLog.find({ where: { commitmentNoteId: note.id, tipo: EmailType.COBRANCA } });
        const last = logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
        const freqDays = note.frequenciaCobrancaDias ?? 15;
        const now = new Date();
        const utcNow = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
        const dpeRaw: any = (note as any).dataPrevistaEntrega;
        let dpe: Date;
        if (dpeRaw instanceof Date) {
          dpe = dpeRaw as Date;
        } else {
          const s = String(dpeRaw);
          const m = s.match(/^([0-9]{4})-([0-9]{2})-([0-9]{2})$/);
          if (m) {
            const y = Number(m[1]);
            const mo = Number(m[2]) - 1;
            const d = Number(m[3]);
            dpe = new Date(y, mo, d);
          } else {
            dpe = new Date(s);
          }
        }
        if (isNaN(dpe.getTime())) {
          console.warn(`NE ${note.numeroNota}: dataPrevistaEntrega inválida, pulando cobrança`);
          continue;
        }
        const baseDate = last ? new Date(last.createdAt) : dpe;
        const nextDate = new Date(baseDate.getTime() + freqDays * 24 * 60 * 60 * 1000);
        const utcDpe = Date.UTC(dpe.getFullYear(), dpe.getMonth(), dpe.getDate());
        const daysRemainingNow = Math.ceil((utcDpe - utcNow) / (24 * 60 * 60 * 1000));
        const isDelayedNow = daysRemainingNow < 0;
        const shouldSendPeriodic = now >= nextDate && (isDelayedNow || daysRemainingNow <= 0);
        const hasLogs = !!last;
        const shouldSendImmediate = !hasLogs && isDelayedNow; // primeira cobrança imediata ao ficar atrasada
        if (!shouldSendPeriodic && !shouldSendImmediate) continue;
        const tentativa = (last?.tentativa || 0) + 1;
        const maxRetries = Number(process.env.NE_REMINDER_MAX_RETRIES || 5);
        if (tentativa > maxRetries) continue;
        const historico = logs.map(l => `${l.createdAt.toISOString()} - ${l.status}`).join('<br/>');
        console.log(`NE ${note.numeroNota}: cobranca tentativa ${tentativa} (freq=${freqDays}d, proxima=${nextDate.toISOString()}, atrasado_now=${isDelayedNow}, diasRestantes_now=${daysRemainingNow})`);
        try {
          await this.emailService.sendCobranca(note, historico, tentativa);
        } catch (e) {
          console.warn('Falha no disparo de cobrança de NE:', e);
        }
      }
      console.log('Verificação de NEs para cobrança concluída');
    } catch (error) {
      console.error('Erro no scheduler de NE:', error);
    }
  }
}