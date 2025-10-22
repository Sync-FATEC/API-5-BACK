import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Supplier {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 255 })
    razaoSocial!: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    nomeResponsavel?: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    cargoResponsavel?: string;

    @Column({ type: 'varchar', length: 18, unique: true })
    cnpj!: string;

    @Column({ type: 'varchar', length: 255 })
    emailPrimario!: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    emailSecundario?: string;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    createdAt!: Date;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
    updatedAt!: Date;

    @Column({ type: "boolean", default: true })
    isActive!: boolean;
}
