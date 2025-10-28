import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm';
import { Merchandise } from './Merchandise';
import { OrderItem } from './OrderItem';
import { Stock } from './Stock';
import { LogMerchandiseType } from './LogMerchandiseType';
import { EntryHistory } from './EntryHistory';
import { MerchandiseTypeType } from '../../types/ProductTypeType';
import { User } from './User';
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

    @Column({ default: 0 })
    entriesTotal!: number;

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

    @OneToMany(() => LogMerchandiseType, log => log.merchandiseType)
    logs!: LogMerchandiseType[];

    @OneToMany(() => EntryHistory, entryHistory => entryHistory.merchandiseType)
    entries!: EntryHistory[];

    generateLogs(changes: Partial<MerchandiseTypeType>, user: User): LogMerchandiseType[] {
        const logs: LogMerchandiseType[] = [];


        // Verificar mudanças no nome
        if (changes.name && this.name !== changes.name) {
            console.log("Mudança detectada no nome:", this.name, "->", changes.name);
            const log = new LogMerchandiseType();
            log.merchandiseType = this;
            log.user = user;
            log.fieldModifed = 'name';
            log.oldValue = this.name;
            log.newValue = changes.name;
            logs.push(log);
        }

        // Verificar mudanças no número de registro
        if (changes.recordNumber && this.recordNumber !== changes.recordNumber) {
            const log = new LogMerchandiseType();
            log.merchandiseType = this;
            log.user = user;
            log.fieldModifed = 'recordNumber';
            log.oldValue = this.recordNumber;
            log.newValue = changes.recordNumber;
            logs.push(log);
        }

        // Verificar mudanças na unidade de medida
        if (changes.unitOfMeasure && this.unitOfMeasure !== changes.unitOfMeasure) {
            const log = new LogMerchandiseType();
            log.merchandiseType = this;
            log.user = user;
            log.fieldModifed = 'unitOfMeasure';
            log.oldValue = this.unitOfMeasure;
            log.newValue = changes.unitOfMeasure;
            logs.push(log);
        }

        // Verificar mudanças no campo controlado
        if (changes.controlled !== undefined && this.controlled !== changes.controlled) {
            const log = new LogMerchandiseType();
            log.merchandiseType = this;
            log.user = user;
            log.fieldModifed = 'controlled';
            log.oldValue = this.controlled.toString();
            log.newValue = changes.controlled.toString();
            logs.push(log);
        }

        // Verificar mudanças no estoque mínimo
        if (changes.minimumStock !== undefined && this.minimumStock !== changes.minimumStock) {
            const log = new LogMerchandiseType();
            log.merchandiseType = this;
            log.user = user;
            log.fieldModifed = 'minimumStock';
            log.oldValue = this.minimumStock.toString();
            log.newValue = changes.minimumStock.toString();
            logs.push(log);
        }

        return logs;
    }

    changeTotalQuantity(amount: number, justification: string, user: User) {
        const log = new LogMerchandiseType();
        log.merchandiseType = this;
        log.fieldModifed = 'quantityTotal';
        log.oldValue = this.quantityTotal.toString();
        this.quantityTotal = amount;
        log.newValue = this.quantityTotal.toString();
        log.justification = justification;
        log.user = user;
        return log;
    }
}
