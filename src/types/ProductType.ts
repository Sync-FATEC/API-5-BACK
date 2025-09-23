export type ProductType = {
    id?: string;
    name: string;
    fichNumber: string;
    quantity: number;
    minimumStock: number;
    unitOfMeasure: string;
    group: string;
    productTypeId: string;
    isActive?: boolean;
}
