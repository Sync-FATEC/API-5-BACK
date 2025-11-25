import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { EmailTemplate } from "./EmailTemplate";

@Entity()
export class EmailTemplateVersion {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  templateId!: string;

  @ManyToOne(() => EmailTemplate, t => t.versions, { onDelete: 'CASCADE' })
  template!: EmailTemplate;

  @Column({ type: 'varchar', length: 255 })
  subject!: string;

  @Column({ type: 'text' })
  html!: string;

  @Column({ type: 'int' })
  version!: number;

  @Column({ type: 'boolean', default: false })
  autosave!: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;
}