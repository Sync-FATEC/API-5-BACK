import { Request, Response } from 'express';
import { ReportService } from '../services/ReportService';

const reportService = new ReportService();

export class ReportController {
    async generateDashboardReport(req: Request, res: Response) {
        try {
            const { format, stockId, startDate, endDate, includeOrders, includeMerchandise, includeStock } = req.query;
            
            // Validação dos parâmetros
            if (!format || !['pdf', 'excel'].includes(format as string)) {
                return res.status(400).json({ 
                    error: 'Format parameter is required and must be either "pdf" or "excel"' 
                });
            }

            if (!stockId) {
                return res.status(400).json({ 
                    error: 'Stock ID is required' 
                });
            }

            // Parâmetros do relatório
            const reportParams = {
                stockId: stockId as string,
                startDate: startDate as string,
                endDate: endDate as string,
                includeOrders: includeOrders === 'true',
                includeMerchandise: includeMerchandise === 'true',
                includeStock: includeStock === 'true'
            };

            if (format === 'pdf') {
                const pdfBuffer = await reportService.generatePDFReport(reportParams);
                
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename="dashboard-report-${new Date().toISOString().split('T')[0]}.pdf"`);
                
                return res.send(pdfBuffer);
            } else if (format === 'excel') {
                const excelBuffer = await reportService.generateExcelReport(reportParams);
                
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.setHeader('Content-Disposition', `attachment; filename="dashboard-report-${new Date().toISOString().split('T')[0]}.xlsx"`);
                
                return res.send(excelBuffer);
            }

        } catch (error) {
            console.error('Error generating report:', error);
            return res.status(500).json({ 
                error: 'Internal server error while generating report',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async getDashboardSummary(req: Request, res: Response) {
        try {
            const { stockId, startDate, endDate } = req.query;
            
            if (!stockId) {
                return res.status(400).json({ 
                    error: 'Stock ID is required' 
                });
            }

            const summary = await reportService.getDashboardSummary({
                stockId: stockId as string,
                startDate: startDate as string,
                endDate: endDate as string
            });

            return res.json({
                success: true,
                data: summary
            });

        } catch (error) {
            console.error('Error getting dashboard summary:', error);
            return res.status(500).json({ 
                error: 'Internal server error while getting dashboard summary',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    
    // Endpoints para os dashboards específicos
    
    /**
     * Obtém dados para o gráfico de pedidos por período
     */
    async getOrdersByPeriod(req: Request, res: Response) {
        try {
            const { stockId, startDate, endDate, period } = req.query;
            
            if (!stockId) {
                return res.status(400).json({ 
                    error: 'Stock ID is required' 
                });
            }

            const data = await reportService.getOrdersByPeriod({
                stockId: stockId as string,
                startDate: startDate as string,
                endDate: endDate as string,
                period: period as 'daily' | 'weekly' | 'monthly'
            });

            return res.json({
                success: true,
                data
            });

        } catch (error) {
            console.error('Error getting orders by period:', error);
            return res.status(500).json({ 
                error: 'Internal server error while getting orders by period data',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    
    /**
     * Obtém dados para o gráfico de status de produtos
     */
    async getProductStatus(req: Request, res: Response) {
        try {
            const { stockId } = req.query;
            
            if (!stockId) {
                return res.status(400).json({ 
                    error: 'Stock ID is required' 
                });
            }

            const data = await reportService.getProductStatusData({
                stockId: stockId as string
            });

            return res.json({
                success: true,
                data
            });

        } catch (error) {
            console.error('Error getting product status:', error);
            return res.status(500).json({ 
                error: 'Internal server error while getting product status data',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    
    /**
     * Obtém dados para o gráfico de pedidos por seção
     */
    async getOrdersBySection(req: Request, res: Response) {
        try {
            const { stockId, startDate, endDate } = req.query;
            
            if (!stockId) {
                return res.status(400).json({ 
                    error: 'Stock ID is required' 
                });
            }

            const data = await reportService.getOrdersBySection({
                stockId: stockId as string,
                startDate: startDate as string,
                endDate: endDate as string
            });

            return res.json({
                success: true,
                data
            });

        } catch (error) {
            console.error('Error getting orders by section:', error);
            return res.status(500).json({ 
                error: 'Internal server error while getting orders by section data',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    
    /**
     * Obtém dados para o gráfico de produtos mais solicitados em pedidos
     */
    async getTopProductsInOrders(req: Request, res: Response) {
        try {
            const { stockId, startDate, endDate } = req.query;
            
            if (!stockId) {
                return res.status(400).json({ 
                    error: 'Stock ID is required' 
                });
            }

            const data = await reportService.getTopProductsInOrders({
                stockId: stockId as string,
                startDate: startDate as string,
                endDate: endDate as string
            });

            return res.json({
                success: true,
                data
            });

        } catch (error) {
            console.error('Error getting top products in orders:', error);
            return res.status(500).json({ 
                error: 'Internal server error while getting top products data',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    
    /**
     * Obtém dados para o gráfico de alertas de estoque
     */
    async getStockAlerts(req: Request, res: Response) {
        try {
            const { stockId } = req.query;
            
            if (!stockId) {
                return res.status(400).json({ 
                    error: 'Stock ID is required' 
                });
            }

            const data = await reportService.getStockAlerts({
                stockId: stockId as string
            });

            return res.json({
                success: true,
                data
            });

        } catch (error) {
            console.error('Error getting stock alerts:', error);
            return res.status(500).json({ 
                error: 'Internal server error while getting stock alerts data',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    
    /**
     * Obtém todos os dados de dashboards combinados
     */
    async getCompleteDashboardData(req: Request, res: Response) {
        try {
            const { stockId, startDate, endDate, period } = req.query;
            
            if (!stockId) {
                return res.status(400).json({ 
                    error: 'Stock ID is required' 
                });
            }

            const data = await reportService.getCompleteDashboardData({
                stockId: stockId as string,
                startDate: startDate as string,
                endDate: endDate as string,
                period: period as 'daily' | 'weekly' | 'monthly'
            });

            return res.json({
                success: true,
                data
            });

        } catch (error) {
            console.error('Error getting complete dashboard data:', error);
            return res.status(500).json({ 
                error: 'Internal server error while getting complete dashboard data',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    
    /**
     * Gera relatório completo com todos os dashboards
     */
    async generateCompleteDashboardReport(req: Request, res: Response) {
        try {
            const { format, stockId, startDate, endDate, period } = req.query;
            
            if (!format || !['pdf', 'excel'].includes(format as string)) {
                return res.status(400).json({ 
                    error: 'Format parameter is required and must be either "pdf" or "excel"' 
                });
            }

            if (!stockId) {
                return res.status(400).json({ 
                    error: 'Stock ID is required' 
                });
            }

            const reportParams = {
                stockId: stockId as string,
                startDate: startDate as string,
                endDate: endDate as string,
                period: period as 'daily' | 'weekly' | 'monthly'
            };

            if (format === 'pdf') {
                const pdfBuffer = await reportService.generateCompleteDashboardPDFReport(reportParams);
                
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename="complete-dashboard-report-${new Date().toISOString().split('T')[0]}.pdf"`);
                
                return res.send(pdfBuffer);
            } else if (format === 'excel') {
                const excelBuffer = await reportService.generateCompleteDashboardExcelReport(reportParams);
                
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.setHeader('Content-Disposition', `attachment; filename="complete-dashboard-report-${new Date().toISOString().split('T')[0]}.xlsx"`);
                
                return res.send(excelBuffer);
            }
        } catch (error) {
            console.error('Error generating complete dashboard report:', error);
            return res.status(500).json({ 
                error: 'Internal server error while generating complete dashboard report',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}