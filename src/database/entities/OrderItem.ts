import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Order } from './Order';
import { Merchandise } from './Merchandise';

@Entity()
export class OrderItem {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    quantity!: number;

    @ManyToOne(() => Order, order => order.orderItems)
    order!: Order;

    @ManyToOne(() => Merchandise, merchandise => merchandise.orderItems)
    merchandise!: Merchandise;
}
