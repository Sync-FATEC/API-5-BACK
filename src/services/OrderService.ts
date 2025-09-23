import { OrderRepository } from '../repository/OrderRepository';
import { Order } from '../database/entities/Order';
import { OrderItem } from '../database/entities/OrderItem';
import { Section } from '../database/entities/Section';
import { Merchandise } from '../database/entities/Merchandise';
import { SectionRepository } from '../repository/SectionRepository';
import { OrderDTO, OrderItemDTO, OrderViewModel } from '../types/OrderSectionDTO';
import { AppDataSource } from '../database/data-source';

export class OrderService {
		async getAll(): Promise<OrderViewModel[]> {
			const orders = await OrderRepository.find({ relations: ['orderItems', 'orderItems.merchandise', 'orderItems.merchandise.type', 'section'] });

			console.log(orders)

			return orders.map(order => ({
				id: order.id,
				creationDate: order.creationDate,
				withdrawalDate: order.withdrawalDate,
				status: order.status,
				sectionId: order.section?.id ?? '',
				sectionName: order.section.name,
				orderItems: order.orderItems.map(item => ({
					id: item.id,
					quantity: item.quantity,
					merchandiseId: item.merchandise?.id ?? '',
					merchandiseName: item.merchandise.type.name
				}))
			}));
		}

		async getById(id: string): Promise<OrderViewModel | null> {
			const order = await OrderRepository.findOne({ where: { id }, relations: ['orderItems', 'orderItems.merchandise', 'orderItems.merchandise.type', 'section'] });
			if (!order) return null;
			return {
				id: order.id,
				creationDate: order.creationDate,
				withdrawalDate: order.withdrawalDate,
				status: order.status,
				sectionName: order.section.name,
				sectionId: order.section?.id ?? '',
				orderItems: order.orderItems.map(item => ({
					id: item.id,
					quantity: item.quantity,
					merchandiseId: item.merchandise?.id ?? '',
					merchandiseName: item.merchandise.type.name
				}))
			};
		}

		async create(orderData: OrderDTO): Promise<OrderDTO> {
			// Buscar Section
			const section = await AppDataSource.getRepository(Section).findOne({ where: { id: orderData.sectionId } });
			if (!section) throw new Error('Section not found');

			// Buscar Merchandise e criar OrderItems
			const orderItems: OrderItem[] = [];
			for (const itemDTO of orderData.orderItems) {
				const merchandise = await AppDataSource.getRepository(Merchandise).findOne({ where: { id: itemDTO.merchandiseId } });
				if (!merchandise) throw new Error(`Merchandise not found: ${itemDTO.merchandiseId}`);
				const orderItem = new OrderItem();
				orderItem.quantity = itemDTO.quantity;
				orderItem.merchandise = merchandise;
				orderItems.push(orderItem);
			}

			// Criar Order
			const order = new Order();
			order.creationDate = orderData.creationDate;
			order.withdrawalDate = orderData.withdrawalDate ?? new Date();
			order.status = orderData.status;
			order.section = section;
			order.orderItems = orderItems;

			// Salvar Order e OrderItems
			const savedOrder = await OrderRepository.save(order);
			return {
				id: savedOrder.id,
				creationDate: savedOrder.creationDate,
				withdrawalDate: savedOrder.withdrawalDate,
				status: savedOrder.status,
				sectionId: savedOrder.section?.id ?? '',
				orderItems: savedOrder.orderItems.map(item => ({
					id: item.id,
					quantity: item.quantity,
					merchandiseId: item.merchandise?.id ?? ''
				}))
			};
		}

		async update(id: string, orderData: OrderDTO): Promise<OrderDTO | null> {
			const order = await OrderRepository.findOne({ where: { id }, relations: ['orderItems', 'section'] });
			if (!order) return null;

			// Buscar Section
			const section = await AppDataSource.getRepository(Section).findOne({ where: { id: orderData.sectionId } });
			if (!section) throw new Error('Section not found');

			// Atualizar dados básicos
			order.creationDate = orderData.creationDate;
			order.withdrawalDate = orderData.withdrawalDate ?? new Date();
			order.status = orderData.status;
			order.section = section;

			// Atualizar OrderItems
			order.orderItems = [];
			for (const itemDTO of orderData.orderItems) {
				const merchandise = await AppDataSource.getRepository(Merchandise).findOne({ where: { id: itemDTO.merchandiseId } });
				if (!merchandise) throw new Error(`Merchandise not found: ${itemDTO.merchandiseId}`);
				const orderItem = new OrderItem();
				orderItem.quantity = itemDTO.quantity;
				orderItem.merchandise = merchandise;
				orderItem.order = order;
				order.orderItems.push(orderItem);
			}

			const savedOrder = await OrderRepository.save(order);
			return {
				id: savedOrder.id,
				creationDate: savedOrder.creationDate,
				withdrawalDate: savedOrder.withdrawalDate,
				status: savedOrder.status,
				sectionId: savedOrder.section?.id ?? '',
				orderItems: savedOrder.orderItems.map(item => ({
					id: item.id,
					quantity: item.quantity,
					merchandiseId: item.merchandise?.id ?? ''
				}))
			};
		}

	async delete(id: string): Promise<boolean> {
		const result = await OrderRepository.delete(id);
		return result.affected !== 0;
	}
}
