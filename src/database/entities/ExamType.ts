import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ExamType {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  nome!: string;

  @Column({ type: 'text', nullable: true })
  descricao?: string;

  // duração em minutos
  @Column({ type: 'int' })
  duracaoEstimada!: number;

  @Column({ type: 'text', nullable: true })
  preparoNecessario?: string;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;
}