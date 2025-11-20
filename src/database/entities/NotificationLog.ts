import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum NotificationChannel {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
}

export enum NotificationEvent {
  SCHEDULED = 'SCHEDULED',
  REMINDER = 'REMINDER',
  COMPLETED = 'COMPLETED',
  READY = 'READY',
  CANCELED = 'CANCELED',
}

@Entity()
export class NotificationLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: true })
  appointmentId?: string;

  @Column({ type: 'varchar', length: 255 })
  recipient!: string;

  @Column({ type: 'varchar', length: 255 })
  subject!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'enum', enum: NotificationChannel })
  channel!: NotificationChannel;

  @Column({ type: 'enum', enum: NotificationEvent })
  event!: NotificationEvent;

  @Column({ type: 'boolean', default: false })
  success!: boolean;

  @Column({ type: 'text', nullable: true })
  errorMessage?: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;
}