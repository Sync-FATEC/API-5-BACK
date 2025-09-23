import { MerchandiseStatus } from "../database/entities/Merchandise";

export type MerchandiseType = {
    id?: string;
    typeId: string;
    quantity: number;
    status: MerchandiseStatus;
}
