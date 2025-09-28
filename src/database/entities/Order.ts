import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm';
import { OrderItem } from './OrderItem';
import { Section } from './Section';
import { Stock } from './Stock';

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

    @OneToMany(() => OrderItem, orderItem => orderItem.order, { cascade: true })
    orderItems!: OrderItem[];

    @ManyToOne(() => Section, section => section.orders)
    section!: Section;

    @ManyToOne(() => Stock, stock => stock.orders)
    stock!: Stock;

    @Column({ default: true })
    isActive!: boolean
}
