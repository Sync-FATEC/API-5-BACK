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
}