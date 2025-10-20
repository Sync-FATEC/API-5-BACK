import { OrderService } from '../services/OrderService';

/**
 * Scheduler para executar verificações periódicas de pedidos com datas vencidas
 */
export class OrderScheduler {
    private orderService: OrderService;
    private checkInterval: NodeJS.Timeout | null = null;
    
    constructor() {
        this.orderService = new OrderService();
    }
    
    /**
     * Inicia o scheduler para verificar pedidos vencidos periodicamente
     * @param intervalMinutes Intervalo de verificação em minutos (padrão: 60 minutos)
     */
    startScheduler(intervalMinutes: number = 60): void {
        // Converte minutos para milissegundos
        const intervalMs = intervalMinutes * 60 * 1000;
        
        // Executa verificação imediatamente ao iniciar
        this.checkExpiredOrders();
        
        // Configura a execução periódica
        this.checkInterval = setInterval(() => {
            this.checkExpiredOrders();
        }, intervalMs);
        
        console.log(`Scheduler iniciado: verificação de pedidos vencidos a cada ${intervalMinutes} minutos`);
    }
    
    /**
     * Para o scheduler de verificações periódicas
     */
    stopScheduler(): void {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
            console.log('Scheduler de verificação de pedidos vencidos foi parado');
        }
    }
    
    /**
     * Executa a verificação de pedidos vencidos
     */
    private async checkExpiredOrders(): Promise<void> {
        try {
            console.log('Verificando pedidos com datas de retirada vencidas...');
            await this.orderService.checkAndUpdateExpiredOrders();
            console.log('Verificação de pedidos vencidos concluída');
        } catch (error) {
            console.error('Erro ao verificar pedidos vencidos:', error);
        }
    }
}