import { Request, Response } from 'express';
import { OrderService } from '../services/OrderService';
import { OrderDTO } from '../types/OrderSectionDTO';

const orderService = new OrderService();

export class OrderController {
		async getAll(req: Request, res: Response) {
			const orders: OrderDTO[] = await orderService.getAll();
			return res.json(orders);
		}

		async getById(req: Request, res: Response) {
			const { id } = req.params;
			const order: OrderDTO | null = await orderService.getById(id);
			if (!order) return res.status(404).json({ message: 'Order not found' });
			return res.json(order);
		}

		async create(req: Request, res: Response) {
			const data: OrderDTO = req.body;
			if (!data.creationDate || !data.status || !data.sectionId || !Array.isArray(data.orderItems)) {
				return res.status(400).json({ message: 'Missing required fields' });
			}
			const order = await orderService.create(data);
			return res.status(201).json(order);
		}

		async update(req: Request, res: Response) {
			const { id } = req.params;
			const data: OrderDTO = req.body;
			if (!data.creationDate || !data.status || !data.sectionId || !Array.isArray(data.orderItems)) {
				return res.status(400).json({ message: 'Missing required fields' });
			}
			const order = await orderService.update(id, data);
			if (!order) return res.status(404).json({ message: 'Order not found' });
			return res.json(order);
		}

	async delete(req: Request, res: Response) {
		const { id } = req.params;
		const success = await orderService.delete(id);
		if (!success) return res.status(404).json({ message: 'Order not found' });
		return res.status(204).send();
	}
}
