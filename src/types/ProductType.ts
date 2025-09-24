import { MerchandiseStatus } from "../database/entities/Merchandise";

export type MerchandiseTypeEnum = {
    id?: string;
    typeId: string;
    quantity: number;
    status: MerchandiseStatus;
}
