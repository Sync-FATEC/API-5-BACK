import "reflect-metadata";
import { AppDataSource } from "../database/data-source";
import { RoleEnum } from "../database/enums/RoleEnum";
import { StockResponsibility } from "../database/enums/StockResponsability";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { config } from "dotenv";
import { User } from "../database/entities/User";
import { Stock } from "../database/entities/Stock";
import { UserStock } from "../database/entities/UserStock";
import { Batch } from "../database/entities/Batch";
import { MerchandiseType } from "../database/entities/MerchandiseType";
import { Merchandise, MerchandiseStatus } from "../database/entities/Merchandise";
import { MerchandiseGroup } from "../database/enums/MerchandiseGroup";
import { Order } from "../database/entities/Order";
import { OrderItem } from "../database/entities/OrderItem";
import { Section } from "../database/entities/Section";
import { Supplier } from "../database/entities/Supplier";
import { MerchandiseService } from "../services/MerchandiseService";
import { OrderService } from "../services/OrderService";

config();

// Configuração do Firebase
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

const firebaseApp = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);

async function dropDatabase() {
  console.log("🗑️ Iniciando limpeza do banco de dados...");
  
  try {
    // Obter todas as entidades registradas
    const entities = AppDataSource.entityMetadatas;
    
    // Desabilitar verificações de chave estrangeira temporariamente
    await AppDataSource.query('SET foreign_key_checks = 0;').catch(() => {
      // Para PostgreSQL, usar CASCADE
      console.log("Usando PostgreSQL - foreign key checks não aplicável");
    });

    // Para PostgreSQL, usar CASCADE para dropar tabelas
    for (const entity of entities) {
      const tableName = entity.tableName;
      try {
        await AppDataSource.query(`DROP TABLE IF EXISTS "${tableName}" CASCADE;`);
        console.log(`✅ Tabela ${tableName} removida`);
      } catch (error) {
        console.warn(`⚠️ Erro ao remover tabela ${tableName}:`, error);
      }
    }

    // Reabilitar verificações de chave estrangeira
    await AppDataSource.query('SET foreign_key_checks = 1;').catch(() => {
      console.log("PostgreSQL - foreign key checks reabilitadas automaticamente");
    });

    console.log("✅ Limpeza do banco de dados concluída");
  } catch (error) {
    console.error("❌ Erro durante a limpeza do banco de dados:", error);
    throw error;
  }
}

async function recreateDatabase() {
  console.log("🔄 Recriando estrutura do banco de dados...");
  
  try {
    // Sincronizar o schema (criar tabelas)
    await AppDataSource.synchronize(true); // true força a recriação
    console.log("✅ Estrutura do banco de dados recriada com sucesso");
  } catch (error) {
    console.error("❌ Erro ao recriar estrutura do banco de dados:", error);
    throw error;
  }
}

async function createFirebaseUser(email: string, password: string): Promise<string> {
  try {
    console.log(`Criando usuário no Firebase: ${email}...`);
    const userFirebase = await createUserWithEmailAndPassword(firebaseAuth, email, password);
    console.log(`Usuário criado no Firebase com sucesso. UID: ${userFirebase.user.uid}`);
    return userFirebase.user.uid;
  } catch (firebaseError: any) {
    if (firebaseError.code === 'auth/email-already-in-use') {
      console.log(`Usuário já existe no Firebase: ${email}. Fazendo login para obter UID...`);
      try {
        const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
        console.log(`Login realizado com sucesso. UID obtido: ${userCredential.user.uid}`);
        return userCredential.user.uid;
      } catch (loginError) {
        console.error("Erro ao fazer login no Firebase:", loginError);
        throw loginError;
      }
    } else {
      console.error("Erro ao criar usuário no Firebase:", firebaseError);
      throw firebaseError;
    }
  }
}

async function seedUsers() {
  console.log("=== Criando Usuários ===");
  const userRepository = AppDataSource.getRepository(User);

  const users = [
    {
      email: "admin@admin.com",
      password: "admin123456",
      name: "Administrador",
      role: RoleEnum.ADMIN
    },
    {
      email: "supervisor@supervisor.com",
      password: "supervisor123456",
      name: "Supervisor",
      role: RoleEnum.SUPERVISOR
    },
    {
      email: "soldado@soldado.com",
      password: "soldado123456",
      name: "Soldado",
      role: RoleEnum.SOLDADO
    }
  ];

  const createdUsers: User[] = [];

  for (const userData of users) {
    // Verificar se já existe no banco
    const existingUser = await userRepository.findOne({
      where: { email: userData.email }
    });

    if (existingUser) {
      console.log(`Usuário ${userData.email} já existe no banco de dados.`);
      createdUsers.push(existingUser);
      continue;
    }

    // Criar no Firebase
    const firebaseUid = await createFirebaseUser(userData.email, userData.password);

    // Criar no banco de dados
    const user = new User();
    user.email = userData.email;
    user.name = userData.name;
    user.firebaseUid = firebaseUid;
    user.role = userData.role;
    user.isActive = true;

    const savedUser = await userRepository.save(user);
    createdUsers.push(savedUser);

    console.log(`Usuário ${userData.role} criado com sucesso:`, {
      id: savedUser.id,
      email: savedUser.email,
      name: savedUser.name,
      role: savedUser.role
    });
  }

  return createdUsers;
}

async function seedStocks() {
  console.log("=== Criando Estoques ===");
  const stockRepository = AppDataSource.getRepository(Stock);

  const stocks = [
    {
      name: "Farmácia",
      location: "Enfermaria - Ala Norte",
      active: true
    },
    {
      name: "Almoxarifado",
      location: "Almoxarifado - Setor B",
      active: true
    }
  ];

  const createdStocks: Stock[] = [];

  for (const stockData of stocks) {
    const existingStock = await stockRepository.findOne({
      where: { name: stockData.name }
    });

    if (existingStock) {
      console.log(`Estoque ${stockData.name} já existe.`);
      createdStocks.push(existingStock);
      continue;
    }

    const stock = new Stock();
    stock.name = stockData.name;
    stock.location = stockData.location;
    stock.active = stockData.active;

    const savedStock = await stockRepository.save(stock);
    createdStocks.push(savedStock);

    console.log(`Estoque criado: ${savedStock.name} - ${savedStock.location}`);
  }

  return createdStocks;
}

