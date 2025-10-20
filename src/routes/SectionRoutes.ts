import { Router } from 'express';
import { SectionController } from '../controllers/SectionController';

const router = Router();
const sectionController = new SectionController();

/**
 * @swagger
 * /sections:
 *   get:
 *     summary: Lista todas as seções
 *     tags: [Sections]
 *     responses:
 *       200:
 *         description: Lista de seções
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Section'
 */
router.get('/:id', (req, res) => sectionController.getAll(req, res));
router.get('/', (req, res) => sectionController.getAll(req, res));

/**
 * @swagger
 * /sections/{id}:
 *   get:
 *     summary: Busca seção por ID
 *     tags: [Sections]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da seção
 *     responses:
 *       200:
 *         description: Seção encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Section'
 *       404:
 *         description: Seção não encontrada
 */
router.get('/:id', (req, res) => sectionController.getById(req, res));

/**
 * @swagger
 * /sections:
 *   post:
 *     summary: Cria uma nova seção
 *     tags: [Sections]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Almoxarifado"
 *     responses:
 *       201:
 *         description: Seção criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Section'
 *       400:
 *         description: Dados inválidos
 */
router.post('/', (req, res) => sectionController.create(req, res));

/**
 * @swagger
 * /sections/{id}:
 *   put:
 *     summary: Atualiza uma seção
 *     tags: [Sections]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da seção
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Almoxarifado"
 *     responses:
 *       200:
 *         description: Seção atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Section'
 *       404:
 *         description: Seção não encontrada
 *       400:
 *         description: Dados inválidos
 */
router.put('/:id', (req, res) => sectionController.update(req, res));

/**
 * @swagger
 * /sections/{id}:
 *   delete:
 *     summary: Remove uma seção
 *     tags: [Sections]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da seção
 *     responses:
 *       204:
 *         description: Seção removida com sucesso
 *       404:
 *         description: Seção não encontrada
 */
router.delete('/:id', (req, res) => sectionController.delete(req, res));

/**
 * @swagger
 * /sections/{id}/consumption-average:
 *   get:
 *     summary: Obtém a média de consumo dos produtos de uma seção em um período específico
 *     tags: [Sections]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da seção
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial do período (formato YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final do período (formato YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Dados de consumo médio obtidos com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   merchandiseTypeId:
 *                     type: string
 *                     format: uuid
 *                     description: ID do tipo de mercadoria
 *                   merchandiseTypeName:
 *                     type: string
 *                     description: Nome do tipo de mercadoria
 *                   totalQuantity:
 *                     type: number
 *                     description: Quantidade total consumida no período
 *                   averagePerDay:
 *                     type: number
 *                     description: Média de consumo diário
 *       400:
 *         description: Parâmetros de data inválidos ou ausentes
 *       404:
 *         description: Seção não encontrada
 *       500:
 *         description: Erro ao calcular médias de consumo
 */
router.get('/:id/consumption-average', (req, res) => sectionController.getConsumptionAverage(req, res));

/**
 * @swagger
 * components:
 *   schemas:
 *     Section:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *           example: "Almoxarifado"
 *     ConsumptionAverage:
 *       type: object
 *       properties:
 *         merchandiseTypeId:
 *           type: string
 *           format: uuid
 *           description: ID do tipo de mercadoria
 *         merchandiseTypeName:
 *           type: string
 *           description: Nome do tipo de mercadoria
 *         totalQuantity:
 *           type: number
 *           description: Quantidade total consumida no período
 *         averagePerDay:
 *           type: number
 *           description: Média de consumo diário
 */
export default router;
