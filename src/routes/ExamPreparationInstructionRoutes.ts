import { Router } from "express";
import { ExamPreparationInstructionController } from "../controllers/ExamPreparationInstructionController";
import { AuthMiddleware } from "../middlewares/authContext";
import { RoleEnum } from "../database/enums/RoleEnum";

const controller = new ExamPreparationInstructionController();
const router = Router();

/**
 * @swagger
 * tags:
 *   name: ExamPreparations
 *   description: Gestão de instruções de preparo de exames
 */

/**
 * @swagger
 * /exam-preparations/exam-type/{examTypeId}:
 *   get:
 *     summary: Lista instruções de preparo por tipo de exame
 *     tags: [ExamPreparations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: examTypeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Lista de instruções
 */
router.get('/exam-type/:examTypeId', controller.listByExamType);

/**
 * @swagger
 * /exam-preparations/{id}:
 *   get:
 *     summary: Busca instrução por ID
 *     tags: [ExamPreparations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Instrução encontrada
 */
router.get('/:id', controller.getById);

/**
 * @swagger
 * /exam-preparations:
 *   post:
 *     summary: Cria uma instrução de preparo
 *     tags: [ExamPreparations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - examTypeId
 *               - titulo
 *               - conteudo
 *             properties:
 *               examTypeId:
 *                 type: string
 *                 format: uuid
 *               titulo:
 *                 type: string
 *               conteudo:
 *                 type: string
 *               ordem:
 *                 type: number
 *                 default: 0
 *     responses:
 *       201:
 *         description: Instrução criada
 */
router.post('/', AuthMiddleware.requireRole(RoleEnum.COORDENADOR_AGENDA), controller.create);

/**
 * @swagger
 * /exam-preparations/{id}:
 *   patch:
 *     summary: Atualiza uma instrução de preparo
 *     tags: [ExamPreparations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               examTypeId:
 *                 type: string
 *                 format: uuid
 *               titulo:
 *                 type: string
 *               conteudo:
 *                 type: string
 *               ordem:
 *                 type: number
 *     responses:
 *       200:
 *         description: Instrução atualizada
 */
router.patch('/:id', AuthMiddleware.requireRole(RoleEnum.COORDENADOR_AGENDA), controller.update);

/**
 * @swagger
 * /exam-preparations/{id}:
 *   delete:
 *     summary: Remove uma instrução de preparo
 *     tags: [ExamPreparations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Instrução removida
 */
router.delete('/:id', AuthMiddleware.requireRole(RoleEnum.COORDENADOR_AGENDA), controller.delete);

export default router;