async function seedUserStocks(users: User[], stocks: Stock[]) {
  console.log("=== Criando Relacionamentos Usuário-Estoque ===");
  const userStockRepository = AppDataSource.getRepository(UserStock);

  const userStockData = [
    {
      user: users.find(u => u.role === RoleEnum.ADMIN),
      stock: stocks[0], // Farmácia
      responsibility: StockResponsibility.ADMIN
    },
    {
      user: users.find(u => u.role === RoleEnum.SUPERVISOR),
      stock: stocks[0], // Farmácia
      responsibility: StockResponsibility.MANAGER
    },
    {
      user: users.find(u => u.role === RoleEnum.SOLDADO),
      stock: stocks[1], // Almoxarifado
      responsibility: StockResponsibility.USER
    }
  ];

  const createdUserStocks: UserStock[] = [];

  for (const data of userStockData) {
    if (!data.user || !data.stock) continue;

    const existingUserStock = await userStockRepository.findOne({
      where: { 
        userId: data.user.id,
        stockId: data.stock.id
      }
    });

    if (existingUserStock) {
      console.log(`Relacionamento usuário-estoque já existe para ${data.user.name} - ${data.stock.name}`);
      createdUserStocks.push(existingUserStock);
      continue;
    }

    const userStock = new UserStock();
    userStock.userId = data.user.id;
    userStock.stockId = data.stock.id;
    userStock.responsibility = data.responsibility;
    userStock.user = data.user;
    userStock.stock = data.stock;

    const savedUserStock = await userStockRepository.save(userStock);
    createdUserStocks.push(savedUserStock);

    console.log(`Relacionamento criado: ${data.user.name} - ${data.stock.name} (${data.responsibility})`);
  }

  return createdUserStocks;
}

async function seedBatches() {
  console.log("=== Criando Lotes ===");
  const batchRepository = AppDataSource.getRepository(Batch);

  const batches = [
    { expirationDate: new Date('2026-12-31') },
    { expirationDate: new Date('2027-06-30') },
    { expirationDate: new Date('2026-08-15') },
    { expirationDate: new Date('2027-12-31') },
    { expirationDate: new Date('2026-09-30') },
    { expirationDate: new Date('2028-03-15') },
    { expirationDate: new Date('2026-11-20') },
    { expirationDate: new Date('2027-04-10') },
    { expirationDate: new Date('2026-07-25') },
    { expirationDate: new Date('2027-10-05') },
    { expirationDate: new Date('2028-01-30') },
    { expirationDate: new Date('2026-12-12') },
    { expirationDate: new Date('2027-08-18') },
    { expirationDate: new Date('2026-06-22') },
    { expirationDate: new Date('2028-05-14') }
  ];

  const createdBatches: Batch[] = [];

  for (const batchData of batches) {
    const batch = new Batch();
    batch.expirationDate = batchData.expirationDate;

    const savedBatch = await batchRepository.save(batch);
    createdBatches.push(savedBatch);

    console.log(`Lote criado com vencimento: ${savedBatch.expirationDate.toISOString().split('T')[0]}`);
  }

  return createdBatches;
}

