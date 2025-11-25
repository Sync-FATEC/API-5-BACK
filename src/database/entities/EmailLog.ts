import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CommitmentNote } from './CommitmentNote';
import { Supplier } from './Supplier';
import { EmailType } from '../enums/EmailType';

@Entity()
export class EmailLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => CommitmentNote, { eager: true })
  commitmentNote!: CommitmentNote;

  @Column({ type: 'uuid' })
  commitmentNoteId!: string;

  @ManyToOne(() => Supplier, { eager: true })
  supplier!: Supplier;

  @Column({ type: 'uuid' })
  supplierId!: string;

  @Column({ type: 'varchar', length: 20 })
  tipo!: EmailType;

  @Column({ type: 'text' })
  to!: string;

  @Column({ type: 'text', nullable: true })
  cc?: string;

  @Column({ type: 'varchar', length: 20 })
  status!: string;

  @Column({ type: 'text', nullable: true })
  motivoErro?: string;

  @Column({ type: 'int', default: 1 })
  tentativa!: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  messageId?: string;

  @Column({ type: 'varchar', length: 128 })
  contentHash!: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;
}