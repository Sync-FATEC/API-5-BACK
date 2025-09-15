import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { OrderItem } from './OrderItem';

@Entity()
export class Order {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'date' })
    creationDate!: Date;

    @Column({ type: 'date', nullable: true })
    withdrawalDate!: Date;

    @Column()
    status!: string;

    @OneToMany(() => OrderItem, orderItem => orderItem.order)
    orderItems!: OrderItem[];
}