async function seedMerchandiseTypes(stocks: Stock[]) {
  console.log("=== Criando Tipos de Mercadoria ===");
  const merchandiseTypeRepository = AppDataSource.getRepository(MerchandiseType);

  const merchandiseTypes: Array<{
    name: string;
    recordNumber: string;
    unitOfMeasure: string;
    quantityTotal: number;
    controlled: boolean;
    group: MerchandiseGroup;
    minimumStock: number;
    stockId: string;
  }> = [
    // FARMÁCIA - Medicamentos e Equipamentos Médicos
    {
      name: "Paracetamol 500mg",
      recordNumber: "MED001",
      unitOfMeasure: "Comprimido",
      quantityTotal: 1000,
      controlled: false,
      group: MerchandiseGroup.ALMOX_VIRTUAL,
      minimumStock: 200,
      stockId: stocks[0].id // Farmácia
    },
    {
      name: "Ibuprofeno 600mg",
      recordNumber: "MED002",
      unitOfMeasure: "Comprimido",
      quantityTotal: 800,
      controlled: false,
      group: MerchandiseGroup.ALMOX_VIRTUAL,
      minimumStock: 150,
      stockId: stocks[0].id // Farmácia
    },
    {
      name: "Dipirona 500mg",
      recordNumber: "MED003",
      unitOfMeasure: "Comprimido",
      quantityTotal: 600,
      controlled: false,
      group: MerchandiseGroup.ALMOX_VIRTUAL,
      minimumStock: 100,
      stockId: stocks[0].id // Farmácia
    },
    {
      name: "Amoxicilina 500mg",
      recordNumber: "MED004",
      unitOfMeasure: "Cápsula",
      quantityTotal: 400,
      controlled: true,
      group: MerchandiseGroup.ALMOX_VIRTUAL,
      minimumStock: 80,
      stockId: stocks[0].id // Farmácia
    },
    {
      name: "Omeprazol 20mg",
      recordNumber: "MED005",
      unitOfMeasure: "Cápsula",
      quantityTotal: 300,
      controlled: false,
      group: MerchandiseGroup.ALMOX_VIRTUAL,
      minimumStock: 60,
      stockId: stocks[0].id // Farmácia
    },
    {
      name: "Losartana 50mg",
      recordNumber: "MED006",
      unitOfMeasure: "Comprimido",
      quantityTotal: 500,
      controlled: true,
      group: MerchandiseGroup.ALMOX_VIRTUAL,
      minimumStock: 100,
      stockId: stocks[0].id // Farmácia
    },
    {
      name: "Metformina 850mg",
      recordNumber: "MED007",
      unitOfMeasure: "Comprimido",
      quantityTotal: 450,
      controlled: true,
      group: MerchandiseGroup.ALMOX_VIRTUAL,
      minimumStock: 90,
      stockId: stocks[0].id // Farmácia
    },
    {
      name: "Soro Fisiológico 500ml",
      recordNumber: "MED008",
      unitOfMeasure: "Frasco",
      quantityTotal: 200,
      controlled: false,
      group: MerchandiseGroup.ALMOX_VIRTUAL,
      minimumStock: 40,
      stockId: stocks[0].id // Farmácia
    },
    {
      name: "Seringa Descartável 10ml",
      recordNumber: "MED009",
      unitOfMeasure: "Unidade",
      quantityTotal: 1500,
      controlled: false,
      group: MerchandiseGroup.ALMOX_VIRTUAL,
      minimumStock: 300,
      stockId: stocks[0].id // Farmácia
    },
    {
      name: "Luvas Cirúrgicas",
      recordNumber: "MED010",
      unitOfMeasure: "Par",
      quantityTotal: 2000,
      controlled: false,
      group: MerchandiseGroup.ALMOX_VIRTUAL,
      minimumStock: 400,
      stockId: stocks[0].id // Farmácia
    },
    {
      name: "Termômetro Digital",
      recordNumber: "MED011",
      unitOfMeasure: "Unidade",
      quantityTotal: 50,
      controlled: false,
      group: MerchandiseGroup.PERMANENTE,
      minimumStock: 10,
      stockId: stocks[0].id // Farmácia
    },
    {
      name: "Estetoscópio",
      recordNumber: "MED012",
      unitOfMeasure: "Unidade",
      quantityTotal: 25,
      controlled: false,
      group: MerchandiseGroup.PERMANENTE,
      minimumStock: 5,
      stockId: stocks[0].id // Farmácia
    },
    {
      name: "Gaze Estéril",
      recordNumber: "MED013",
      unitOfMeasure: "Pacote",
      quantityTotal: 300,
      controlled: false,
      group: MerchandiseGroup.ALMOX_VIRTUAL,
      minimumStock: 60,
      stockId: stocks[0].id // Farmácia
    },
    {
      name: "Álcool 70%",
      recordNumber: "MED014",
      unitOfMeasure: "Litro",
      quantityTotal: 100,
      controlled: false,
      group: MerchandiseGroup.ALMOX_VIRTUAL,
      minimumStock: 20,
      stockId: stocks[0].id // Farmácia
    },
    {
      name: "Morfina 10mg",
      recordNumber: "MED015",
      unitOfMeasure: "Ampola",
      quantityTotal: 50,
      controlled: true,
      group: MerchandiseGroup.ALMOX_VIRTUAL,
      minimumStock: 10,
      stockId: stocks[0].id // Farmácia
    },

    // ALMOXARIFADO - Material de Escritório e Equipamentos
    {
      name: "Papel A4 75g",
      recordNumber: "ALM001",
      unitOfMeasure: "Resma",
      quantityTotal: 500,
      controlled: false,
      group: MerchandiseGroup.EXPEDIENTE,
      minimumStock: 100,
      stockId: stocks[1].id // Almoxarifado
    },
    {
      name: "Caneta Esferográfica Azul",
      recordNumber: "ALM002",
      unitOfMeasure: "Unidade",
      quantityTotal: 1000,
      controlled: false,
      group: MerchandiseGroup.EXPEDIENTE,
      minimumStock: 200,
      stockId: stocks[1].id // Almoxarifado
    },
    {
      name: "Caneta Esferográfica Preta",
      recordNumber: "ALM003",
      unitOfMeasure: "Unidade",
      quantityTotal: 800,
      controlled: false,
      group: MerchandiseGroup.EXPEDIENTE,
      minimumStock: 160,
      stockId: stocks[1].id // Almoxarifado
    },
    {
      name: "Lápis HB",
      recordNumber: "ALM004",
      unitOfMeasure: "Unidade",
      quantityTotal: 600,
      controlled: false,
      group: MerchandiseGroup.EXPEDIENTE,
      minimumStock: 120,
      stockId: stocks[1].id // Almoxarifado
    },
    {
      name: "Borracha Escolar",
      recordNumber: "ALM005",
      unitOfMeasure: "Unidade",
      quantityTotal: 300,
      controlled: false,
      group: MerchandiseGroup.EXPEDIENTE,
      minimumStock: 60,
      stockId: stocks[1].id // Almoxarifado
    },
    {
      name: "Grampeador",
      recordNumber: "ALM006",
      unitOfMeasure: "Unidade",
      quantityTotal: 50,
      controlled: false,
      group: MerchandiseGroup.PERMANENTE,
      minimumStock: 10,
      stockId: stocks[1].id // Almoxarifado
    },
    {
      name: "Grampos para Grampeador",
      recordNumber: "ALM007",
      unitOfMeasure: "Caixa",
      quantityTotal: 200,
      controlled: false,
      group: MerchandiseGroup.EXPEDIENTE,
      minimumStock: 40,
      stockId: stocks[1].id // Almoxarifado
    },
    {
      name: "Pasta Suspensa",
      recordNumber: "ALM008",
      unitOfMeasure: "Unidade",
      quantityTotal: 400,
      controlled: false,
      group: MerchandiseGroup.EXPEDIENTE,
      minimumStock: 80,
      stockId: stocks[1].id // Almoxarifado
    },
    {
      name: "Arquivo Morto",
      recordNumber: "ALM009",
      unitOfMeasure: "Unidade",
      quantityTotal: 150,
      controlled: false,
      group: MerchandiseGroup.EXPEDIENTE,
      minimumStock: 30,
      stockId: stocks[1].id // Almoxarifado
    },
    {
      name: "Toner para Impressora HP",
      recordNumber: "ALM010",
      unitOfMeasure: "Unidade",
      quantityTotal: 30,
      controlled: false,
      group: MerchandiseGroup.EXPEDIENTE,
      minimumStock: 6,
      stockId: stocks[1].id // Almoxarifado
    },
    {
      name: "Computador Desktop",
      recordNumber: "ALM011",
      unitOfMeasure: "Unidade",
      quantityTotal: 20,
      controlled: true,
      group: MerchandiseGroup.PERMANENTE,
      minimumStock: 3,
      stockId: stocks[1].id // Almoxarifado
    },
    {
      name: "Monitor LED 24\"",
      recordNumber: "ALM012",
      unitOfMeasure: "Unidade",
      quantityTotal: 25,
      controlled: true,
      group: MerchandiseGroup.PERMANENTE,
      minimumStock: 5,
      stockId: stocks[1].id // Almoxarifado
    },
    {
      name: "Teclado USB",
      recordNumber: "ALM013",
      unitOfMeasure: "Unidade",
      quantityTotal: 40,
      controlled: false,
      group: MerchandiseGroup.PERMANENTE,
      minimumStock: 8,
      stockId: stocks[1].id // Almoxarifado
    },
    {
      name: "Mouse Óptico",
      recordNumber: "ALM014",
      unitOfMeasure: "Unidade",
      quantityTotal: 50,
      controlled: false,
      group: MerchandiseGroup.PERMANENTE,
      minimumStock: 10,
      stockId: stocks[1].id // Almoxarifado
    },
    {
      name: "Cadeira de Escritório",
      recordNumber: "ALM015",
      unitOfMeasure: "Unidade",
      quantityTotal: 30,
      controlled: false,
      group: MerchandiseGroup.PERMANENTE,
      minimumStock: 6,
      stockId: stocks[1].id // Almoxarifado
    },
    {
      name: "Mesa de Escritório",
      recordNumber: "ALM016",
      unitOfMeasure: "Unidade",
      quantityTotal: 25,
      controlled: false,
      group: MerchandiseGroup.PERMANENTE,
      minimumStock: 5,
      stockId: stocks[1].id // Almoxarifado
    },
    {
      name: "Impressora Multifuncional",
      recordNumber: "ALM017",
      unitOfMeasure: "Unidade",
      quantityTotal: 15,
      controlled: true,
      group: MerchandiseGroup.PERMANENTE,
      minimumStock: 3,
      stockId: stocks[1].id // Almoxarifado
    },
    {
      name: "Cabo de Rede Cat6",
      recordNumber: "ALM018",
      unitOfMeasure: "Metro",
      quantityTotal: 1000,
      controlled: false,
      group: MerchandiseGroup.EXPEDIENTE,
      minimumStock: 200,
      stockId: stocks[1].id // Almoxarifado
    },
    {
      name: "Fita Adesiva Transparente",
      recordNumber: "ALM019",
      unitOfMeasure: "Rolo",
      quantityTotal: 100,
      controlled: false,
      group: MerchandiseGroup.EXPEDIENTE,
      minimumStock: 20,
      stockId: stocks[1].id // Almoxarifado
    },
    {
      name: "Marcador de Texto Amarelo",
      recordNumber: "ALM020",
      unitOfMeasure: "Unidade",
      quantityTotal: 200,
      controlled: false,
      group: MerchandiseGroup.EXPEDIENTE,
      minimumStock: 40,
      stockId: stocks[1].id // Almoxarifado
    }
  ];

  const createdMerchandiseTypes: MerchandiseType[] = [];

  for (const typeData of merchandiseTypes) {
    const existingType = await merchandiseTypeRepository.findOne({
      where: { recordNumber: typeData.recordNumber }
    });

    if (existingType) {
      console.log(`Tipo de mercadoria ${typeData.name} já existe.`);
      createdMerchandiseTypes.push(existingType);
      continue;
    }

    const merchandiseType = new MerchandiseType();
    merchandiseType.name = typeData.name;
    merchandiseType.recordNumber = typeData.recordNumber;
    merchandiseType.unitOfMeasure = typeData.unitOfMeasure;
    merchandiseType.quantityTotal = 0;
    merchandiseType.controlled = typeData.controlled;
    merchandiseType.group = typeData.group;
    merchandiseType.minimumStock = typeData.minimumStock;
    merchandiseType.stockId = typeData.stockId;

    const savedType = await merchandiseTypeRepository.save(merchandiseType);
    createdMerchandiseTypes.push(savedType);

    console.log(`Tipo de mercadoria criado: ${savedType.name} (${savedType.recordNumber}) - Stock: ${typeData.stockId}`);
  }

  return createdMerchandiseTypes;
}

