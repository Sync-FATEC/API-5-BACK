import { Router } from "express";
import { MerchandiseTypeController } from "../controllers/MerchandiseTypeController";
import { AuthMiddleware } from "../middlewares/authContext";
import { RoleEnum } from "../database/enums/RoleEnum";

const merchandiseTypeController = new MerchandiseTypeController();
const router = Router();


router.get("/:id/logs", AuthMiddleware.requireRole(RoleEnum.SOLDADO), merchandiseTypeController.listLogs);

/**
 * @swagger
 * /merchandise-types/{id}/merchandises:
 *   get:
 *     summary: Lista todas as mercadorias e lotes de um tipo específico
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
 *         description: ID do tipo de mercadoria
 *     responses:
 *       200:
 *         description: Mercadorias e lotes encontrados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     merchandiseType:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         name:
 *                           type: string
 *                         recordNumber:
 *                           type: string
 *                         unitOfMeasure:
 *                           type: string
 *                         quantityTotal:
 *                           type: number
 *                         controlled:
 *                           type: boolean
 *                         minimumStock:
 *                           type: number
 *                         group:
 *                           type: string
 *                         stock:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                               format: uuid
 *                             name:
 *                               type: string
 *                     merchandises:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           quantity:
 *                             type: number
 *                           status:
 *                             type: string
 *                             enum: [AVAILABLE, RESERVED, OUT_OF_STOCK]
 *                           batch:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 format: uuid
 *                               expirationDate:
 *                                 type: string
 *                                 format: date
 *                 message:
 *                   type: string
 *                   example: "Mercadorias e lotes encontrados com sucesso"
 *       400:
 *         description: ID do tipo de mercadoria é obrigatório
 *       404:
 *         description: Tipo de mercadoria não encontrado
 *       401:
 *         description: Não autorizado
 */
router.get("/:id/merchandises", merchandiseTypeController.getMerchandisesWithBatches);



/**
 * @swagger
 * /merchandise-types/{id}/quantity-total:
 *   patch:
 *     summary: Atualiza a quantidade total de um tipo de mercadoria (admin)
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
 *         description: ID do tipo de mercadoria
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantityTotal:
 *                 type: number
 *                 example: 150
 *     responses:
 *       200:
 *         description: Quantidade total atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MerchandiseType'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado - Requer role ADMIN
 */
router.patch('/:id/quantity-total', AuthMiddleware.requireRole(RoleEnum.ADMIN), merchandiseTypeController.updateQuantityTotal);

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
           type: string
           enum: [expediente, limpeza, "Almox Virtual", permanente]
           example: expediente
 *         minimumStock:
 *           type: number
 *           example: 100
 *         stockId:
 *           type: string
 *           format: uuid
 *           example: 123e4567-e89b-12d3-a456-426614174000
 *         stock:
 *           type: object
 *           description: Informações do stock associado
 */

/**
 * @swagger
 * /merchandise-types/{stockId}:
 *   get:
 *     summary: Lista tipos de produto de um stock específico
 *     tags: [MerchandiseTypes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: stockId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do stock para filtrar os tipos de produto
 *     responses:
 *       200:
 *         description: Lista de tipos de produto do stock especificado
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
router.get("/:stockId", merchandiseTypeController.listAll);

/**
 * @swagger
 * /merchandise-types/details/{id}:
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
router.get("/details/:id", merchandiseTypeController.getById);

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
               - name
               - recordNumber
               - unitOfMeasure
               - controlled
               - group
               - minimumStock
               - stockId
             properties:
               name:
                 type: string
                 example: "Caneta Azul"
               recordNumber:
                 type: string
                 example: "REC001"
               unitOfMeasure:
                 type: string
                 example: "unidade"
               quantityTotal:
                 type: number
                 default: 0
                 example: 100
               controlled:
                 type: boolean
                 example: true
               group:
                 type: string
                 enum: [expediente, limpeza, "Almox Virtual", permanente]
                 example: "expediente"
               minimumStock:
                 type: number
                 example: 10
               stockId:
                 type: string
                 format: uuid
                 example: "123e4567-e89b-12d3-a456-426614174000"
                 description: "ID do stock ao qual o tipo de mercadoria pertence"
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
router.post("/", merchandiseTypeController.create);

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
router.put("/:id", merchandiseTypeController.update);

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
router.delete("/:id", merchandiseTypeController.delete);

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
