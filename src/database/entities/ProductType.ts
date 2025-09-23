import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { Product } from "./Product";

@Entity("TIPO_MERCADORIA")
export class ProductType {
    @PrimaryGeneratedColumn("uuid")
    id!: string

    @Column({ type: 'varchar', length: 255 })
    name!: string

    @Column({ type: 'varchar', length: 255 })
    numeroFichas!: string

    @Column({ type: 'varchar', length: 50 })
    unidadeMedida!: string

    @Column({ type: 'boolean', default: false })
    controlada!: boolean

    @Column({ type: 'int' })
    estoqueMinimo!: number

    @Column({ type: 'text', nullable: true })
    description?: string

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    createdAt!: Date

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    updatedAt!: Date

    @Column({ type: "boolean", default: true })
    isActive!: boolean

    // Relacionamento: Um tipo de produto pode ter muitos produtos
    @OneToMany(() => Product, product => product.productType)
    products!: Product[]
}