async function seedMerchandises(batches: Batch[], merchandiseTypes: MerchandiseType[]) {
  console.log("=== Criando Mercadorias ===");
  const merchandiseService = new MerchandiseService();

  // Função para calcular quantidade baseada no tipo de alerta desejado
  const calculateQuantityForAlert = (minimumStock: number, alertType: 'critical' | 'warning' | 'normal') => {
    switch (alertType) {
      case 'critical':
        // Cenário 1: Abaixo do mínimo (0 a minimumStock)
        // Cenário 2: Até 50% acima do mínimo
        const scenarios = [
          Math.floor(minimumStock * 0.8), // 80% do mínimo (abaixo)
          Math.floor(minimumStock * 1.3)  // 30% acima do mínimo (critical)
        ];
        return scenarios[Math.floor(Math.random() * scenarios.length)];
      
      case 'warning':
        // Entre 50% e 85% acima do mínimo
        const warningMin = minimumStock * 1.5; // 50% acima
        const warningMax = minimumStock * 1.85; // 85% acima
        return Math.floor(warningMin + Math.random() * (warningMax - warningMin));
      
      case 'normal':
        // Mais de 85% acima do mínimo
        const normalMin = minimumStock * 1.9; // 90% acima
        const normalMax = minimumStock * 3; // 200% acima
        return Math.floor(normalMin + Math.random() * (normalMax - normalMin));
      
      default:
        return minimumStock;
    }
  };

  // Criar múltiplas entradas para cada tipo de mercadoria
  const merchandisesToCreate = [];

  // Para cada tipo de mercadoria, criar 2-5 entradas
  for (let i = 0; i < merchandiseTypes.length; i++) {
    const type = merchandiseTypes[i];
    const numEntries = Math.floor(Math.random() * 4) + 2; // 2-5 entradas
    
    // Determinar o tipo de alerta final desejado para este tipo
    let finalAlertType: 'critical' | 'warning' | 'normal';
    const rand = Math.random();
    if (rand < 0.3) {
      finalAlertType = 'critical';
    } else if (rand < 0.7) {
      finalAlertType = 'warning';
    } else {
      finalAlertType = 'normal';
    }

    // Calcular quantidade total necessária para atingir o alerta desejado
    const totalQuantityNeeded = calculateQuantityForAlert(type.minimumStock, finalAlertType);
    
    // Distribuir a quantidade total entre as múltiplas entradas
    const quantities: number[] = [];
    let remainingQuantity = totalQuantityNeeded;
    
    for (let j = 0; j < numEntries; j++) {
      if (j === numEntries - 1) {
        // Última entrada recebe o restante
        quantities.push(Math.max(0, remainingQuantity));
      } else {
        // Entradas anteriores recebem uma porção aleatória
        const maxForThisEntry = Math.floor(remainingQuantity * 0.6); // Máximo 60% do restante
        const minForThisEntry = Math.floor(remainingQuantity * 0.1); // Mínimo 10% do restante
        const quantityForThisEntry = Math.floor(Math.random() * (maxForThisEntry - minForThisEntry + 1)) + minForThisEntry;
        quantities.push(quantityForThisEntry);
        remainingQuantity -= quantityForThisEntry;
      }
    }

    // Criar as entradas para este tipo
    for (let j = 0; j < numEntries; j++) {
      const batchIndex = (i * numEntries + j) % batches.length;
      
      merchandisesToCreate.push({
        batch: batches[batchIndex],
        type: type,
        quantity: quantities[j],
        status: MerchandiseStatus.AVAILABLE,
        alertType: j === numEntries - 1 ? finalAlertType : 'entry', // Marcar apenas a última entrada com o tipo de alerta
        entryNumber: j + 1,
        totalEntries: numEntries
      });
    }
  }

  // Garantir que temos pelo menos um exemplo de cada tipo de alerta
  if (merchandiseTypes.length >= 3) {
    // Encontrar as últimas entradas dos primeiros 3 tipos para forçar alertas específicos
    const firstTypeEntries = merchandisesToCreate.filter(m => m.type.id === merchandiseTypes[0].id);
    const secondTypeEntries = merchandisesToCreate.filter(m => m.type.id === merchandiseTypes[1].id);
    const thirdTypeEntries = merchandisesToCreate.filter(m => m.type.id === merchandiseTypes[2].id);
    
    if (firstTypeEntries.length > 0) {
      // Forçar um critical (estoque zero) - zerar todas as entradas do primeiro tipo
      firstTypeEntries.forEach(entry => entry.quantity = 0);
      firstTypeEntries[firstTypeEntries.length - 1].alertType = 'critical';
    }
    
    if (secondTypeEntries.length > 0) {
      // Forçar um critical (abaixo do mínimo) - ajustar apenas a última entrada
      const totalOthers = secondTypeEntries.slice(0, -1).reduce((sum, entry) => sum + entry.quantity, 0);
      const targetTotal = Math.floor(merchandiseTypes[1].minimumStock * 0.5);
      secondTypeEntries[secondTypeEntries.length - 1].quantity = Math.max(0, targetTotal - totalOthers);
      secondTypeEntries[secondTypeEntries.length - 1].alertType = 'critical';
    }
    
    if (thirdTypeEntries.length > 0) {
      // Forçar um warning - ajustar apenas a última entrada
      const totalOthers = thirdTypeEntries.slice(0, -1).reduce((sum, entry) => sum + entry.quantity, 0);
      const targetTotal = Math.floor(merchandiseTypes[2].minimumStock * 1.7); // 70% acima
      thirdTypeEntries[thirdTypeEntries.length - 1].quantity = Math.max(0, targetTotal - totalOthers);
      thirdTypeEntries[thirdTypeEntries.length - 1].alertType = 'warning';
    }
  }

  const createdMerchandises: Merchandise[] = [];

  for (const merchData of merchandisesToCreate) {
    const payload = {
      typeId: merchData.type.id,
      quantity: merchData.quantity,
      status: merchData.status,
    } as const;
    const validDate = merchData.batch.expirationDate;

    const savedMerchandise = await merchandiseService.createMerchandise(payload, validDate);
    createdMerchandises.push(savedMerchandise as unknown as Merchandise);

    console.log(`Entrada ${(merchData as any).entryNumber}/${(merchData as any).totalEntries} criada: ${merchData.type.name}`);
    console.log(`  - Qtd: ${merchData.quantity} | Lote: ${merchData.batch.id.substring(0, 8)}...`);
    console.log(`  - Status: ${merchData.status}`);
  }

  console.log(`\n=== Resumo de Entradas Criadas ===`);
  const totalEntries = merchandisesToCreate.length;
  const uniqueTypes = new Set(merchandisesToCreate.map(m => m.type.id)).size;
  const avgEntriesPerType = (totalEntries / uniqueTypes).toFixed(1);
  
  console.log(`Total de entradas: ${totalEntries}`);
  console.log(`Tipos únicos: ${uniqueTypes}`);
  console.log(`Média de entradas por tipo: ${avgEntriesPerType}`);
  
  const alertCounts = {
    critical: merchandisesToCreate.filter(m => m.alertType === 'critical').length,
    warning: merchandisesToCreate.filter(m => m.alertType === 'warning').length,
    normal: merchandisesToCreate.filter(m => m.alertType === 'normal').length
  };
  console.log(`Alertas finais - Critical: ${alertCounts.critical} | Warning: ${alertCounts.warning} | Normal: ${alertCounts.normal}`);

  return createdMerchandises;
}



