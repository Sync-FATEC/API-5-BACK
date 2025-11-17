import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ExamType } from "./ExamType";

@Entity()
export class ExamPreparationInstruction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  examTypeId!: string;

  @ManyToOne(() => ExamType, { onDelete: 'CASCADE' })
  examType!: ExamType;

  @Column({ type: 'varchar', length: 255 })
  titulo!: string;

  @Column({ type: 'text' })
  conteudo!: string;

  @Column({ type: 'int', default: 0 })
  ordem!: number;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;
}