import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { UserStock } from './UserStock';
import { Merchandise } from './Merchandise';

@Entity()
export class Stock {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    name!: string;

    @Column()
    location!: string;

    @OneToMany(() => UserStock, userStock => userStock.stock)
    userStocks!: UserStock[];

    @OneToMany(() => Merchandise, merchandise => merchandise.stock)
    merchandises!: Merchandise[];
}
