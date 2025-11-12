import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Supplier } from './Supplier';

@Entity()
export class CommitmentNote {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Supplier, { eager: true })
  supplier!: Supplier;

  @Column({ type: 'uuid' })
  supplierId!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  valor!: number;

  @Column({ type: 'varchar', length: 255 })
  numeroNota!: string;

  @Column({ type: 'date' })
  dataNota!: Date;

  @Column({ type: 'varchar', length: 50 })
  ug!: string;

  @Column({ type: 'varchar', length: 255 })
  razaoSocial!: string;

  @Column({ type: 'varchar', length: 18 })
  cnpj!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nomeResponsavelExtraido?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nomeResponsavelManual?: string;

  @Column({ type: 'boolean', default: false })
  nomeResponsavelManualOverride!: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  cargoResponsavel?: string;

  @Column({ type: 'int', default: 15 })
  frequenciaCobrancaDias!: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  urgencia?: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ type: 'date' })
  dataPrevistaEntrega!: Date;

  @Column({ type: 'int', default: 0 })
  diasRestantesEntrega!: number;

  @Column({ type: 'int', default: 0 })
  diasAtraso!: number;

  @Column({ type: 'boolean', default: false })
  atrasado!: boolean;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'boolean', default: false })
  processoAdm!: boolean;

  @Column({ type: 'boolean', default: false })
  materialRecebido!: boolean;

  @Column({ type: 'boolean', default: false })
  nfEntregueNoAlmox!: boolean;

  @Column({ type: 'text', nullable: true })
  justificativaMais60Dias?: string;

  @Column({ type: 'boolean', default: false })
  enviadoParaLiquidar!: boolean;

  @Column({ type: 'boolean', default: false })
  finalizada!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  dataFinalizacao?: Date;
}