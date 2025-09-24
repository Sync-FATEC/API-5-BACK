import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Order } from './Order';
import { Merchandise } from './Merchandise';
import { MerchandiseType } from './MerchandiseType';

@Entity()
export class OrderItem {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    quantity!: number;

    @ManyToOne(() => Order, order => order.orderItems)
    order!: Order;

    @ManyToOne(() => MerchandiseType, merchandise => merchandise.orderItems)
    merchandise!: MerchandiseType;
}