async function seedSections() {
  console.log("=== Criando Seções ===");
  const sectionRepository = AppDataSource.getRepository(Section);
  const sections = [
    { name: "Emergência" },
    { name: "Cardiologia" },
    { name: "Endocrinologia" },
    { name: "Pediatria" },
    { name: "Cirurgia" },
    { name: "UTI" },
    { name: "Oncologia" },
    { name: "Neurologia" },
    { name: "Recursos Humanos" },
    { name: "Financeiro" },
    { name: "Tecnologia da Informação" },
    { name: "Administração Geral" },
    { name: "Compras" },
    { name: "Jurídico" },
    { name: "Marketing" },
    { name: "Manutenção" },
    { name: "Segurança" },
    { name: "Limpeza" },
  ];
  const createdSections: Section[] = [];
  for (const sectionData of sections) {
    let section = await sectionRepository.findOne({ where: { name: sectionData.name } });
    if (!section) {
      section = new Section();
      section.name = sectionData.name;
      section = await sectionRepository.save(section);
      console.log(`Seção criada: ${section.name}`);
    } else {
      console.log(`Seção já existe: ${section.name}`);
    }
    createdSections.push(section);
  }
  return createdSections;
}

async function seedOrders(sections: Section[], stocks: Stock[], merchandiseTypes: MerchandiseType[]) {
  console.log("=== Criando Pedidos ===");
  const orderService = new OrderService();
  
  // Função auxiliar para gerar datas aleatórias
  const getRandomDate = (start: Date, end: Date) => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  };

  // Função auxiliar para gerar status aleatório
  const getRandomStatus = () => {
    const statuses = ["PENDING", "COMPLETED", "CANCELLED"];
    const weights = [0.4, 0.6, 0.0];
    const random = Math.random();
    if (random < weights[0]) return statuses[0];
    if (random < weights[0] + weights[1]) return statuses[1];
    return statuses[2];
  };

  // Gerar 30 pedidos com datas variadas (últimos 2 anos)
  
  const startDate = new Date('2023-10-24');
  const endDate = new Date('2025-10-24');
  
  const ordersInput: Array<{ creationDate: Date; withdrawalDate: Date | null; status: string; section: Section; stock: Stock }> = [];
  
  for (let i = 0; i < 20; i++) { // Reduzido para 20 pedidos aleatórios + 10 específicos = 30 total
    const creationDate = getRandomDate(startDate, endDate);
    const status = getRandomStatus();
    const section = sections[Math.floor(Math.random() * sections.length)];
    
    let stock;
    if (section.name.includes('Emergência') || section.name.includes('Cardiologia') || 
        section.name.includes('Endocrinologia') || section.name.includes('Pediatria') ||
        section.name.includes('Cirurgia') || section.name.includes('UTI') ||
        section.name.includes('Oncologia') || section.name.includes('Neurologia')) {
      stock = stocks[0];
    } else {
      stock = stocks[1];
    }

    let withdrawalDate: Date | null = null;
    if (status === "COMPLETED") {
      withdrawalDate = new Date(creationDate.getTime() + (Math.random() * 10 + 1) * 24 * 60 * 60 * 1000);
    }

    ordersInput.push({ creationDate, withdrawalDate, status, section, stock });
  }

  // Adicionar alguns pedidos específicos para garantir variedade
  const specificOrders = [
    // Pedidos da Farmácia
    {
      creationDate: new Date('2025-09-01'),
      withdrawalDate: new Date('2025-09-03'),
      status: "COMPLETED",
      section: sections.find(s => s.name === 'Emergência') || sections[0],
      stock: stocks[0] // Farmácia
    },
    {
      creationDate: new Date('2025-09-15'),
      withdrawalDate: new Date('2025-09-18'),
      status: "COMPLETED",
      section: sections.find(s => s.name === 'Cardiologia') || sections[1],
      stock: stocks[0] // Farmácia
    },
    {
      creationDate: new Date('2025-10-05'),
      withdrawalDate: null,
      status: "PENDING",
      section: sections.find(s => s.name === 'UTI') || sections[5],
      stock: stocks[0] // Farmácia
    },
    {
      creationDate: new Date('2025-10-10'),
      withdrawalDate: null,
      status: "PENDING",
      section: sections.find(s => s.name === 'Oncologia') || sections[6],
      stock: stocks[0] // Farmácia
    },
    {
      creationDate: new Date('2025-10-20'),
      withdrawalDate: null,
      status: "PENDING",
      section: sections.find(s => s.name === 'Pediatria') || sections[3],
      stock: stocks[0] // Farmácia
    },

    // Pedidos do Almoxarifado
    {
      creationDate: new Date('2025-08-20'),
      withdrawalDate: new Date('2025-08-25'),
      status: "COMPLETED",
      section: sections.find(s => s.name === 'Tecnologia da Informação') || sections[10],
      stock: stocks[1] // Almoxarifado
    },
    {
      creationDate: new Date('2025-09-10'),
      withdrawalDate: new Date('2025-09-12'),
      status: "COMPLETED",
      section: sections.find(s => s.name === 'Recursos Humanos') || sections[8],
      stock: stocks[1] // Almoxarifado
    },
    {
      creationDate: new Date('2025-10-08'),
      withdrawalDate: null,
      status: "PENDING",
      section: sections.find(s => s.name === 'Financeiro') || sections[9],
      stock: stocks[1] // Almoxarifado
    },
    {
      creationDate: new Date('2025-10-15'),
      withdrawalDate: null,
      status: "PENDING",
      section: sections.find(s => s.name === 'Marketing') || sections[14],
      stock: stocks[1] // Almoxarifado
    },
    {
      creationDate: new Date('2025-10-22'),
      withdrawalDate: null,
      status: "PENDING",
      section: sections.find(s => s.name === 'Compras') || sections[12],
      stock: stocks[1] // Almoxarifado
    }
  ];

  // Adicionar pedidos específicos à lista
  ordersInput.push(...specificOrders);

  // Função auxiliar para quantidade por grupo
  const getRandomQuantityByType = (type: MerchandiseType) => {
    if (type.group === MerchandiseGroup.ALMOX_VIRTUAL) {
      return Math.floor(Math.random() * 191) + 10; // 10-200
    }
    if (type.group === MerchandiseGroup.PERMANENTE) {
      return Math.floor(Math.random() * 10) + 1; // 1-10
    }
    return Math.floor(Math.random() * 96) + 5; // 5-100
  };

  const createdOrders: any[] = [];

  for (const orderData of ordersInput) {
    // Tipos disponíveis conforme estoque do pedido
    let availableTypes = merchandiseTypes.filter(mt => (mt as any).stock?.id === orderData.stock.id || (mt as any).stockId === orderData.stock.id);
    if (availableTypes.length === 0) availableTypes = merchandiseTypes;

    const numItems = Math.floor(Math.random() * 7) + 2; // Mínimo 2 itens, máximo 8 itens
    const usedTypes = new Set<string>();
    const orderItemsDTO: { merchandiseId: string; quantity: number }[] = [];

    // Garante que pelo menos um item seja adicionado
    let itemsAdded = 0;
    while (itemsAdded < numItems && usedTypes.size < availableTypes.length) {
      let type: MerchandiseType;
      do {
        type = availableTypes[Math.floor(Math.random() * availableTypes.length)];
      } while (usedTypes.has(type.id));
      usedTypes.add(type.id);

      const desired = getRandomQuantityByType(type);
      const maxQty = Math.max(1, type.quantityTotal); // Garante pelo menos 1 item
      const qty = Math.min(desired, maxQty);
      if (qty > 0) {
        orderItemsDTO.push({ merchandiseId: type.id, quantity: qty });
        // Atualizar cache local para evitar pedir acima do disponível no mesmo pedido
        type.quantityTotal -= qty;
        itemsAdded++;
      }
    }

    const dto = {
      creationDate: orderData.creationDate,
      withdrawalDate: orderData.withdrawalDate,
      status: orderData.status,
      sectionId: orderData.section.id,
      stockId: orderData.stock.id,
      orderItems: orderItemsDTO
    };

    try {
      const saved = await orderService.create(dto as any);
      createdOrders.push(saved);
      console.log(`Pedido criado: ${saved.status} - Data: ${saved.creationDate.toString().split('T')[0]} - Seção: ${orderData.section.name} - Estoque: ${orderData.stock.name} - Itens: ${saved.orderItems.length}`);
    } catch (e) {
      console.warn(`Falha ao criar pedido para seção ${orderData.section.name}: ${(e as any)?.message ?? e}`);
    }
  }

  return createdOrders;
}

