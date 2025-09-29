import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Order } from './Order';
import { MerchandiseType } from './MerchandiseType';

@Entity()
export class OrderItem {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    quantity!: number;

    @ManyToOne(() => Order, order => order.orderItems)
    order!: Order;

    // Relacionamento para o tipo de mercadoria (não deletar itens automaticamente se o tipo for removido)
    @ManyToOne(() => MerchandiseType, merchandiseType => merchandiseType.orderItems, { onDelete: 'RESTRICT' })
    merchandiseType!: MerchandiseType;
}
