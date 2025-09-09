import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { RoleEnum } from "../enums/RoleEnum";

@Entity()
export class Users {
    @PrimaryGeneratedColumn("uuid")
    id!: string

    @Column({ type: 'varchar', length: 255, unique: true })
    email!: string

    @Column({ type: 'varchar', length: 255 })
    name!: string

    @Column({ type: 'varchar', length: 255 })
    firebaseUid!: string

    @Column({ type: "enum", enum: RoleEnum, default: RoleEnum.SOLDADO })
    role!: RoleEnum

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    createdAt!: Date

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP + interval '1 year'" })
    validUntil!: Date

    @Column({ type: "boolean", default: true })
    isActive!: boolean
}