async function seedOrderItems(orders: Order[], merchandises: Merchandise[]) {
  console.log("=== Criando Itens de Pedido ===");
  const orderItemRepository = AppDataSource.getRepository(OrderItem);

  // Função auxiliar para gerar quantidade aleatória baseada no tipo de mercadoria
  const getRandomQuantity = (merchandiseType: MerchandiseType) => {
    // Medicamentos: 10-200 unidades
    if (merchandiseType.group === MerchandiseGroup.ALMOX_VIRTUAL) {
      return Math.floor(Math.random() * 191) + 10; // 10-200
    }
    // Equipamentos permanentes: 1-10 unidades
    if (merchandiseType.group === MerchandiseGroup.PERMANENTE) {
      return Math.floor(Math.random() * 10) + 1; // 1-10
    }
    // Material de expediente: 5-100 unidades
    return Math.floor(Math.random() * 96) + 5; // 5-100
  };

  // Separar mercadorias por estoque para facilitar a atribuição
  const farmaciaTypes = merchandises
    .filter(m => m.type.stockId === orders[0]?.stock?.id || m.type.name.includes('Paracetamol') || m.type.name.includes('Ibuprofeno'))
    .map(m => m.type);
  
  const almoxarifadoTypes = merchandises
    .filter(m => m.type.stockId !== orders[0]?.stock?.id && !m.type.name.includes('Paracetamol') && !m.type.name.includes('Ibuprofeno'))
    .map(m => m.type);

  const orderItems = [];

  // Criar itens para cada pedido
  for (const order of orders) {
    // Determinar quantos itens este pedido terá (1-8 itens por pedido)
    const numItems = Math.floor(Math.random() * 8) + 1;
    
    // Determinar quais tipos de mercadoria usar baseado no estoque do pedido
    let availableTypes;
    if (order.stock.name === 'Farmácia') {
      availableTypes = farmaciaTypes.length > 0 ? farmaciaTypes : merchandises.slice(0, 15).map(m => m.type);
    } else {
      availableTypes = almoxarifadoTypes.length > 0 ? almoxarifadoTypes : merchandises.slice(15).map(m => m.type);
    }

    // Se não há tipos disponíveis, usar todos
    if (availableTypes.length === 0) {
      availableTypes = merchandises.map(m => m.type);
    }

    // Criar itens únicos para este pedido (sem repetir tipos)
    const usedTypes = new Set();
    for (let i = 0; i < numItems && usedTypes.size < availableTypes.length; i++) {
      let merchandiseType;
      do {
        merchandiseType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
      } while (usedTypes.has(merchandiseType.id));
      
      usedTypes.add(merchandiseType.id);
      
      orderItems.push({
        order,
        merchandiseType,
        quantity: getRandomQuantity(merchandiseType)
      });
    }
  }

  // Adicionar alguns itens específicos para garantir variedade
  const specificItems = [
    // Itens da Farmácia
    {
      order: orders.find(o => o.stock.name === 'Farmácia') || orders[0],
      merchandiseType: merchandises.find(m => m.type.name.includes('Paracetamol'))?.type || merchandises[0].type,
      quantity: 100
    },
    {
      order: orders.find(o => o.stock.name === 'Farmácia') || orders[0],
      merchandiseType: merchandises.find(m => m.type.name.includes('Ibuprofeno'))?.type || merchandises[1]?.type,
      quantity: 75
    },
    {
      order: orders.find(o => o.stock.name === 'Farmácia') || orders[0],
      merchandiseType: merchandises.find(m => m.type.name.includes('Seringa'))?.type || merchandises[2]?.type,
      quantity: 200
    },
    {
      order: orders.find(o => o.stock.name === 'Farmácia') || orders[0],
      merchandiseType: merchandises.find(m => m.type.name.includes('Luvas'))?.type || merchandises[3]?.type,
      quantity: 500
    },

    // Itens do Almoxarifado
    {
      order: orders.find(o => o.stock.name === 'Almoxarifado') || orders[1],
      merchandiseType: merchandises.find(m => m.type.name.includes('Papel A4'))?.type || merchandises[15]?.type,
      quantity: 50
    },
    {
      order: orders.find(o => o.stock.name === 'Almoxarifado') || orders[1],
      merchandiseType: merchandises.find(m => m.type.name.includes('Caneta'))?.type || merchandises[16]?.type,
      quantity: 150
    },
    {
      order: orders.find(o => o.stock.name === 'Almoxarifado') || orders[1],
      merchandiseType: merchandises.find(m => m.type.name.includes('Computador'))?.type || merchandises[26]?.type,
      quantity: 3
    },
    {
      order: orders.find(o => o.stock.name === 'Almoxarifado') || orders[1],
      merchandiseType: merchandises.find(m => m.type.name.includes('Monitor'))?.type || merchandises[27]?.type,
      quantity: 5
    }
  ];

  // Adicionar itens específicos apenas se os tipos existem
  for (const item of specificItems) {
    if (item.merchandiseType) {
      orderItems.push(item);
    }
  }

  const createdOrderItems: OrderItem[] = [];

  for (const itemData of orderItems) {
    const orderItem = new OrderItem();
    orderItem.quantity = itemData.quantity;
    orderItem.order = itemData.order;
    orderItem.merchandiseType = itemData.merchandiseType;

    const savedOrderItem = await orderItemRepository.save(orderItem);
    createdOrderItems.push(savedOrderItem);

    console.log(`Item de pedido criado: Pedido=${itemData.order.id} - Tipo=${itemData.merchandiseType.name} - Qtd: ${itemData.quantity} - Estoque: ${itemData.order.stock.name}`);
  }

  console.log(`Total de itens de pedido criados: ${createdOrderItems.length}`);
  return createdOrderItems;
}

