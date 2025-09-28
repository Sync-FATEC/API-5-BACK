import { Router } from "express";
import { MerchandiseTypeController } from "../controllers/MerchandiseTypeController";
import { AuthMiddleware } from "../middlewares/authContext";
import { RoleEnum } from "../database/enums/RoleEnum";

const merchandiseTypeController = new MerchandiseTypeController();
const router = Router();

/**
 * @swagger
 * tags:
 *   name: MerchandiseTypes
 *   description: Gestão de tipos de mercadorias
 * components:
 *   schemas:
 *     MerchandiseType:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *           example: Medicamento Analgésico
 *         recordNumber:
 *           type: string
 *           example: MED001
 *         unitOfMeasure:
 *           type: string
 *           example: Comprimido
 *         controlled:
 *           type: boolean
 *           example: true
 *         group:
 *           type: string
 *           enum: [Medical, Almox]
 *           example: Medical
 *         minimumStock:
 *           type: number
 *           example: 100
 */

/**
 * @swagger
 * /merchandise-types:
 *   get:
 *     summary: Lista todos os tipos de produto
 *     tags: [MerchandiseTypes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de tipos de produto
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MerchandiseType'
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado - Requer role SOLDADO ou superior
 */
router.get("/", AuthMiddleware.requireRole(RoleEnum.SOLDADO), merchandiseTypeController.listAll);

/**
 * @swagger
 * /merchandise-types/{id}:
 *   get:
 *     summary: Busca tipo de produto por ID
 *     tags: [MerchandiseTypes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do tipo de produto
 *     responses:
 *       200:
 *         description: Tipo de produto encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MerchandiseType'
 *       404:
 *         description: Tipo de produto não encontrado
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado - Requer role SOLDADO ou superior
 */
router.get("/:id", AuthMiddleware.requireRole(RoleEnum.SOLDADO), merchandiseTypeController.getById);

/**
 * @swagger
 * /merchandise-types:
 *   post:
 *     summary: Cria um novo tipo de produto
 *     tags: [MerchandiseTypes]
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
 *               - recordNumber
 *               - unitOfMeasure
 *               - controlled
 *               - group
 *               - minimumStock
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Caneta Azul"
 *               recordNumber:
 *                 type: string
 *                 example: "REC001"
 *               unitOfMeasure:
 *                 type: string
 *                 example: "unidade"
 *               quantityTotal:
 *                 type: number
 *                 default: 0
 *                 example: 100
 *               controlled:
 *                 type: boolean
 *                 example: true
 *               group:
 *                 type: string
 *                 enum: [MATERIAL_ESCRITORIO, LIMPEZA, MANUTENCAO, OUTROS]
 *                 example: "MATERIAL_ESCRITORIO"
 *               minimumStock:
 *                 type: number
 *                 example: 10
 *     responses:
 *       201:
 *         description: Tipo de produto criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MerchandiseType'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado - Requer role SOLDADO ou superior
 */
router.post("/", AuthMiddleware.requireRole(RoleEnum.SOLDADO), merchandiseTypeController.create);

/**
 * @swagger
 * /merchandise-types/{id}:
 *   put:
 *     summary: Atualiza um tipo de produto
 *     tags: [MerchandiseTypes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do tipo de produto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Caneta Azul"
 *               recordNumber:
 *                 type: string
 *                 example: "REC001"
 *               unitOfMeasure:
 *                 type: string
 *                 example: "unidade"
 *               quantityTotal:
 *                 type: number
 *                 example: 100
 *               controlled:
 *                 type: boolean
 *                 example: true
 *               group:
 *                 type: string
 *                 enum: [MATERIAL_ESCRITORIO, LIMPEZA, MANUTENCAO, OUTROS]
 *                 example: "MATERIAL_ESCRITORIO"
 *               minimumStock:
 *                 type: number
 *                 example: 10
 *     responses:
 *       200:
 *         description: Tipo de produto atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MerchandiseType'
 *       404:
 *         description: Tipo de produto não encontrado
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado - Requer role SOLDADO ou superior
 */
router.put("/:id", AuthMiddleware.requireRole(RoleEnum.SOLDADO), merchandiseTypeController.update);

/**
 * @swagger
 * /merchandise-types/{id}:
 *   delete:
 *     summary: Remove um tipo de produto
 *     tags: [MerchandiseTypes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do tipo de produto
 *     responses:
 *       204:
 *         description: Tipo de produto removido com sucesso
 *       404:
 *         description: Tipo de produto não encontrado
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado - Requer role SUPERVISOR ou superior
 */
router.delete("/:id", AuthMiddleware.requireRole(RoleEnum.SUPERVISOR), merchandiseTypeController.delete);

/**
 * @swagger
 * components:
 *   schemas:
 *     MerchandiseType:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *           example: "Caneta Azul"
 *         recordNumber:
 *           type: string
 *           example: "REC001"
 *         unitOfMeasure:
 *           type: string
 *           example: "unidade"
 *         quantityTotal:
 *           type: number
 *           default: 0
 *           example: 100
 *         controlled:
 *           type: boolean
 *           example: true
 *         group:
 *           type: string
 *           enum: [Medical, Almox]
 *           example: "Almox"
 *         minimumStock:
 *           type: number
 *           example: 10
 */

export default router;
