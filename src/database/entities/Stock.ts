import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { UserStock } from './UserStock';
import { Merchandise } from './Merchandise';
import { Order } from './Order';

@Entity()
export class Stock {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    name!: string;

    @Column()
    location!: string;

    @Column({ default: true })
    active!: boolean;

    @OneToMany(() => UserStock, userStock => userStock.stock)
    userStocks!: UserStock[];

    @OneToMany(() => Merchandise, merchandise => merchandise.stock)
    merchandises!: Merchandise[];

    @OneToMany(() => Order, order => order.stock)
    orders!: Order[];
}
