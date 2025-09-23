import { MerchandiseGroup } from "../database/enums/MerchandiseGroup";

export type MerchandiseTypeType = {
    id?: string;
    name: string;
    recordNumber: string;
    unitOfMeasure: string;
    controlled: boolean;
    group: MerchandiseGroup;
    minimumStock: number;
}
