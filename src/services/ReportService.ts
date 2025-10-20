import { AppDataSource } from '../database/data-source';
import { Order } from '../database/entities/Order';
import { Stock } from '../database/entities/Stock';
import { Merchandise } from '../database/entities/Merchandise';
import { Section } from '../database/entities/Section';
import { OrderItem } from '../database/entities/OrderItem';
import { MerchandiseType } from '../database/entities/MerchandiseType';
import * as ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { MoreThanOrEqual, LessThanOrEqual, Between } from 'typeorm';

export interface ReportParams {
    stockId: string;
    startDate?: string;
    endDate?: string;
    includeOrders?: boolean;
    includeMerchandise?: boolean;
    includeStock?: boolean;
}

export interface DashboardSummary {
    stockInfo: {
        id: string;
        name: string;
        location: string;
    };
    totalOrders: number;
    totalMerchandise: number;
    totalOrderItems: number;
    ordersThisMonth: number;
    ordersByStatus: { [key: string]: number };
    merchandiseByType: { [key: string]: number };
    recentOrders: any[];
    topMerchandise: any[];
}

export class ReportService {
    private orderRepository = AppDataSource.getRepository(Order);
    private stockRepository = AppDataSource.getRepository(Stock);
    private merchandiseRepository = AppDataSource.getRepository(Merchandise);
    private sectionRepository = AppDataSource.getRepository(Section);
    private orderItemRepository = AppDataSource.getRepository(OrderItem);
    private merchandiseTypeRepository = AppDataSource.getRepository(MerchandiseType);

    async getDashboardSummary(params: ReportParams): Promise<DashboardSummary> {
        const { stockId, startDate, endDate } = params;

        // Buscar informações do estoque
        const stock = await this.stockRepository.findOne({
            where: { id: stockId }
        });

        if (!stock) {
            throw new Error('Stock not found');
        }

        // Criar filtros de data
        let dateFilter: any = {};
        if (startDate && endDate) {
            dateFilter.creationDate = Between(new Date(startDate), new Date(endDate));
        } else if (startDate) {
            dateFilter.creationDate = MoreThanOrEqual(new Date(startDate));
        } else if (endDate) {
            dateFilter.creationDate = LessThanOrEqual(new Date(endDate));
        }

        // Buscar dados dos pedidos
        const orderQueryOptions: any = { stock: { id: stockId } };
        if (Object.keys(dateFilter).length > 0) {
            orderQueryOptions.creationDate = dateFilter.creationDate;
        }

        const totalOrders = await this.orderRepository.count({
            where: orderQueryOptions
        });

        // Buscar total de mercadorias
        const merchandiseTypes = await this.merchandiseTypeRepository.find({
            where: { stock: { id: stockId } },
            relations: ['merchandises']
        });
        
        const totalMerchandise = merchandiseTypes.reduce((total, type) => {
            return total + (type.merchandises?.length || 0);
        }, 0);

        // Buscar pedidos do mês atual
        const currentMonth = new Date();
        currentMonth.setDate(1);
        currentMonth.setHours(0, 0, 0, 0);
        
        const ordersThisMonth = await this.orderRepository.count({
            where: {
                stock: { id: stockId },
                creationDate: MoreThanOrEqual(currentMonth)
            }
        });

        // Buscar pedidos por status
        const ordersWithStatus = await this.orderRepository.find({
            where: orderQueryOptions,
            select: ['status']
        });

        const ordersByStatus = ordersWithStatus.reduce((acc, order) => {
            acc[order.status] = (acc[order.status] || 0) + 1;
            return acc;
        }, {} as { [key: string]: number });

        // Buscar pedidos recentes
        const recentOrders = await this.orderRepository.find({
            where: { stock: { id: stockId } },
            relations: ['section', 'orderItems', 'orderItems.merchandiseType'],
            order: { creationDate: 'DESC' },
            take: 10
        });

        // Buscar itens de pedido para calcular total
        const totalOrderItems = await this.orderItemRepository.count({
            where: { order: { stock: { id: stockId } } }
        });

        // Buscar mercadorias por tipo
        const merchandiseTypesList = await this.merchandiseTypeRepository.find({
            where: { stock: { id: stockId } },
            relations: ['merchandises']
        });

        const merchandiseByType = merchandiseTypesList.reduce((acc, type) => {
            acc[type.name] = type.merchandises?.length || 0;
            return acc;
        }, {} as { [key: string]: number });

        // Buscar top mercadorias (mais utilizadas em pedidos)
        const topMerchandiseQuery = await this.orderItemRepository
            .createQueryBuilder('orderItem')
            .innerJoin('orderItem.merchandiseType', 'merchandiseType')
            .innerJoin('orderItem.order', 'order')
            .innerJoin('order.stock', 'stock')
            .select('merchandiseType.name', 'name')
            .addSelect('SUM(orderItem.quantity)', 'totalquantity')
            .where('stock.id = :stockId', { stockId })
            .groupBy('merchandiseType.id, merchandiseType.name')
            .orderBy('totalquantity', 'DESC')
            .limit(10)
            .getRawMany();

        return {
            stockInfo: {
                id: stock.id,
                name: stock.name,
                location: stock.location
            },
            totalOrders,
            totalMerchandise,
            totalOrderItems,
            ordersThisMonth,
            ordersByStatus,
            merchandiseByType,
            recentOrders: recentOrders.map(order => ({
                id: order.id,
                creationDate: order.creationDate,
                status: order.status,
                section: order.section?.name,
                itemsCount: order.orderItems?.length || 0
            })),
            topMerchandise: topMerchandiseQuery
        };
    }

