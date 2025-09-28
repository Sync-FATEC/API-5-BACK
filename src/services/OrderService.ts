import { OrderRepository } from '../repository/OrderRepository';
import { Order } from '../database/entities/Order';
import { OrderItem } from '../database/entities/OrderItem';
import { Section } from '../database/entities/Section';
import { MerchandiseType } from '../database/entities/MerchandiseType';
import { OrderDTO, OrderItemDTO, OrderViewModel } from '../types/OrderSectionDTO';
import { AppDataSource } from '../database/data-source';
import { Stock } from '../database/entities/Stock';
import { SystemError } from '../middlewares/SystemError';

export class OrderService {
		async getAll(stockId: string): Promise<OrderViewModel[]> {
			const orders = await OrderRepository.find({ 
				where: { stock: { id: stockId } },
				relations: ['orderItems', 'orderItems.merchandise', 'section'] 
			});

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
					merchandiseName: item.merchandise.name
				}))
			}));
		}

		async getById(id: string): Promise<OrderViewModel | null> {
			const order = await OrderRepository.findOne({ where: { id }, relations: ['orderItems', 'orderItems.merchandise', 'section'] });
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
					merchandiseName: item.merchandise.name
				}))
			};
		}

		async create(orderData: OrderDTO): Promise<OrderDTO> {
		// Buscar Section
		const section = await AppDataSource.getRepository(Section).findOne({ where: { id: orderData.sectionId } });
		if (!section) throw new SystemError('Section not found');

		const stock = await AppDataSource.getRepository(Stock).findOne({ where: { id: orderData.stockId } });
		if (!stock) throw new SystemError('Stock not found');

		// Buscar MerchandiseType e criar OrderItems com validação de estoque
		const orderItems: OrderItem[] = [];
		const merchandiseTypeRepository = AppDataSource.getRepository(MerchandiseType);

		for (const itemDTO of orderData.orderItems) {
			const merchandiseType = await merchandiseTypeRepository.findOne({ 
				where: { id: itemDTO.merchandiseId }
			});
			if (!merchandiseType) throw new SystemError(`MerchandiseType not found: ${itemDTO.merchandiseId}`);

			// Verificar se há quantidade suficiente no tipo de mercadoria
			if (merchandiseType.quantityTotal < itemDTO.quantity) {
				throw new SystemError(`Estoque total insuficiente para o tipo ${merchandiseType.name}. Disponível: ${merchandiseType.quantityTotal}, Solicitado: ${itemDTO.quantity}`);
			}

			// Diminuir quantidade total do tipo de mercadoria
			merchandiseType.quantityTotal -= itemDTO.quantity;
			await merchandiseTypeRepository.save(merchandiseType);

			const orderItem = new OrderItem();
			orderItem.quantity = itemDTO.quantity;
			orderItem.merchandise = merchandiseType;
			orderItems.push(orderItem);
		}

		// Criar Order
		const order = new Order();
		order.creationDate = orderData.creationDate;
		order.withdrawalDate = orderData.withdrawalDate ?? new Date();
		order.status = orderData.status;
		order.section = section;
		order.stock = stock;
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
			})),
			stockId: stock.id
		};
	}

		async update(id: string, orderData: OrderDTO): Promise<OrderDTO | null> {
			const order = await OrderRepository.findOne({ where: { id }, relations: ['orderItems', 'section'] });
			if (!order) return null;

			// Buscar Section
			const section = await AppDataSource.getRepository(Section).findOne({ where: { id: orderData.sectionId } });
			if (!section) throw new SystemError('Section not found');

			const stock = await AppDataSource.getRepository(Stock).findOne({ where: { id: orderData.stockId } });
			if (!stock) throw new SystemError('Stock not found');

			// Atualizar dados básicos
			order.creationDate = orderData.creationDate;
			order.withdrawalDate = orderData.withdrawalDate ?? new Date();
			order.status = orderData.status;
			order.section = section;
			order.stock = stock;

			// Atualizar OrderItems
			order.orderItems = [];
			for (const itemDTO of orderData.orderItems) {
				const merchandise = await AppDataSource.getRepository(MerchandiseType).findOne({ where: { id: itemDTO.merchandiseId } });
				if (!merchandise) throw new SystemError(`Merchandise not found: ${itemDTO.merchandiseId}`);
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
				})),
				stockId: stock.id
			};
		}

	async delete(id: string): Promise<boolean> {
		const result = await OrderRepository.delete(id);
		return result.affected !== 0;
	}
}
