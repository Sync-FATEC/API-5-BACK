import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { EmailType } from '../enums/EmailType';

@Entity()
export class EmailTemplate {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 20 })
  type!: EmailType;

  @Column({ type: 'varchar', length: 255 })
  subject!: string;

  @Column({ type: 'text' })
  html!: string;

  @Column({ type: 'text', nullable: true })
  footer?: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;
}