    async generateExcelReport(params: ReportParams): Promise<Buffer> {
        const summary = await this.getDashboardSummary(params);
        
        const workbook = new ExcelJS.Workbook();
        
        // Aba resumo
        const summarySheet = workbook.addWorksheet('Resumo do Dashboard');
        
        // Cabeçalho
        summarySheet.addRow(['RELATÓRIO DO DASHBOARD']);
        summarySheet.addRow(['Gerado em:', new Date().toLocaleString('pt-BR')]);
        summarySheet.addRow(['Estoque:', summary.stockInfo.name]);
        summarySheet.addRow(['Localização:', summary.stockInfo.location]);
        summarySheet.addRow([]);
        
        // Métricas principais
        summarySheet.addRow(['MÉTRICAS PRINCIPAIS']);
        summarySheet.addRow(['Total de Pedidos:', summary.totalOrders]);
        summarySheet.addRow(['Total de Mercadorias:', summary.totalMerchandise]);
        summarySheet.addRow(['Total de Itens de Pedidos:', summary.totalOrderItems]);
        summarySheet.addRow(['Pedidos deste Mês:', summary.ordersThisMonth]);
        summarySheet.addRow([]);

        // Pedidos por status
        summarySheet.addRow(['PEDIDOS POR STATUS']);
        summarySheet.addRow(['Status', 'Quantidade']);
        Object.entries(summary.ordersByStatus).forEach(([status, count]) => {
            summarySheet.addRow([status, count]);
        });
        summarySheet.addRow([]);

        // Mercadorias por tipo
        summarySheet.addRow(['MERCADORIAS POR TIPO']);
        summarySheet.addRow(['Tipo', 'Quantidade']);
        Object.entries(summary.merchandiseByType).forEach(([type, count]) => {
            summarySheet.addRow([type, count]);
        });
        summarySheet.addRow([]);

        // Top mercadorias
        summarySheet.addRow(['TOP MERCADORIAS MAIS UTILIZADAS']);
        summarySheet.addRow(['Nome', 'Quantidade Total']);
        summary.topMerchandise.forEach(item => {
            summarySheet.addRow([item.name, item.totalquantity]);
        });

        // Aba de pedidos recentes
        if (params.includeOrders !== false) {
            const ordersSheet = workbook.addWorksheet('Pedidos Recentes');
            ordersSheet.addRow(['PEDIDOS RECENTES']);
            ordersSheet.addRow(['ID', 'Data de Criação', 'Status', 'Seção', 'Qtd Itens']);
            
            summary.recentOrders.forEach(order => {
                ordersSheet.addRow([
                    order.id,
                    new Date(order.creationDate).toLocaleDateString('pt-BR'),
                    order.status,
                    order.section || 'N/A',
                    order.itemsCount
                ]);
            });
        }

        // Aplicar formatação
        this.formatExcelSheet(summarySheet);
        
        return Buffer.from(await workbook.xlsx.writeBuffer());
    }

