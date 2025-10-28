import { AppDataSource } from '../database/data-source';
import { Order } from '../database/entities/Order';
import { Stock } from '../database/entities/Stock';
import { Merchandise } from '../database/entities/Merchandise';
import { Section } from '../database/entities/Section';
import { OrderItem } from '../database/entities/OrderItem';
import { MerchandiseType } from '../database/entities/MerchandiseType';
import { OrderViewModel } from '../types/OrderSectionDTO';
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

export interface OrdersByPeriodData {
    orders: OrderViewModel[]; // Lista completa de pedidos no período
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
    ordersByPeriod: OrdersByPeriodData;
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
                const doc = new PDFDocument({ margin: 50 });
                const buffers: Buffer[] = [];

                doc.on('data', buffers.push.bind(buffers));
                doc.on('end', () => {
                    const pdfBuffer = Buffer.concat(buffers);
                    resolve(pdfBuffer);
                });

                // Função auxiliar para verificar se precisa de nova página
                const checkPageBreak = (spaceNeeded: number = 80) => {
                    if (doc.y + spaceNeeded > 750) { // 750 é aproximadamente onde a página acaba
                        doc.addPage();
                    }
                };

                // Cabeçalho
                doc.fontSize(20).text('RELATÓRIO DO DASHBOARD', { align: 'center' });
                doc.moveDown();

