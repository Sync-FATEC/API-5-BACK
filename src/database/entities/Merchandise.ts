import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Batch } from './Batch';
import { MerchandiseType } from './MerchandiseType';
import { Stock } from './Stock';
import { OrderItem } from './OrderItem';

export enum MerchandiseStatus {
    AVAILABLE = 'AVAILABLE',
    RESERVED = 'RESERVED',
    OUT_OF_STOCK = 'OUT_OF_STOCK',
}

@Entity()
export class Merchandise {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    batchId!: string;

    @Column()
    typeId!: string;

    @Column()
    quantity!: number;

    @Column({ type: 'enum', enum: MerchandiseStatus })
    status!: MerchandiseStatus;

    @ManyToOne(() => Batch, batch => batch.merchandises)
    batch!: Batch;

    @ManyToOne(() => MerchandiseType, type => type.merchandises)
    type!: MerchandiseType;

    @ManyToOne(() => Stock, stock => stock.merchandises)
    stock!: Stock;
}
