import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Merchandise } from './Merchandise';
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

    @Column()
    controlled!: boolean;

    @Column({ type: 'enum', enum: MerchandiseGroup })
    group!: MerchandiseGroup;

    @Column()
    minimumStock!: number;

    @OneToMany(() => Merchandise, merchandise => merchandise.type)
    merchandises!: Merchandise[];
}
