import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Product {
    @PrimaryGeneratedColumn("uuid")
    id!: string

    @Column({ type: 'varchar', length: 255 })
    name!: string

    @Column({ type: 'varchar', length: 255 })
    fichNumber!: string

    @Column({ type: 'int' })
    quantity!: number

    @Column({ type: 'int' })
    minimumStock!: number

    @Column({ type: 'varchar', length: 50 })
    unitOfMeasure!: string

    @Column({ type: 'varchar', length: 100 })
    group!: string

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    createdAt!: Date

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    updatedAt!: Date

    @Column({ type: "boolean", default: true })
    isActive!: boolean
}
