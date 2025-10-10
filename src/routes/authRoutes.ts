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
 * /auth/users:
 *   get:
 *     summary: Lista todos os usuários
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Lista de usuários obtida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 */
router.get("/users", userController.getAllUsers);

/**
 * @swagger
 * /auth/users/{id}:
 *   put:
 *     summary: Atualiza um usuário
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [SOLDADO, SUPERVISOR, ADMIN]
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 */
router.put("/users/:id", userController.updateUser);

/**
 * @swagger
 * /auth/users/{id}:
 *   delete:
 *     summary: Deleta um usuário
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Usuário deletado com sucesso
 */
router.delete("/users/:id", userController.deleteUser);

/**
 * @swagger
 * /auth/users/{userId}/stocks:
 *   post:
 *     summary: Vincula usuário a um estoque
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               stockId:
 *                 type: string
 *               responsibility:
 *                 type: string
 *                 enum: [USER, MANAGER, ADMIN]
 *     responses:
 *       200:
 *         description: Usuário vinculado ao estoque com sucesso
 */
router.post("/users/:userId/stocks", userController.linkUserToStock);

/**
 * @swagger
 * /auth/users/{userId}/stocks/{stockId}:
 *   delete:
 *     summary: Desvincula usuário de um estoque
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *       - in: path
 *         name: stockId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do estoque
 *     responses:
 *       200:
 *         description: Usuário desvinculado do estoque com sucesso
 */
router.delete("/users/:userId/stocks/:stockId", userController.unlinkUserFromStock);

/**
 * @swagger
 * /auth/users/{userId}/stocks:
 *   get:
 *     summary: Busca estoques vinculados a um usuário
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Estoques do usuário encontrados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Stock'
 *                 message:
 *                   type: string
 *       404:
 *         description: Usuário não encontrado
 */
router.get("/users/:userId/stocks", userController.getUserStocks);

/**
 * @swagger
 * /auth/change-password:
 *   put:
 *     summary: Altera a senha do usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email do usuário
 *               currentPassword:
 *                 type: string
 *                 description: Senha atual do usuário
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *                 description: Nova senha do usuário (mínimo 6 caracteres)
 *     responses:
 *       200:
 *         description: Senha alterada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                     message:
 *                       type: string
 *                 message:
 *                   type: string
 *       400:
 *         description: Dados inválidos ou senha atual incorreta
 *       404:
 *         description: Usuário não encontrado
 */
router.put("/change-password", userController.changePassword);

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
