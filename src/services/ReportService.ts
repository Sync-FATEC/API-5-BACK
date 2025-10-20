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
    period?: 'daily' | 'weekly' | 'monthly';
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

export interface OrdersByPeriodData {
    period: string; // Nome do período (data, semana ou mês)
    count: number;  // Quantidade de pedidos
}

export interface ProductStatusData {
    total: number;
    inStock: number;
    lowStock: number;
    critical: number;
    byType: {
        typeName: string;
        total: number;
        inStock: number;
        lowStock: number;
        critical: number;
    }[];
}

export interface OrdersBySectionData {
    sectionId: string;
    sectionName: string;
    orderCount: number;
    percentage: number; // Percentual do total de pedidos
}

export interface TopProductsInOrdersData {
    merchandiseTypeId: string;
    name: string;
    totalQuantity: number;
    orderCount: number; // Número de pedidos em que aparece
}

export interface StockAlertData {
    merchandiseTypeId: string;
    name: string;
    inStock: number;
    minimumStock: number;
    status: 'normal' | 'low' | 'critical'; // normal = ok, low = baixo, critical = crítico
}

export interface CompleteDashboardData {
    stockInfo: {
        id: string;
        name: string;
        location: string;
    };
    ordersByPeriod: OrdersByPeriodData[];
    productStatus: ProductStatusData;
    ordersBySection: OrdersBySectionData[];
    topProducts: TopProductsInOrdersData[];
    stockAlerts: StockAlertData[];
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
    
    // Novos métodos para os dashboards específicos
    
    /**
     * Obtém dados de pedidos por período (diário, semanal ou mensal)
     */
    async getOrdersByPeriod(params: ReportParams): Promise<OrdersByPeriodData[]> {
        const { stockId, startDate, endDate, period = 'monthly' } = params;
        
        // Definir datas de início e fim
        let start: Date, end: Date;
        
        if (startDate && endDate) {
            start = new Date(startDate);
            end = new Date(endDate);
        } else {
            // Padrão: últimos 6 meses
            end = new Date();
            start = new Date();
            start.setMonth(end.getMonth() - 6);
        }
        
        // Buscar todos os pedidos no período
        const orders = await this.orderRepository.find({
            where: {
                stock: { id: stockId },
                creationDate: Between(start, end)
            },
            select: ['creationDate']
        });
        
        // Agrupar por período
        const results: OrdersByPeriodData[] = [];
        
        if (period === 'daily') {
            // Agrupar por dia
            const dailyMap = new Map<string, number>();
            
            orders.forEach(order => {
                const date = order.creationDate.toISOString().split('T')[0]; // YYYY-MM-DD
                dailyMap.set(date, (dailyMap.get(date) || 0) + 1);
            });
            
            // Converter para array
            dailyMap.forEach((count, date) => {
                results.push({ period: date, count });
            });
        } else if (period === 'weekly') {
            // Agrupar por semana (usando ano-semana: YYYY-WW)
            const weeklyMap = new Map<string, number>();
            
            orders.forEach(order => {
                const date = new Date(order.creationDate);
                const year = date.getFullYear();
                // Método para calcular o número da semana do ano
                const weekNumber = this.getWeekNumber(date);
                const weekKey = `${year}-W${weekNumber.toString().padStart(2, '0')}`;
                
                weeklyMap.set(weekKey, (weeklyMap.get(weekKey) || 0) + 1);
            });
            
            // Converter para array
            weeklyMap.forEach((count, weekKey) => {
                results.push({ period: weekKey, count });
            });
        } else {
            // Agrupar por mês (formato: YYYY-MM)
            const monthlyMap = new Map<string, number>();
            
            orders.forEach(order => {
                const date = new Date(order.creationDate);
                const year = date.getFullYear();
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                const monthKey = `${year}-${month}`;
                
                monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + 1);
            });
            
            // Converter para array
            monthlyMap.forEach((count, monthKey) => {
                results.push({ period: monthKey, count });
            });
        }
        