async function seedSuppliers() {
  console.log("=== Criando Fornecedores ===");
  const supplierRepository = AppDataSource.getRepository(Supplier);

  const suppliers = [
    {
      razaoSocial: "Tech Solutions Ltda",
      nomeResponsavel: "João Silva",
      cargoResponsavel: "Gerente Comercial",
      cnpj: "12345678000190", // CNPJ sem formatação
      emailPrimario: "contato@techsolutions.com",
      emailSecundario: "vendas@techsolutions.com"
    },
    {
      razaoSocial: "Inovação Industrial S.A.",
      nomeResponsavel: "Maria Santos",
      cargoResponsavel: "Diretora de Vendas",
      cnpj: "98765432000110",
      emailPrimario: "comercial@inovacao.com.br"
    },
    {
      razaoSocial: "Global Supplies Importação Ltda",
      cnpj: "11222333000144",
      emailPrimario: "suporte@globalsupplies.com",
      emailSecundario: "importacao@globalsupplies.com"
    },
    {
      razaoSocial: "Materiais Especializados Eireli",
      nomeResponsavel: "Carlos Oliveira",
      cargoResponsavel: "Proprietário",
      cnpj: "55666777000188",
      emailPrimario: "carlos@materiaisespecializados.com.br"
    },
    {
      razaoSocial: "Equipamentos Premium Ltda",
      nomeResponsavel: "Ana Costa",
      cargoResponsavel: "Coordenadora de Vendas",
      cnpj: "33444555000122",
      emailPrimario: "vendas@equipamentospremium.com",
      emailSecundario: "atendimento@equipamentospremium.com"
    }
  ];

  const createdSuppliers: Supplier[] = [];

  for (const supplierData of suppliers) {
    // Verificar se já existe pelo CNPJ
    const existingSupplier = await supplierRepository.findOne({
      where: { cnpj: supplierData.cnpj }
    });

    if (existingSupplier) {
      console.log(`Fornecedor ${supplierData.razaoSocial} já existe.`);
      createdSuppliers.push(existingSupplier);
      continue;
    }

    const supplier = new Supplier();
    supplier.razaoSocial = supplierData.razaoSocial;
    supplier.nomeResponsavel = supplierData.nomeResponsavel || undefined;
    supplier.cargoResponsavel = supplierData.cargoResponsavel || undefined;
    supplier.cnpj = supplierData.cnpj;
    supplier.emailPrimario = supplierData.emailPrimario;
    supplier.emailSecundario = supplierData.emailSecundario || undefined;
    supplier.isActive = true;

    const savedSupplier = await supplierRepository.save(supplier);
    createdSuppliers.push(savedSupplier);

    // Formatar CNPJ para exibição
    const cnpjFormatted = supplierData.cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
    console.log(`Fornecedor criado: ${savedSupplier.razaoSocial} (${cnpjFormatted})`);
  }

  return createdSuppliers;
}

