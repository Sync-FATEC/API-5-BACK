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
 *       500:
 *         description: Erro interno do servidor
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
 *       400:
 *         description: Parâmetros inválidos
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/dashboard/summary', reportController.getDashboardSummary);

/**
 * @swagger
 * /reports/dashboard/orders-by-period:
 *   get:
 *     summary: Obtém dados de pedidos por período para o gráfico
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: stockId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do estoque
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *           default: monthly
 *         description: Granularidade do período (diário, semanal ou mensal)
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
 *         description: Dados obtidos com sucesso
 *       400:
 *         description: Parâmetros inválidos
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/dashboard/orders-by-period', reportController.getOrdersByPeriod);

/**
 * @swagger
 * /reports/dashboard/product-status:
 *   get:
 *     summary: Obtém dados de status dos produtos para o gráfico
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: stockId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do estoque
 *     responses:
 *       200:
 *         description: Dados obtidos com sucesso
 *       400:
 *         description: Parâmetros inválidos
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/dashboard/product-status', reportController.getProductStatus);

/**
 * @swagger
 * /reports/dashboard/orders-by-section:
 *   get:
 *     summary: Obtém dados de pedidos por seção para o gráfico
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
 *         description: Dados obtidos com sucesso
 *       400:
 *         description: Parâmetros inválidos
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/dashboard/orders-by-section', reportController.getOrdersBySection);

/**
 * @swagger
 * /reports/dashboard/top-products:
 *   get:
 *     summary: Obtém dados dos produtos mais solicitados para o gráfico
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
 *         description: Dados obtidos com sucesso
 *       400:
 *         description: Parâmetros inválidos
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/dashboard/top-products', reportController.getTopProductsInOrders);

/**
 * @swagger
 * /reports/dashboard/stock-alerts:
 *   get:
 *     summary: Obtém dados de alertas de estoque para o gráfico
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: stockId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do estoque
 *     responses:
 *       200:
 *         description: Dados obtidos com sucesso
 *       400:
 *         description: Parâmetros inválidos
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/dashboard/stock-alerts', reportController.getStockAlerts);

/**
 * @swagger
 * /reports/dashboard/complete:
 *   get:
 *     summary: Obtém todos os dados de dashboards combinados
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: stockId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do estoque
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *           default: monthly
 *         description: Granularidade do período (diário, semanal ou mensal)
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
 *         description: Dados obtidos com sucesso
 *       400:
 *         description: Parâmetros inválidos
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/dashboard/complete', reportController.getCompleteDashboardData);

/**
 * @swagger
 * /reports/dashboard/complete/report:
 *   get:
 *     summary: Gera relatório completo com todos os dashboards em PDF ou Excel
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
 *         name: period
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *           default: monthly
 *         description: Granularidade do período (diário, semanal ou mensal)
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
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/dashboard/complete/report', reportController.generateCompleteDashboardReport);

export default router;