    async generatePDFReport(params: ReportParams): Promise<Buffer> {
        const summary = await this.getDashboardSummary(params);
        
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument();
                const buffers: Buffer[] = [];
                
                doc.on('data', buffers.push.bind(buffers));
                doc.on('end', () => {
                    const pdfBuffer = Buffer.concat(buffers);
                    resolve(pdfBuffer);
                });

                // Cabeçalho
                doc.fontSize(20).text('RELATÓRIO DO DASHBOARD', { align: 'center' });
                doc.moveDown();
                
                doc.fontSize(12);
                doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`);
                doc.text(`Estoque: ${summary.stockInfo.name}`);
                doc.text(`Localização: ${summary.stockInfo.location}`);
                doc.moveDown();

                // Métricas principais
                doc.fontSize(16).text('MÉTRICAS PRINCIPAIS');
                doc.fontSize(12);
                doc.text(`Total de Pedidos: ${summary.totalOrders}`);
                doc.text(`Total de Mercadorias: ${summary.totalMerchandise}`);
                doc.text(`Total de Itens de Pedidos: ${summary.totalOrderItems}`);
                doc.text(`Pedidos deste Mês: ${summary.ordersThisMonth}`);
                doc.moveDown();

                // Pedidos por status
                doc.fontSize(16).text('PEDIDOS POR STATUS');
                doc.fontSize(12);
                Object.entries(summary.ordersByStatus).forEach(([status, count]) => {
                    doc.text(`${status}: ${count}`);
                });
                doc.moveDown();

                // Mercadorias por tipo
                doc.fontSize(16).text('MERCADORIAS POR TIPO');
                doc.fontSize(12);
                Object.entries(summary.merchandiseByType).forEach(([type, count]) => {
                    doc.text(`${type}: ${count}`);
                });
                doc.moveDown();

                // Top mercadorias
                doc.fontSize(16).text('TOP MERCADORIAS MAIS UTILIZADAS');
                doc.fontSize(12);
                summary.topMerchandise.forEach((item, index) => {
                    doc.text(`${index + 1}. ${item.name}: ${item.totalquantity} unidades`);
                });

                // Pedidos recentes
                if (params.includeOrders !== false && summary.recentOrders.length > 0) {
                    doc.addPage();
                    doc.fontSize(16).text('PEDIDOS RECENTES');
                    doc.fontSize(10);
                    
                    summary.recentOrders.forEach(order => {
                        doc.text(`ID: ${order.id}`);
                        doc.text(`Data: ${new Date(order.creationDate).toLocaleDateString('pt-BR')}`);
                        doc.text(`Status: ${order.status}`);
                        doc.text(`Seção: ${order.section || 'N/A'}`);
                        doc.text(`Itens: ${order.itemsCount}`);
                        doc.text('---');
                    });
                }

                doc.end();
            } catch (error) {
                reject(error);
            }
        });
    }

    private formatExcelSheet(sheet: ExcelJS.Worksheet) {
        // Aplicar formatação básica
        sheet.getColumn(1).width = 30;
        sheet.getColumn(2).width = 20;
        
        // Formatar cabeçalhos
        sheet.getRow(1).font = { bold: true, size: 16 };
        sheet.getRow(6).font = { bold: true, size: 14 };
    }
}