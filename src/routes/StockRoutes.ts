import { Router } from "express";

import { StockController } from "../controllers/StockController";
import { AuthMiddleware } from "../middlewares/authContext";
import { RoleEnum } from "../database/enums/RoleEnum";

const stockController = new StockController();
const router = Router();

/**
 * @swagger
 * /stock/{userId}:
 *   get:
 *     summary: Busca estoque por usuário
 *     tags: [Stock]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Estoque do usuário encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Stock'
 *       404:
 *         description: Usuário não encontrado ou sem estoque associado
 */
router.get("/:userId", stockController.getStockByUser);

/**
 * @swagger
 * /stock:
 *   post:
 *     summary: Cria um novo estoque
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - location
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Almoxarifado Central"
 *               location:
 *                 type: string
 *                 example: "Prédio A - Sala 101"
 *               active:
 *                 type: boolean
 *                 default: true
 *                 example: true
 *     responses:
 *       201:
 *         description: Estoque criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Stock'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado - Requer role ADMIN
 */
router.post("/", AuthMiddleware.requireRole(RoleEnum.ADMIN), stockController.createStock);

/**
 * @swagger
 * /stock/{stockId}:
 *   put:
 *     summary: Atualiza um estoque
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: stockId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do estoque
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Almoxarifado Central"
 *               location:
 *                 type: string
 *                 example: "Prédio A - Sala 101"
 *               active:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Estoque atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Stock'
 *       404:
 *         description: Estoque não encontrado
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado - Requer role ADMIN
 */
router.put("/:stockId", AuthMiddleware.requireRole(RoleEnum.ADMIN), stockController.updateStock);

/**
 * @swagger
 * /stock/{stockId}:
 *   delete:
 *     summary: Remove um estoque
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: stockId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do estoque
 *     responses:
 *       204:
 *         description: Estoque removido com sucesso
 *       404:
 *         description: Estoque não encontrado
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado - Requer role ADMIN
 */
router.delete("/:stockId", AuthMiddleware.requireRole(RoleEnum.ADMIN), stockController.deleteStock);

/**
 * @swagger
 * components:
 *   schemas:
 *     Stock:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *           example: "Almoxarifado Central"
 *         location:
 *           type: string
 *           example: "Prédio A - Sala 101"
 *         active:
 *           type: boolean
 *           default: true
 *           example: true
 *     Batch:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         expirationDate:
 *           type: string
 *           format: date
 *           example: "2024-12-31"
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

export default router;  
