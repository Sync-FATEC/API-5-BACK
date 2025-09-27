import { Router } from "express";
import { MerchandiseController } from "../controllers/MerchandiseController";
import { AuthMiddleware } from "../middlewares/authContext";
import { RoleEnum } from "../database/enums/RoleEnum";

const merchandiseController = new MerchandiseController();
const router = Router();

/**
 * @swagger
 * /merchandise:
 *   get:
 *     summary: Lista todos os produtos
 *     tags: [Merchandise]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de produtos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Merchandise'
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado - Requer role SOLDADO ou superior
 */
router.get("/", AuthMiddleware.requireRole(RoleEnum.SOLDADO), merchandiseController.listAll);

/**
 * @swagger
 * /merchandise/stock-alerts:
 *   get:
 *    summary: Obtém alertas de estoque
 *   tags: [Merchandise]
 *  security:
 *      - bearerAuth: []
 *    responses:
 *     200:
 *      description: Alertas de estoque
 *     content:
 *      application/json:
 *      schema:
 *      $ref: '#/components/schemas/StockAlertSummary'
 *    401:
 *    description: Não autorizado
 *   403:
 *   description: Acesso negado - Requer role SOLDADO ou superior
 */
router.get("/stock-alerts", AuthMiddleware.requireRole(RoleEnum.SOLDADO), merchandiseController.getStockAlerts);

/**
 * @swagger
 * /merchandise/{id}:
 *   get:
 *     summary: Busca produto por ID
 *     tags: [Merchandise]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do produto
 *     responses:
 *       200:
 *         description: Produto encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Merchandise'
 *       404:
 *         description: Produto não encontrado
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado - Requer role SOLDADO ou superior
 */
router.get("/:id", AuthMiddleware.requireRole(RoleEnum.SOLDADO), merchandiseController.getById);

/**
 * @swagger
 * /merchandise/{id}/qrcode:
 *   get:
 *     summary: Gera QR Code para o produto
 *     tags: [Merchandise]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do produto
 *     responses:
 *       200:
 *         description: QR Code gerado com sucesso
 *         content:
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Produto não encontrado
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado - Requer role SOLDADO ou superior
 */
router.get("/:id/qrcode", AuthMiddleware.requireRole(RoleEnum.SOLDADO), merchandiseController.generateQRCode);

/**
 * @swagger
 * /merchandise:
 *   post:
 *     summary: Cria um novo produto
 *     tags: [Merchandise]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - batchId
 *               - typeId
 *               - quantity
 *               - status
 *             properties:
 *               batchId:
 *                 type: string
 *                 format: uuid
 *                 example: "batch-uuid-123"
 *               typeId:
 *                 type: string
 *                 format: uuid
 *                 example: "type-uuid-123"
 *               quantity:
 *                 type: number
 *                 example: 100
 *               status:
 *                 type: string
 *                 enum: [AVAILABLE, RESERVED, OUT_OF_STOCK]
 *                 example: "AVAILABLE"
 *     responses:
 *       201:
 *         description: Produto criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Merchandise'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado - Requer role SOLDADO ou superior
 */
router.post("/", AuthMiddleware.requireRole(RoleEnum.SOLDADO), merchandiseController.create);

/**
 * @swagger
 * /merchandise/{id}:
 *   put:
 *     summary: Atualiza um produto
 *     tags: [Merchandise]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do produto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               batchId:
 *                 type: string
 *                 format: uuid
 *                 example: "batch-uuid-123"
 *               typeId:
 *                 type: string
 *                 format: uuid
 *                 example: "type-uuid-123"
 *               quantity:
 *                 type: number
 *                 example: 100
 *               status:
 *                 type: string
 *                 enum: [AVAILABLE, RESERVED, OUT_OF_STOCK]
 *                 example: "AVAILABLE"
 *     responses:
 *       200:
 *         description: Produto atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Merchandise'
 *       404:
 *         description: Produto não encontrado
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado - Requer role SOLDADO ou superior
 */
router.put("/:id", AuthMiddleware.requireRole(RoleEnum.SOLDADO), merchandiseController.update);

/**
 * @swagger
 * /merchandise/{id}:
 *   delete:
 *     summary: Remove um produto
 *     tags: [Merchandise]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do produto
 *     responses:
 *       204:
 *         description: Produto removido com sucesso
 *       404:
 *         description: Produto não encontrado
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado - Requer role SUPERVISOR ou superior
 */
router.delete("/:id", AuthMiddleware.requireRole(RoleEnum.SUPERVISOR), merchandiseController.delete);

/**
 * @swagger
 * components:
 *   schemas:
 *     Merchandise:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         batchId:
 *           type: string
 *           format: uuid
 *         typeId:
 *           type: string
 *           format: uuid
 *         quantity:
 *           type: number
 *           example: 100
 *         status:
 *           type: string
 *           enum: [AVAILABLE, RESERVED, OUT_OF_STOCK]
 *           example: "AVAILABLE"
 *         batch:
 *           $ref: '#/components/schemas/Batch'
 *         type:
 *           $ref: '#/components/schemas/MerchandiseType'
 *         stock:
 *           $ref: '#/components/schemas/Stock'
 */

export default router;
