import { Router } from "express";
import { UserController } from "../controllers/UserController";

const userController = new UserController();
const router = Router()

/**
 * @swagger
 * /auth/user-data/{email}:
 *   get:
 *     summary: Busca dados do usuário por email
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         description: Email do usuário
 *     responses:
 *       200:
 *         description: Dados do usuário encontrados
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Usuário não encontrado
 */
router.get("/user-data/:email", userController.getUserData);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registra um novo usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - name
 *               - firebaseUid
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "usuario@exemplo.com"
 *               name:
 *                 type: string
 *                 example: "João Silva"
 *               firebaseUid:
 *                 type: string
 *                 example: "firebase_uid_123"
 *               role:
 *                 type: string
 *                 enum: [SOLDADO, SUPERVISOR, ADMIN]
 *                 default: SOLDADO
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Dados inválidos
 */
router.post("/register", userController.create);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Realiza login do usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - firebaseUid
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "usuario@exemplo.com"
 *               firebaseUid:
 *                 type: string
 *                 example: "firebase_uid_123"
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *       401:
 *         description: Credenciais inválidas
 */
router.post("/login", userController.login);

/**
 * @swagger
 * /auth/forgot-password:
 *   put:
 *     summary: Solicita recuperação de senha
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "usuario@exemplo.com"
 *     responses:
 *       200:
 *         description: Email de recuperação enviado
 *       404:
 *         description: Email não encontrado
 */
router.put("/forgot-password", userController.forgotPassword);

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         email:
 *           type: string
 *           format: email
 *           example: "usuario@exemplo.com"
 *         name:
 *           type: string
 *           example: "João Silva"
 *         firebaseUid:
 *           type: string
 *           example: "firebase_uid_123"
 *         role:
 *           type: string
 *           enum: [SOLDADO, SUPERVISOR, ADMIN]
 *           example: "SOLDADO"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         validUntil:
 *           type: string
 *           format: date-time
 *         isActive:
 *           type: boolean
 *           example: true
 */

export default router;
