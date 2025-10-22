import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { UserStock } from "./UserStock";
import { RoleEnum } from "../enums/RoleEnum";
import { LogMerchandiseType } from "./LogMerchandiseType";

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 255, unique: true })
    email!: string;

    @Column({ type: 'varchar', length: 255 })
    name!: string;

    @Column({ type: 'varchar', length: 255 })
    firebaseUid!: string;

    @Column({ type: "enum", enum: RoleEnum, default: RoleEnum.SOLDADO })
    role!: RoleEnum;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    createdAt!: Date;

    @Column({ type: "timestamp", default: () => "now() + interval '1 year'" })
    validUntil!: Date;


    @Column({ type: "boolean", default: true })
    isActive!: boolean;

    @OneToMany(() => UserStock, userStock => userStock.user)
    userStocks!: UserStock[];

    @OneToMany(() => LogMerchandiseType, log => log.user)
    logs!: LogMerchandiseType[];
}