                doc.fontSize(12);
                doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`);
                doc.text(`Estoque: ${summary.stockInfo.name}`);
                doc.text(`Localização: ${summary.stockInfo.location}`);
                doc.moveDown();

                // Métricas principais
                checkPageBreak(120);
                doc.fontSize(16).text('MÉTRICAS PRINCIPAIS');
                doc.fontSize(12);
                doc.text(`Total de Pedidos: ${summary.totalOrders}`);
                doc.text(`Total de Mercadorias: ${summary.totalMerchandise}`);
                doc.text(`Total de Itens de Pedidos: ${summary.totalOrderItems}`);
                doc.text(`Pedidos deste Mês: ${summary.ordersThisMonth}`);
                doc.moveDown();

                // Pedidos por status
                checkPageBreak(60 + Object.keys(summary.ordersByStatus).length * 15);
                doc.fontSize(16).text('PEDIDOS POR STATUS');
                doc.fontSize(12);
                Object.entries(summary.ordersByStatus).forEach(([status, count]) => {
                    doc.text(`${status}: ${count}`);
                });
                doc.moveDown();

                // Mercadorias por tipo
                checkPageBreak(60 + Object.keys(summary.merchandiseByType).length * 15);
                doc.fontSize(16).text('MERCADORIAS POR TIPO');
                doc.fontSize(12);
                Object.entries(summary.merchandiseByType).forEach(([type, count]) => {
                    doc.text(`${type}: ${count}`);
                });
                doc.moveDown();

                // Top mercadorias
                checkPageBreak(60 + summary.topMerchandise.length * 15);
                doc.fontSize(16).text('TOP MERCADORIAS MAIS UTILIZADAS');
                doc.fontSize(12);
                summary.topMerchandise.forEach((item, index) => {
                    doc.text(`${index + 1}. ${item.name}: ${item.totalquantity} unidades`);
                });

                // Pedidos recentes
                if (params.includeOrders !== false && summary.recentOrders.length > 0) {
                    checkPageBreak(200);
                    doc.fontSize(16).text('PEDIDOS RECENTES');
                    doc.fontSize(10);

                    summary.recentOrders.forEach(order => {
                        checkPageBreak(80); // Espaço para cada pedido
                        
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

    /**
     * Obtém dados de pedidos por período (diário, semanal ou mensal)
     */
    async getOrdersByPeriod(params: ReportParams): Promise<OrdersByPeriodData> {
        const { stockId, startDate, endDate } = params;

        const where: any = { stock: { id: stockId }, isActive: true };
        if (startDate && endDate) {
            where.creationDate = Between(new Date(startDate), new Date(endDate));
        } else if (startDate) {
            where.creationDate = MoreThanOrEqual(new Date(startDate));
        } else if (endDate) {
            where.creationDate = LessThanOrEqual(new Date(endDate));
        }

        const orders = await this.orderRepository.find({
            where,
            relations: ['orderItems', 'orderItems.merchandiseType', 'section'],
            order: { creationDate: 'DESC' }
        });

        const orderViewModels: OrderViewModel[] = orders.map(order => ({
            id: order.id,
            creationDate: order.creationDate,
            withdrawalDate: order.withdrawalDate,
            status: order.status,
            sectionId: order.section?.id ?? '',
            sectionName: order.section?.name ?? '',
            orderItems: order.orderItems.map(item => ({
                id: item.id,
                quantity: item.quantity,
                merchandiseId: item.merchandiseType?.id ?? '',
                merchandiseName: item.merchandiseType?.name ?? ''
            }))
        }));

        return { orders: orderViewModels };
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
        let ordersBySectionQuery = this.orderRepository
            .createQueryBuilder('order')
            .innerJoin('order.section', 'section')
            .select('section.id', 'sectionId')
            .addSelect('section.name', 'sectionName')
            .addSelect('COUNT(order.id)', 'orderCount')
            .where('order.stockId = :stockId', { stockId })
            .groupBy('section.id, section.name')
            .orderBy('"orderCount"', 'DESC');

        // Aplicar filtros de data se fornecidos
        if (startDate && endDate) {
            ordersBySectionQuery = ordersBySectionQuery.andWhere('order.creationDate BETWEEN :startDate AND :endDate', {
                startDate: new Date(startDate),
                endDate: new Date(endDate)
            });
        } else if (startDate) {
            ordersBySectionQuery = ordersBySectionQuery.andWhere('order.creationDate >= :startDate', {
                startDate: new Date(startDate)
            });
        } else if (endDate) {
            ordersBySectionQuery = ordersBySectionQuery.andWhere('order.creationDate <= :endDate', {
                endDate: new Date(endDate)
            });
        }

        const ordersBySectionResult = await ordersBySectionQuery.getRawMany();

        // Calcular percentuais
        return ordersBySectionResult.map(item => ({
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
        let topProductsQuery = this.orderItemRepository
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
            .orderBy('"totalQuantity"', 'DESC')
            .limit(20);

        // Aplicar filtros de data se fornecidos
        if (startDate && endDate) {
            topProductsQuery = topProductsQuery.andWhere('order.creationDate BETWEEN :startDate AND :endDate', {
                startDate: new Date(startDate),
                endDate: new Date(endDate)
            });
        } else if (startDate) {
            topProductsQuery = topProductsQuery.andWhere('order.creationDate >= :startDate', {
                startDate: new Date(startDate)
            });
        } else if (endDate) {
            topProductsQuery = topProductsQuery.andWhere('order.creationDate <= :endDate', {
                endDate: new Date(endDate)
            });
        }

        const topProductsResult = await topProductsQuery.getRawMany();

        return topProductsResult.map(item => ({
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
        ordersPeriodSheet.addRow(['ID', 'Data de Criação', 'Data de Retirada', 'Status', 'Seção', 'Itens']);

        dashboardData.ordersByPeriod.orders.forEach((order: OrderViewModel) => {
            const itemsText = order.orderItems.map(item => `${item.merchandiseName} (${item.quantity})`).join(', ');
            ordersPeriodSheet.addRow([
                order.id,
                order.creationDate,
                order.withdrawalDate || 'N/A',
                order.status,
                order.sectionName,
                itemsText
            ]);
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

 async generateCompleteDashboardPDFReport(params: ReportParams): Promise<Buffer> {
    const dashboardData = await this.getCompleteDashboardData(params);

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        // 🎨 Paleta de cores
        const colors = {
          primary: '#2E78E4',
          green: '#00C896',
          red: '#DC3A3A',
          orange: '#FFA800',
          gray: '#828488',
          lightGray: '#EAEAEA',
        };

        // Função auxiliar para verificar se precisa de nova página
        const checkPageBreak = (spaceNeeded: number = 100) => {
          if (doc.y + spaceNeeded > 750) { // 750 é aproximadamente onde a página acaba
            doc.addPage();
          }
        };

        // ==================================================
        // 🔹 Cabeçalho
        // ==================================================
        doc
          .fillColor(colors.primary)
          .fontSize(24)
          .font('Helvetica-Bold')
          .text('RELATÓRIO COMPLETO DO DASHBOARD', { align: 'center' })
          .moveDown(1);

        doc
          .moveTo(50, doc.y)
          .lineTo(550, doc.y)
          .strokeColor(colors.primary)
          .lineWidth(1.5)
          .stroke()
          .moveDown(1.5);

        doc
          .fontSize(12)
          .fillColor(colors.gray)
          .font('Helvetica')
          .text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`)
          .text(`Estoque: ${dashboardData.stockInfo.name}`)
          .text(`Localização: ${dashboardData.stockInfo.location}`)
          .moveDown(2);

        // ==================================================
        // 🧾 STATUS DE PRODUTOS
        // ==================================================
        checkPageBreak(150);
        this.sectionTitle(doc, 'STATUS DE PRODUTOS', colors.primary);
        const status = dashboardData.productStatus;
        this.addMetric(doc, 'Total de Produtos', status.total, colors.primary);
        this.addMetric(doc, 'Em Estoque (Normal)', status.inStock, colors.green);
        this.addMetric(doc, 'Estoque Baixo', status.lowStock, colors.orange);
        this.addMetric(doc, 'Crítico', status.critical, colors.red);

        doc.moveDown(2);

        // ==================================================
        // 🏬 PEDIDOS POR SEÇÃO
        // ==================================================
        checkPageBreak(200);
        this.sectionTitle(doc, 'PEDIDOS POR SEÇÃO', colors.primary);
        doc.font('Helvetica').fontSize(12).fillColor(colors.gray);

        dashboardData.ordersBySection.forEach((item) => {
          checkPageBreak(40); // Espaço necessário para cada item
          
          const barWidth = Math.min(item.percentage * 4, 400);
          const y = doc.y;

          doc.text(`${item.sectionName}: ${item.orderCount} pedidos (${item.percentage.toFixed(1)}%)`, 50, y);
          doc
            .rect(50, y + 15, barWidth, 6)
            .fillColor(colors.primary)
            .fill();
          doc.moveDown(1);
        });

        doc.moveDown(1);

        // ==================================================
        // 🥇 TOP PRODUTOS MAIS SOLICITADOS
        // ==================================================
        checkPageBreak(200);
        this.sectionTitle(doc, 'TOP 10 PRODUTOS MAIS SOLICITADOS', colors.primary);
        
        dashboardData.topProducts.slice(0, 10).forEach((item, index) => {
          checkPageBreak(50); // Espaço necessário para cada produto
          
          doc
            .font('Helvetica-Bold')
            .fontSize(12)
            .fillColor(colors.primary)
            .text(`${index + 1}. ${item.name}`)
            .moveDown(0.2);

          doc
            .font('Helvetica')
            .fontSize(10)
            .fillColor(colors.gray)
            .text(`${item.totalQuantity} unidades — ${item.orderCount} pedidos`)
            .moveDown(0.5);
        });

        doc.moveDown(1);

        // ==================================================
        // 🚨 ALERTAS DE ESTOQUE
        // ==================================================
        checkPageBreak(150);
        this.sectionTitle(doc, 'ALERTAS DE ESTOQUE', colors.primary);

        dashboardData.stockAlerts.forEach((item) => {
          checkPageBreak(60); // Espaço necessário para cada alerta
          
          const isCritical = item.status === 'critical';
          const statusLabel = isCritical ? 'CRÍTICO' : 'BAIXO';
          const statusColor = isCritical ? colors.red : colors.orange;

          doc
            .font('Helvetica-Bold')
            .fontSize(12)
            .fillColor(statusColor)
            .text(item.name)
            .moveDown(0.2);

          doc
            .font('Helvetica')
            .fontSize(10)
            .fillColor(colors.gray)
            .text(`Em estoque: ${item.inStock}/${item.minimumStock} — ${statusLabel}`)
            .moveDown(0.6);

          doc
            .moveTo(50, doc.y)
            .lineTo(550, doc.y)
            .strokeColor(colors.lightGray)
            .lineWidth(0.5)
            .stroke()
            .moveDown(0.8);
        });

        // ==================================================
        // 🧩 Rodapé
        // ==================================================
        doc.moveDown(2);
        doc
          .fontSize(10)
          .fillColor(colors.gray)
          .text('Relatório completo gerado automaticamente pelo sistema API 2025', {
            align: 'center',
          });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  // ==================================================
  // 🔧 Métodos auxiliares
  // ==================================================

  private sectionTitle(doc: PDFKit.PDFDocument, title: string, color: string) {
    doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .fillColor(color)
      .text(title)
      .moveDown(0.4);

    doc
      .moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .strokeColor(color)
      .lineWidth(0.8)
      .stroke()
      .moveDown(1);
  }

  private addMetric(doc: PDFKit.PDFDocument, label: string, value: number | string, color: string) {
    doc
      .font('Helvetica-Bold')
      .fontSize(13)
      .fillColor(color)
      .text(`${label}: ${value}`)
      .moveDown(0.4);
  }

    // Método auxiliar para obter o número da semana do ano
    private getWeekNumber(d: Date): number {
        d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    }
}