import PDFDocument from 'pdfkit';
import { Appointment } from '../database/entities/Appointment';
import { RoleEnum } from '../database/enums/RoleEnum';

export class PdfService {
  async generateAppointmentReceipt(appointment: Appointment): Promise<Buffer> {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    return new Promise<Buffer>((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      doc.fontSize(18).text('Comprovante de Agendamento', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Agendamento ID: ${appointment.id}`);
      doc.text(`Paciente: ${appointment.paciente?.name || appointment.pacienteId}`);
      doc.text(`E-mail: ${appointment.paciente?.email || ''}`);
      doc.text(`Tipo de Exame: ${appointment.examType?.nome || appointment.examTypeId}`);
      doc.text(`Data/Hora: ${new Date(appointment.dataHora).toLocaleString()}`);
      doc.text(`Status: ${appointment.status}`);
      if (appointment.observacoes) {
        doc.moveDown().text(`Observações: ${appointment.observacoes}`);
      }

      doc.end();
    });
  }
}