import { spawn } from 'child_process';
import path from 'path';
import { CommitmentNoteRepository } from '../repository/CommitmentNoteRepository';

type ForecastResult = {
  labels: string[];
  predictions: number[];
};

export class ForecastService {
  private commitmentRepo = new CommitmentNoteRepository();

  async getMonthlySeries(): Promise<number[]> {
    const notes = await this.commitmentRepo.listAll();
    const buckets = new Map<string, number>();
    for (const n of notes) {
      const d = new Date(n.dataNota);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const current = buckets.get(key) ?? 0;
      buckets.set(key, current + Number(n.valor));
    }
    const sortedKeys = Array.from(buckets.keys()).sort();
    const series = sortedKeys.map((k) => buckets.get(k) ?? 0);
    return series;
  }

  async forecastNextMonths(months = 6): Promise<ForecastResult> {
    const series = await this.getMonthlySeries();
    let inputSeries = series;
    if (series.length < 12) {
      if (series.length === 0) {
        // Sem dados: retornar labels com previsões zeradas
        const start = new Date();
        const labels: string[] = [];
        const preds: number[] = [];
        let year = start.getFullYear();
        let month = start.getMonth() + 1;
        for (let i = 1; i <= months; i++) {
          const m = month + i;
          const y = year + Math.floor((m - 1) / 12);
          const mm = ((m - 1) % 12) + 1;
          labels.push(`${String(mm).padStart(2, '0')}/${y}`);
          preds.push(0);
        }
        return { labels, predictions: preds };
      }
      // Pad à esquerda com o primeiro valor conhecido para completar 12
      const first = series[0];
      const padCount = 12 - series.length;
      inputSeries = Array(padCount).fill(first).concat(series);
    }

    const root = path.resolve(__dirname, '../../..');
    const scriptPath = path.join('predict_balance_forecast.py');

    const payload = JSON.stringify({ series: inputSeries, months });

    const python = spawn('python', [scriptPath]);
    return new Promise<ForecastResult>((resolve, reject) => {
      let stdout = '';
      let stderr = '';
      python.stdout.on('data', (data) => (stdout += data.toString()))
      python.stderr.on('data', (data) => (stderr += data.toString()))
      python.on('error', (err) => reject(err));
      python.on('close', (code) => {
        if (code !== 0) {
          return reject(new Error(stderr || `Script de previsão saiu com código ${code}`));
        }
        try {
          const parsed = JSON.parse(stdout);
          resolve({ labels: parsed.labels, predictions: parsed.predictions });
        } catch (e) {
          reject(new Error(`Falha ao parsear saída da previsão: ${e}`));
        }
      });
      python.stdin.write(payload);
      python.stdin.end();
    });
  }
}