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
      name: "Estoque Principal",
      location: "Depósito Central - Setor A",
      active: true
    },
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
      stock: stocks[0],
      responsibility: StockResponsibility.ADMIN
    },
    {
      user: users.find(u => u.role === RoleEnum.SUPERVISOR),
      stock: stocks[1],
      responsibility: StockResponsibility.MANAGER
    },
    {
      user: users.find(u => u.role === RoleEnum.SOLDADO),
      stock: stocks[2],
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
    {
      expirationDate: new Date('2025-12-31')
    },
    {
      expirationDate: new Date('2026-06-30')
    },
    {
      expirationDate: new Date('2024-12-31')
    }
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
    {
      name: "Medicamento Analgésico",
      recordNumber: "MED001",
      unitOfMeasure: "Comprimido",
      quantityTotal: 500,
      controlled: true,
      group: MerchandiseGroup.ALMOX_VIRTUAL,
      minimumStock: 100,
      stockId: stocks[1].id // Farmácia
    },
    {
      name: "Material de Escritório",
      recordNumber: "ALM001",
      unitOfMeasure: "Unidade",
      quantityTotal: 200,
      controlled: false,
      group: MerchandiseGroup.EXPEDIENTE,
      minimumStock: 50,
      stockId: stocks[2].id // Almoxarifado
    },
    {
      name: "Equipamento Médico",
      recordNumber: "MED002",
      unitOfMeasure: "Peça",
      quantityTotal: 25,
      controlled: true,
      group: MerchandiseGroup.PERMANENTE,
      minimumStock: 10,
      stockId: stocks[1].id // Farmácia
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
    merchandiseType.quantityTotal = typeData.quantityTotal;
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
  const merchandiseRepository = AppDataSource.getRepository(Merchandise);

  const merchandises = [
    {
      batch: batches[0],
      type: merchandiseTypes[0],
      quantity: 500,
      status: MerchandiseStatus.AVAILABLE
    },
    {
      batch: batches[1],
      type: merchandiseTypes[1],
      quantity: 200,
      status: MerchandiseStatus.AVAILABLE
    },
    {
      batch: batches[2],
      type: merchandiseTypes[2],
      quantity: 25,
      status: MerchandiseStatus.RESERVED
    }
  ];

  const createdMerchandises: Merchandise[] = [];

  for (const merchData of merchandises) {
    const merchandise = new Merchandise();
    merchandise.batchId = merchData.batch.id;
    merchandise.typeId = merchData.type.id;
    merchandise.quantity = merchData.quantity;
    merchandise.status = merchData.status;
    merchandise.batch = merchData.batch;
    merchandise.type = merchData.type;

    const savedMerchandise = await merchandiseRepository.save(merchandise);
    createdMerchandises.push(savedMerchandise);

    console.log(`Mercadoria criada: ${merchData.type.name} - Qtd: ${merchData.quantity} (${merchData.status})`);
  }

  return createdMerchandises;
}



async function seedSections() {
  console.log("=== Criando Seções ===");
  const sectionRepository = AppDataSource.getRepository(Section);
  const sections = [
    { name: "Empresa Saúde Total" },
    { name: "Empresa Vida Plena" },
    { name: "Empresa Bem Estar" },
    { name: "Empresa MedPrime" },
    { name: "Empresa Nova Saúde" },
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

async function seedOrders(sections: Section[], stocks: Stock[]) {
  console.log("=== Criando Pedidos ===");
  const orderRepository = AppDataSource.getRepository(Order);
  const orders = [
    {
      creationDate: new Date('2024-01-15'),
      withdrawalDate: new Date('2024-01-20'),
      status: "COMPLETED",
      section: sections[0],
      stock: stocks[0] // Estoque Principal
    },
    {
      creationDate: new Date('2024-01-25'),
      withdrawalDate: null,
      status: "PENDING",
      section: sections[1],
      stock: stocks[1] // Farmácia
    },
    {
      creationDate: new Date('2024-01-30'),
      withdrawalDate: null,
      status: "PENDING",
      section: sections[2],
      stock: stocks[1] // Farmácia
    },
    {
      creationDate: new Date('2024-02-05'),
      withdrawalDate: null,
      status: "PENDING",
      section: sections[3],
      stock: stocks[2] // Almoxarifado
    },
    {
      creationDate: new Date('2024-02-10'),
      withdrawalDate: null,
      status: "COMPLETED",
      section: sections[4],
      stock: stocks[0] // Estoque Principal
    }
  ];
  const createdOrders: Order[] = [];
  for (const orderData of orders) {
    const order = new Order();
    order.creationDate = orderData.creationDate;
    order.withdrawalDate = orderData.withdrawalDate as any;
    order.status = orderData.status;
    order.section = orderData.section;
    order.stock = orderData.stock;
    const savedOrder = await orderRepository.save(order);
    createdOrders.push(savedOrder);
    console.log(`Pedido criado: ${savedOrder.status} - Data: ${savedOrder.creationDate.toISOString().split('T')[0]} - Seção: ${savedOrder.section.name} - Estoque: ${savedOrder.stock.name}`);
  }
  return createdOrders;
}

async function seedOrderItems(orders: Order[], merchandises: Merchandise[]) {
  console.log("=== Criando Itens de Pedido ===");
  const orderItemRepository = AppDataSource.getRepository(OrderItem);

  const orderItems = [
    {
      order: orders[0],
  merchandiseType: merchandises[0].type,
      quantity: 50
    },
    {
      order: orders[1],
  merchandiseType: merchandises[1].type,
      quantity: 25
    },
    {
      order: orders[2],
  merchandiseType: merchandises[2].type,
      quantity: 5
    },
    {
      order: orders[3],
  merchandiseType: merchandises[0].type,
      quantity: 15
    },
    {
      order: orders[4],
  merchandiseType: merchandises[1].type,
      quantity: 30
    }
  ];

  const createdOrderItems: OrderItem[] = [];

  for (const itemData of orderItems) {
    const orderItem = new OrderItem();
    orderItem.quantity = itemData.quantity;
    orderItem.order = itemData.order;
    orderItem.merchandiseType = itemData.merchandiseType;

    const savedOrderItem = await orderItemRepository.save(orderItem);
    createdOrderItems.push(savedOrderItem);

    console.log(`Item de pedido criado: Tipo=${itemData.merchandiseType.name} (id=${itemData.merchandiseType.id}) - Qtd: ${itemData.quantity}`);
  }

  return createdOrderItems;
}

async function seedAll() {
  try {
    // Inicializar conexão com o banco de dados
    await AppDataSource.initialize();
    console.log("Conexão com o banco de dados estabelecida.");

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

    // 8. Criar pedidos (depende de sections e stocks)
    const orders = await seedOrders(sections, stocks);

    // 9. Criar itens de pedido (depende de orders e merchandises)
    const orderItems = await seedOrderItems(orders, merchandises);

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
    console.log(`   - ${orderItems.length} itens de pedido criados`);

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