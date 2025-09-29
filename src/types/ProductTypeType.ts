export type MerchandiseTypeType = {
    id?: string;
    name: string;
    recordNumber: string;
    unitOfMeasure: string;
    controlled: boolean;
    minimumStock: number;
    stockId: string;
    quantityTotal?: number;
}
