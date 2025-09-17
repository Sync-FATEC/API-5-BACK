import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './User';
import { Stock } from './Stock';
import { StockResponsibility } from '../enums/StockResponsability';



@Entity()
export class UserStock {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    userId!: string;

    @Column()
    stockId!: string;

    @Column({ type: 'enum', enum: StockResponsibility })
    responsibility!: StockResponsibility;

    @ManyToOne(() => User, user => user.userStocks)
    user!: User;

    @ManyToOne(() => Stock, stock => stock.userStocks)
    stock!: Stock;
}
