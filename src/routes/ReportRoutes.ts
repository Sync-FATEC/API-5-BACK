import { Router } from 'express';
import { ReportController } from '../controllers/ReportController';

const reportController = new ReportController();
const router = Router();

/**
 * @swagger
 * /reports/dashboard:
 *   get:
 *     summary: Gera relatório do dashboard em PDF ou Excel
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: format
 *         required: true
 *         schema:
 *           type: string
 *           enum: [pdf, excel]
 *         description: Formato do relatório (pdf ou excel)
 *       - in: query
 *         name: stockId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do estoque
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de início do filtro (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de fim do filtro (YYYY-MM-DD)
 *       - in: query
 *         name: includeOrders
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Incluir dados de pedidos no relatório
 *       - in: query
 *         name: includeMerchandise
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Incluir dados de mercadorias no relatório
 *       - in: query
 *         name: includeStock
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Incluir dados do estoque no relatório
 *     responses:
 *       200:
 *         description: Relatório gerado com sucesso
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Parâmetros inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 details:
 *                   type: string
 */
router.get('/dashboard', reportController.generateDashboardReport);

/**
 * @swagger
 * /reports/dashboard/summary:
 *   get:
 *     summary: Obtém resumo dos dados do dashboard
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: stockId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do estoque
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de início do filtro (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de fim do filtro (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Resumo obtido com sucesso
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
 *                     stockInfo:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         location:
 *                           type: string
 *                     totalOrders:
 *                       type: number
 *                     totalMerchandise:
 *                       type: number
 *                     totalOrderItems:
 *                       type: number
 *                     ordersThisMonth:
 *                       type: number
 *                     ordersByStatus:
 *                       type: object
 *                     merchandiseByType:
 *                       type: object
 *                     recentOrders:
 *                       type: array
 *                       items:
 *                         type: object
 *                     topMerchandise:
 *                       type: array
 *                       items:
 *                         type: object
 *       400:
 *         description: Parâmetros inválidos
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/dashboard/summary', reportController.getDashboardSummary);

export default router;