async function seedAll() {
  try {
    // Inicializar conexão com o banco de dados
    await AppDataSource.initialize();
    console.log("Conexão com o banco de dados estabelecida.");

    // Dropar e recriar o banco de dados
    console.log("🔄 Iniciando processo de recriação do banco de dados...");
    try {
      await dropDatabase();
      await recreateDatabase();
      console.log("✅ Banco de dados recriado com sucesso!\n");
    } catch (dbError) {
      console.error("❌ Erro crítico durante a recriação do banco de dados:", dbError);
      throw new Error(`Falha na recriação do banco de dados: ${dbError}`);
    }

    console.log("🌱 Iniciando seed completo do sistema...\n");

    // 1. Criar usuários (independente)
    const users = await seedUsers();

    // 2. Criar estoques (independente)
    const stocks = await seedStocks();

    // 3. Criar relacionamentos usuário-estoque (depende de users e stocks)
    const userStocks = await seedUserStocks(users, stocks);

    // 4. Criar lotes (independente)
    const batches = await seedBatches();

    // 5. Criar tipos de mercadoria (depende de stocks)
    const merchandiseTypes = await seedMerchandiseTypes(stocks);

    // 6. Criar mercadorias (depende de batches e merchandiseTypes)
    const merchandises = await seedMerchandises(batches, merchandiseTypes);

    // 7. Criar seções (independente)
    const sections = await seedSections();

    // 8. Criar pedidos (depende de sections, stocks e merchandiseTypes)
  const orders = await seedOrders(sections, stocks, merchandiseTypes);

  // 9. Criar fornecedores (independente)
  const suppliers = await seedSuppliers();

  // 10. Validar totais por tipo após saídas
  console.log("\n🔎 Validando totais por tipo...");
  const mtRepo = AppDataSource.getRepository(MerchandiseType);
  const allTypes = await mtRepo.find();
  let inconsistencies = 0;
  for (const t of allTypes) {
    if (t.quantityTotal < 0) {
      inconsistencies++;
      console.warn(`⚠️ Tipo ${t.name} com total negativo: ${t.quantityTotal}`);
    }
  }
  console.log(`✅ Validação concluída. Inconsistências encontradas: ${inconsistencies}`);

    console.log("\n🎉 Seed completo executado com sucesso!");
    console.log("📊 Resumo:");
    console.log(`   - ${users.length} usuários criados`);
    console.log(`   - ${stocks.length} estoques criados`);
    console.log(`   - ${userStocks.length} relacionamentos usuário-estoque criados`);
    console.log(`   - ${batches.length} lotes criados`);
    console.log(`   - ${merchandiseTypes.length} tipos de mercadoria criados`);
    console.log(`   - ${merchandises.length} mercadorias criadas`);
    console.log(`   - ${sections.length} seções criadas`);
    console.log(`   - ${orders.length} pedidos criados`);
    console.log(`   - ${suppliers.length} fornecedores criados`);

  } catch (error) {
    console.error("❌ Erro ao executar seed:", error);
  } finally {
    // Fechar conexão com o banco de dados
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log("Conexão com o banco de dados fechada.");
    }
  }
}

// Executar o script
seedAll();