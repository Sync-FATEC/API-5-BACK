import { Router } from 'express';
import { OrderController } from '../controllers/OrderController';

const router = Router();
const orderController = new OrderController();

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Lista todos os pedidos
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Lista de pedidos
 */
router.get('/', (req, res) => orderController.getAll(req, res));
/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Busca pedido por ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pedido encontrado
 *       404:
 *         description: Pedido não encontrado
 */
router.get('/:id', (req, res) => orderController.getById(req, res));
/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Cria um novo pedido
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Order'
 *     responses:
 *       201:
 *         description: Pedido criado
 */
router.post('/', (req, res) => orderController.create(req, res));
/**
 * @swagger
 * /orders/{id}:
 *   put:
 *     summary: Atualiza um pedido
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Order'
 *     responses:
 *       200:
 *         description: Pedido atualizado
 *       404:
 *         description: Pedido não encontrado
 */
router.put('/:id', (req, res) => orderController.update(req, res));
/**
 * @swagger
 * /orders/{id}:
 *   delete:
 *     summary: Remove um pedido
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Pedido removido
 *       404:
 *         description: Pedido não encontrado
 */
router.delete('/:id', (req, res) => orderController.delete(req, res));

/**
 * @swagger
 * components:
 *   schemas:
 *     OrderItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         quantity:
 *           type: number
 *           example: 5
 *         merchandiseId:
 *           type: string
 *           format: uuid
 *     Order:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         creationDate:
 *           type: string
 *           format: date
 *         withdrawalDate:
 *           type: string
 *           format: date
 *         status:
 *           type: string
 *           example: "PENDENTE"
 *         sectionId:
 *           type: string
 *           format: uuid
 *         orderItems:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 */
export default router;
