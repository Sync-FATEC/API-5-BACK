export interface SectionDTO {
  id?: string;
  name: string;
}

export interface OrderItemDTO {
  id?: string;
  quantity: number;
  merchandiseId: string;
}

export interface OrderDTO {
  id?: string;
  creationDate: Date;
  withdrawalDate?: Date;
  status: string;
  sectionId: string;
  orderItems: OrderItemDTO[];
}


export interface OrderItemViewModel {
  id?: string;
  quantity: number;
  merchandiseId: string;
  merchandiseName: string;
}

export interface OrderViewModel {
  id?: string;
  creationDate: Date;
  withdrawalDate?: Date;
  status: string;
  sectionId: string;
  sectionName: string;
  orderItems: OrderItemViewModel[];
}