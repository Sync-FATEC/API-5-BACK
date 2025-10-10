import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm';
import { Merchandise } from './Merchandise';
import { OrderItem } from './OrderItem';
import { Stock } from './Stock';
import { MerchandiseType } from './MerchandiseType';
import { User } from './User';

@Entity()
export class LogMerchandiseType {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    fieldModifed!: string;

    @Column()
    oldValue?: string;

    @Column()
    newValue?: string;

    @Column()
    justification?: string;

    @ManyToOne(() => User, user => user.logs)
    user!: User;

    @ManyToOne(() => MerchandiseType, type => type.logs)
    merchandiseType!: MerchandiseType;
}
