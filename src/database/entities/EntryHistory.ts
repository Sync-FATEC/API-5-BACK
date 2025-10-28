import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { MerchandiseType } from './MerchandiseType';

@Entity()
export class EntryHistory {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    merchandiseTypeId!: string;

    @ManyToOne(() => MerchandiseType, merchandiseType => merchandiseType.entries)
    merchandiseType!: MerchandiseType;

    @Column()
    quantity!: number;

    @CreateDateColumn()
    entryDate!: Date;

    @Column({ nullable: true })
    observation?: string;
}