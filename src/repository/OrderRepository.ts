import { AppDataSource } from '../database/data-source';
import { Order } from '../database/entities/Order';
import { OrderItem } from '../database/entities/OrderItem';

export const OrderRepository = AppDataSource.getRepository(Order);
