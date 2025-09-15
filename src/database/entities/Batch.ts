import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Merchandise } from './Merchandise';

@Entity()
export class Batch {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'date' })
    expirationDate!: Date;

    @OneToMany(() => Merchandise, merchandise => merchandise.batch)
    merchandises!: Merchandise[];
}
