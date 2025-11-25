export class SchedulerUtils {
  // Aceita qualquer horário e qualquer dia da semana
  static isWithinClinicHours(date: Date): boolean {
    return true; // Sem restrições de horário ou dia
  }

  static addMinutes(date: Date, minutes: number): Date {
    return new Date(date.getTime() + minutes * 60000);
  }

  static overlaps(startA: Date, endA: Date, startB: Date, endB: Date): boolean {
    return startA < endB && startB < endA;
  }
}