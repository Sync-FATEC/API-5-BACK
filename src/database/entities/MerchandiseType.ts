import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm';
import { Merchandise } from './Merchandise';
import { OrderItem } from './OrderItem';
import { Stock } from './Stock';
import { MerchandiseGroup } from '../enums/MerchandiseGroup';

@Entity()
export class MerchandiseType {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    name!: string;

    @Column()
    recordNumber!: string;

    @Column()
    unitOfMeasure!: string;

    @Column({ default: 0 })
    quantityTotal!: number;

    @Column()
    controlled!: boolean;

    @Column()
    minimumStock!: number;

    @Column({ type: 'enum', enum: MerchandiseGroup, nullable: true, default: MerchandiseGroup.EXPEDIENTE })
    group!: MerchandiseGroup | null;

    @Column()
    stockId!: string;

    @ManyToOne(() => Stock, stock => stock.merchandiseTypes)
    stock!: Stock;

    @OneToMany(() => Merchandise, merchandise => merchandise.type)
    merchandises!: Merchandise[];

    @OneToMany(() => OrderItem, orderItem => orderItem.merchandiseType)
    orderItems!: OrderItem[];
}
