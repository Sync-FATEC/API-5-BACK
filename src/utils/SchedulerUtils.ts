export class SchedulerUtils {
  // Clínica funciona de segunda a sexta, 08:00 às 18:00
  static isWithinClinicHours(date: Date): boolean {
    const day = date.getDay(); // 0-domingo, 6-sábado
    if (day === 0 || day === 6) return false;
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const time = hours * 60 + minutes;
    const start = 8 * 60; // 08:00
    const end = 18 * 60; // 18:00
    return time >= start && time < end;
  }

  static addMinutes(date: Date, minutes: number): Date {
    return new Date(date.getTime() + minutes * 60000);
  }

  static overlaps(startA: Date, endA: Date, startB: Date, endB: Date): boolean {
    return startA < endB && startB < endA;
  }
}