        // Ordenar por período
        return results.sort((a, b) => a.period.localeCompare(b.period));
    }
    
    /**
     * Obtém dados sobre o status dos produtos no estoque
     */
    async getProductStatusData(params: ReportParams): Promise<ProductStatusData> {
        const { stockId } = params;
        
        // Buscar todos os tipos de mercadorias e suas mercadorias
        const merchandiseTypes = await this.merchandiseTypeRepository.find({
            where: { stock: { id: stockId } },
            relations: ['merchandises']
        });
        
        let total = 0;
        let inStock = 0;
        let lowStock = 0;
        let critical = 0;
        
        const byType: ProductStatusData['byType'] = [];
        
        // Para cada tipo, calcular métricas
        for (const type of merchandiseTypes) {
            const typeTotal = type.merchandises?.length || 0;
            const typeInStock = type.merchandises?.filter(m => m.quantity > type.minimumStock).length || 0;
            const typeLowStock = type.merchandises?.filter(m => m.quantity <= type.minimumStock && m.quantity > 0).length || 0;
            const typeCritical = type.merchandises?.filter(m => m.quantity === 0).length || 0;
            
            total += typeTotal;
            inStock += typeInStock;
            lowStock += typeLowStock;
            critical += typeCritical;
            
            byType.push({
                typeName: type.name,
                total: typeTotal,
                inStock: typeInStock,
                lowStock: typeLowStock,
                critical: typeCritical
            });
        }
        
        return {
            total,
            inStock,
            lowStock,
            critical,
            byType
        };
    }
    
    /**
     * Obtém dados de pedidos agrupados por seção
     */
    async getOrdersBySection(params: ReportParams): Promise<OrdersBySectionData[]> {
        const { stockId, startDate, endDate } = params;
        
        let dateFilter: any = {};
        if (startDate && endDate) {
            dateFilter.creationDate = Between(new Date(startDate), new Date(endDate));
        } else if (startDate) {
            dateFilter.creationDate = MoreThanOrEqual(new Date(startDate));
        } else if (endDate) {
            dateFilter.creationDate = LessThanOrEqual(new Date(endDate));
        }
        
        // Buscar total de pedidos
        const orderQueryOptions: any = { stock: { id: stockId } };
        if (Object.keys(dateFilter).length > 0) {
            orderQueryOptions.creationDate = dateFilter.creationDate;
        }
        
        const totalOrders = await this.orderRepository.count({
            where: orderQueryOptions
        });
        
        // Buscar pedidos por seção
        const ordersBySectionQuery = await this.orderRepository
            .createQueryBuilder('order')
            .innerJoin('order.section', 'section')
            .select('section.id', 'sectionId')
            .addSelect('section.name', 'sectionName')
            .addSelect('COUNT(order.id)', 'orderCount')
            .where('order.stockId = :stockId', { stockId })
            .groupBy('section.id, section.name')
            .orderBy('orderCount', 'DESC')
            .getRawMany();
            
        // Calcular percentuais
        return ordersBySectionQuery.map(item => ({
            sectionId: item.sectionId,
            sectionName: item.sectionName,
            orderCount: parseInt(item.orderCount),
            percentage: totalOrders > 0 ? (parseInt(item.orderCount) / totalOrders) * 100 : 0
        }));
    }
    
    /**
     * Obtém dados dos produtos mais solicitados nos pedidos
     */
    async getTopProductsInOrders(params: ReportParams): Promise<TopProductsInOrdersData[]> {
        const { stockId, startDate, endDate } = params;
        
        let dateFilter: any = {};
        if (startDate && endDate) {
            dateFilter.creationDate = Between(new Date(startDate), new Date(endDate));
        } else if (startDate) {
            dateFilter.creationDate = MoreThanOrEqual(new Date(startDate));
        } else if (endDate) {
            dateFilter.creationDate = LessThanOrEqual(new Date(endDate));
        }
        
        // Buscar top produtos por quantidade
        const topProductsQuery = await this.orderItemRepository
            .createQueryBuilder('orderItem')
            .innerJoin('orderItem.merchandiseType', 'merchandiseType')
            .innerJoin('orderItem.order', 'order')
            .innerJoin('order.stock', 'stock')
            .select('merchandiseType.id', 'merchandiseTypeId')
            .addSelect('merchandiseType.name', 'name')
            .addSelect('SUM(orderItem.quantity)', 'totalQuantity')
            .addSelect('COUNT(DISTINCT order.id)', 'orderCount')
            .where('stock.id = :stockId', { stockId })
            .groupBy('merchandiseType.id, merchandiseType.name')
            .orderBy('totalQuantity', 'DESC')
            .limit(20)
            .getRawMany();
        
        return topProductsQuery.map(item => ({
            merchandiseTypeId: item.merchandiseTypeId,
            name: item.name,
            totalQuantity: parseInt(item.totalQuantity),
            orderCount: parseInt(item.orderCount)
        }));
    }
    
    /**
     * Obtém dados de alertas de estoque (itens críticos ou abaixo do mínimo)
     */
    async getStockAlerts(params: ReportParams): Promise<StockAlertData[]> {
        const { stockId } = params;
        
        // Buscar tipos de mercadoria e suas quantidades em estoque
        const merchandiseTypes = await this.merchandiseTypeRepository.find({
            where: { stock: { id: stockId } },
            relations: ['merchandises']
        });
        
        const alerts: StockAlertData[] = [];
        
        // Para cada tipo, calcular status do estoque
        for (const type of merchandiseTypes) {
            const totalQuantity = type.merchandises?.reduce((sum, m) => sum + m.quantity, 0) || 0;
            
            let status: 'normal' | 'low' | 'critical' = 'normal';
            
            if (totalQuantity === 0) {
                status = 'critical';
            } else if (totalQuantity <= type.minimumStock) {
                status = 'low';
            }
            
            // Incluir apenas itens com alerta (críticos ou baixos)
            if (status !== 'normal') {
                alerts.push({
                    merchandiseTypeId: type.id,
                    name: type.name,
                    inStock: totalQuantity,
                    minimumStock: type.minimumStock,
                    status
                });
            }
        }
        
        // Ordenar por status (críticos primeiro) e depois por nome
        return alerts.sort((a, b) => {
            if (a.status === 'critical' && b.status !== 'critical') return -1;
            if (a.status !== 'critical' && b.status === 'critical') return 1;
            return a.name.localeCompare(b.name);
        });
    }
    
    /**
     * Obtém dados completos para o dashboard geral
     */
    async getCompleteDashboardData(params: ReportParams): Promise<CompleteDashboardData> {
        const { stockId } = params;
        
        // Buscar informações do estoque
        const stock = await this.stockRepository.findOne({
            where: { id: stockId }
        });

        if (!stock) {
            throw new Error('Stock not found');
        }
        
        // Buscar todos os dados necessários em paralelo
        const [
            ordersByPeriod,
            productStatus,
            ordersBySection,
            topProducts,
            stockAlerts
        ] = await Promise.all([
            this.getOrdersByPeriod(params),
            this.getProductStatusData(params),
            this.getOrdersBySection(params),
            this.getTopProductsInOrders(params),
            this.getStockAlerts(params)
        ]);
        
        return {
            stockInfo: {
                id: stock.id,
                name: stock.name,
                location: stock.location
            },
            ordersByPeriod,
            productStatus,
            ordersBySection,
            topProducts,
            stockAlerts
        };
    }
    
    /**
     * Gera um relatório completo em Excel com todos os dados dos dashboards
     */
    async generateCompleteDashboardExcelReport(params: ReportParams): Promise<Buffer> {
        const dashboardData = await this.getCompleteDashboardData(params);
        
        const workbook = new ExcelJS.Workbook();
        
        // Adicionar aba de resumo
        const summarySheet = workbook.addWorksheet('Resumo Geral');
        
        // Cabeçalho
        summarySheet.addRow(['RELATÓRIO COMPLETO DO DASHBOARD']);
        summarySheet.addRow(['Gerado em:', new Date().toLocaleString('pt-BR')]);
        summarySheet.addRow(['Estoque:', dashboardData.stockInfo.name]);
        summarySheet.addRow(['Localização:', dashboardData.stockInfo.location]);
        summarySheet.addRow([]);
        
        // Adicionar aba de pedidos por período
        const ordersPeriodSheet = workbook.addWorksheet('Pedidos por Período');
        ordersPeriodSheet.addRow(['PEDIDOS POR PERÍODO']);
        ordersPeriodSheet.addRow(['Período', 'Quantidade de Pedidos']);
        
        dashboardData.ordersByPeriod.forEach(item => {
            ordersPeriodSheet.addRow([item.period, item.count]);
        });
        
        // Adicionar aba de status de produtos
        const productStatusSheet = workbook.addWorksheet('Status de Produtos');
        productStatusSheet.addRow(['STATUS DE PRODUTOS']);
        productStatusSheet.addRow(['Tipo', 'Total', 'Em Estoque', 'Estoque Baixo', 'Crítico']);
        
        dashboardData.productStatus.byType.forEach(item => {
            productStatusSheet.addRow([
                item.typeName,
                item.total,
                item.inStock,
                item.lowStock,
                item.critical
            ]);
        });
        
        productStatusSheet.addRow([]);
        productStatusSheet.addRow(['TOTAL GERAL', 
            dashboardData.productStatus.total,
            dashboardData.productStatus.inStock,
            dashboardData.productStatus.lowStock,
            dashboardData.productStatus.critical
        ]);
        
        // Adicionar aba de pedidos por seção
        const ordersSectionSheet = workbook.addWorksheet('Pedidos por Seção');
        ordersSectionSheet.addRow(['PEDIDOS POR SEÇÃO']);
        ordersSectionSheet.addRow(['Seção', 'Quantidade de Pedidos', 'Percentual (%)']);
        
        dashboardData.ordersBySection.forEach(item => {
            ordersSectionSheet.addRow([
                item.sectionName,
                item.orderCount,
                item.percentage.toFixed(2)
            ]);
        });
        
        // Adicionar aba de produtos mais solicitados
        const topProductsSheet = workbook.addWorksheet('Produtos Mais Solicitados');
        topProductsSheet.addRow(['PRODUTOS MAIS SOLICITADOS EM PEDIDOS']);
        topProductsSheet.addRow(['Nome', 'Quantidade Total', 'Aparece em Pedidos']);
        
        dashboardData.topProducts.forEach(item => {
            topProductsSheet.addRow([
                item.name,
                item.totalQuantity,
                item.orderCount
            ]);
        });
        
        // Adicionar aba de alertas de estoque
        const alertsSheet = workbook.addWorksheet('Alertas de Estoque');
        alertsSheet.addRow(['ALERTAS DE ESTOQUE']);
        alertsSheet.addRow(['Produto', 'Quantidade em Estoque', 'Estoque Mínimo', 'Status']);
        
        dashboardData.stockAlerts.forEach(item => {
            alertsSheet.addRow([
                item.name,
                item.inStock,
                item.minimumStock,
                item.status === 'critical' ? 'CRÍTICO' : 'BAIXO'
            ]);
        });
        
        // Aplicar formatação básica
        this.formatExcelSheet(summarySheet);
        this.formatExcelSheet(ordersPeriodSheet);
        this.formatExcelSheet(productStatusSheet);
        this.formatExcelSheet(ordersSectionSheet);
        this.formatExcelSheet(topProductsSheet);
        this.formatExcelSheet(alertsSheet);
        
        return Buffer.from(await workbook.xlsx.writeBuffer());
    }
    
    /**
     * Gera um relatório completo em PDF com todos os dados dos dashboards
     */
    async generateCompleteDashboardPDFReport(params: ReportParams): Promise<Buffer> {
        const dashboardData = await this.getCompleteDashboardData(params);
        
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
                doc.fontSize(20).text('RELATÓRIO COMPLETO DO DASHBOARD', { align: 'center' });
                doc.moveDown();
                
                doc.fontSize(12);
                doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`);
                doc.text(`Estoque: ${dashboardData.stockInfo.name}`);
                doc.text(`Localização: ${dashboardData.stockInfo.location}`);
                doc.moveDown();
                
                // Pedidos por período
                doc.fontSize(16).text('PEDIDOS POR PERÍODO');
                doc.fontSize(12);
                dashboardData.ordersByPeriod.forEach(item => {
                    doc.text(`${item.period}: ${item.count} pedidos`);
                });
                doc.moveDown();
                
                // Status de produtos
                doc.fontSize(16).text('STATUS DE PRODUTOS');
                doc.fontSize(12);
                doc.text(`Total: ${dashboardData.productStatus.total}`);
                doc.text(`Em Estoque (Normal): ${dashboardData.productStatus.inStock}`);
                doc.text(`Estoque Baixo: ${dashboardData.productStatus.lowStock}`);
                doc.text(`Crítico: ${dashboardData.productStatus.critical}`);
                doc.moveDown();
                
                // Pedidos por seção
                doc.addPage();
                doc.fontSize(16).text('PEDIDOS POR SEÇÃO');
                doc.fontSize(12);
                dashboardData.ordersBySection.forEach(item => {
                    doc.text(`${item.sectionName}: ${item.orderCount} pedidos (${item.percentage.toFixed(2)}%)`);
                });
                doc.moveDown();
                
                // Produtos mais solicitados
                doc.fontSize(16).text('PRODUTOS MAIS SOLICITADOS');
                doc.fontSize(12);
                dashboardData.topProducts.slice(0, 10).forEach((item, index) => {
                    doc.text(`${index + 1}. ${item.name}: ${item.totalQuantity} unidades (${item.orderCount} pedidos)`);
                });
                doc.moveDown();
                
                // Alertas de estoque
                doc.addPage();
                doc.fontSize(16).text('ALERTAS DE ESTOQUE');
                doc.fontSize(12);
                dashboardData.stockAlerts.forEach(item => {
                    const status = item.status === 'critical' ? 'CRÍTICO' : 'BAIXO';
                    doc.text(`${item.name}: ${item.inStock}/${item.minimumStock} - ${status}`);
                });
                
                doc.end();
            } catch (error) {
                reject(error);
            }
        });
    }
    
    // Método auxiliar para obter o número da semana do ano
    private getWeekNumber(d: Date): number {
        d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    }
}