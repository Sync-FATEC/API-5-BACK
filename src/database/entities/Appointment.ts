import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";
import { ExamType } from "./ExamType";
import { AppointmentStatus } from "../enums/AppointmentStatus";

@Entity()
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { eager: true })
  paciente!: User;

  @Column({ type: 'uuid' })
  pacienteId!: string;

  @ManyToOne(() => ExamType, { eager: true })
  examType!: ExamType;

  @Column({ type: 'uuid' })
  examTypeId!: string;

  @Column({ type: 'timestamp' })
  dataHora!: Date;

  // Data/hora para retirada de material (opcional), ex.: exame de fezes
  @Column({ type: 'timestamp', nullable: true })
  dataRetirada?: Date;

  @Column({ type: 'enum', enum: AppointmentStatus, default: AppointmentStatus.AGENDADO })
  status!: AppointmentStatus;

  @Column({ type: 'text', nullable: true })
  observacoes?: string;
}