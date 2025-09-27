import { MerchandiseStatus } from "../database/entities/Merchandise";

export type MerchandiseType = {
    id?: string;
    typeId: string;
    quantity: number;
    status: MerchandiseStatus;
}

export type StockAlert = {
    typeId: string;
    typeName: string;
    unitOfMeasure: string;
    minimumStock: number;
    totalQuantity: number;
    itemCount: number;
    alertType: 'normal' | 'warning' | 'critical';
    alertMessage: string;
    needsAttention: boolean;
}

export type StockAlertSummary = {
    alerts: StockAlert[];
    summary: {
        total: number;
        critical: number;
        warning: number;
        normal: number;
    };
}
