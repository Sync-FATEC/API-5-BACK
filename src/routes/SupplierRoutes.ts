import { Router } from "express";
import { SupplierController } from "../controllers/SupplierController";

const supplierController = new SupplierController();
const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Supplier:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único do fornecedor
 *         razaoSocial:
 *           type: string
 *           maxLength: 255
 *           description: Razão social da empresa
 *           example: "Tech Solutions Ltda"
 *         nomeResponsavel:
 *           type: string
 *           maxLength: 255
 *           nullable: true
 *           description: Nome do responsável (opcional)
 *           example: "João Silva"
 *         cargoResponsavel:
 *           type: string
 *           maxLength: 255
 *           nullable: true
 *           description: Cargo do responsável (opcional)
 *           example: "Gerente Comercial"
 *         cnpj:
 *           type: string
 *           pattern: '^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$'
 *           description: CNPJ da empresa (formatado)
 *           example: "12.345.678/0001-90"
 *         emailPrimario:
 *           type: string
 *           format: email
 *           maxLength: 255
 *           description: Email principal da empresa
 *           example: "contato@techsolutions.com"
 *         emailSecundario:
 *           type: string
 *           format: email
 *           maxLength: 255
 *           nullable: true
 *           description: Email secundário (opcional)
 *           example: "vendas@techsolutions.com"
 *         isActive:
 *           type: boolean
 *           description: Status ativo/inativo do fornecedor
 *           example: true
 *     SupplierCreate:
 *       type: object
 *       required:
 *         - razaoSocial
 *         - cnpj
 *         - emailPrimario
 *       properties:
 *         razaoSocial:
 *           type: string
 *           maxLength: 255
 *           description: Razão social da empresa
 *           example: "Tech Solutions Ltda"
 *         nomeResponsavel:
 *           type: string
 *           maxLength: 255
 *           description: Nome do responsável (opcional)
 *           example: "João Silva"
 *         cargoResponsavel:
 *           type: string
 *           maxLength: 255
 *           description: Cargo do responsável (opcional)
 *           example: "Gerente Comercial"
 *         cnpj:
 *           type: string
 *           description: CNPJ da empresa (aceita formatado ou apenas números)
 *           example: "12.345.678/0001-90"
 *         emailPrimario:
 *           type: string
 *           format: email
 *           maxLength: 255
 *           description: Email principal da empresa
 *           example: "contato@techsolutions.com"
 *         emailSecundario:
 *           type: string
 *           format: email
 *           maxLength: 255
 *           description: Email secundário (opcional)
 *           example: "vendas@techsolutions.com"
 *     SupplierUpdate:
 *       type: object
 *       properties:
 *         razaoSocial:
 *           type: string
 *           maxLength: 255
 *         nomeResponsavel:
 *           type: string
 *           maxLength: 255
 *         cargoResponsavel:
 *           type: string
 *           maxLength: 255
 *         cnpj:
 *           type: string
 *         emailPrimario:
 *           type: string
 *           format: email
 *         emailSecundario:
 *           type: string
 *           format: email
 */

/**
 * @swagger
 * /suppliers:
 *   post:
 *     summary: Criar um novo fornecedor
 *     tags: [Fornecedores]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SupplierCreate'
 *     responses:
 *       201:
 *         description: Fornecedor criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Supplier'
 *                 message:
 *                   type: string
 *                   example: "Fornecedor criado com sucesso"
 *       400:
 *         description: Dados inválidos ou CNPJ já cadastrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "CNPJ já cadastrado"
 */
router.post("/", supplierController.create);

/**
 * @swagger
 * /suppliers:
 *   get:
 *     summary: Listar fornecedores com filtros e paginação
 *     tags: [Fornecedores]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por razão social, CNPJ, email ou nome do responsável
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filtrar por status ativo/inativo
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Página atual
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Itens por página
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [razaoSocial, cnpj, createdAt]
 *           default: createdAt
 *         description: Campo para ordenação
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: Ordem de classificação
 *     responses:
 *       200:
 *         description: Lista de fornecedores obtida com sucesso
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
 *                     suppliers:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Supplier'
 *                     total:
 *                       type: integer
 *                       description: Total de registros
 *                     page:
 *                       type: integer
 *                       description: Página atual
 *                     limit:
 *                       type: integer
 *                       description: Itens por página
 *                     totalPages:
 *                       type: integer
 *                       description: Total de páginas
 *                 message:
 *                   type: string
 *                   example: "Fornecedores obtidos com sucesso"
 */
router.get("/", supplierController.getAll);

/**
 * @swagger
 * /suppliers/{id}:
 *   get:
 *     summary: Buscar fornecedor por ID
 *     tags: [Fornecedores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do fornecedor
 *     responses:
 *       200:
 *         description: Fornecedor encontrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Supplier'
 *                 message:
 *                   type: string
 *                   example: "Fornecedor encontrado com sucesso"
 *       404:
 *         description: Fornecedor não encontrado
 */
router.get("/:id", supplierController.getById);

/**
 * @swagger
 * /suppliers/{id}:
 *   put:
 *     summary: Atualizar fornecedor
 *     tags: [Fornecedores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do fornecedor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SupplierUpdate'
 *     responses:
 *       200:
 *         description: Fornecedor atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Supplier'
 *                 message:
 *                   type: string
 *                   example: "Fornecedor atualizado com sucesso"
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Fornecedor não encontrado
 */
router.put("/:id", supplierController.update);

/**
 * @swagger
 * /suppliers/{id}:
 *   delete:
 *     summary: Deletar fornecedor (soft delete)
 *     tags: [Fornecedores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do fornecedor
 *     responses:
 *       200:
 *         description: Fornecedor deletado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Fornecedor deletado com sucesso"
 *       404:
 *         description: Fornecedor não encontrado
 */
router.delete("/:id", supplierController.delete);

export default router;
