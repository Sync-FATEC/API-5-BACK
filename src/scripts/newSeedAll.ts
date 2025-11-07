import { AppDataSource } from "../database/data-source";
import { User } from "../database/entities/User";
import { Stock } from "../database/entities/Stock";
import { Batch } from "../database/entities/Batch";
import { MerchandiseType } from "../database/entities/MerchandiseType";
import { Merchandise } from "../database/entities/Merchandise";
import { Order } from "../database/entities/Order";
import { OrderItem } from "../database/entities/OrderItem";
import { Section } from "../database/entities/Section";
import { Supplier } from "../database/entities/Supplier";
import { UserStock } from "../database/entities/UserStock";

// Enums
import { RoleEnum } from "../database/enums/RoleEnum";
import { StockResponsibility } from "../database/enums/StockResponsability";
import { MerchandiseStatus } from "../database/entities/Merchandise";
import { MerchandiseGroup } from "../database/enums/MerchandiseGroup";

// Services
import { UserServices } from "../services/UserServices";
import { StockServices } from "../services/StockServices";
import { SupplierService } from "../services/SupplierService";
import { SectionService } from "../services/SectionService";
import { MerchandiseTypeService } from "../services/MerchandiseTypeService";
import { MerchandiseService } from "../services/MerchandiseService";
import { OrderService } from "../services/OrderService";

// Types
import { UsersType } from "../types/UsersType";
import { SupplierCreateType } from "../types/SupplierType";
import { MerchandiseTypeType } from "../types/ProductTypeType";
import { MerchandiseTypeEnum, MerchandiseCreateByRecordNumber } from "../types/ProductType";
import { OrderDTO, OrderItemDTO } from "../types/OrderSectionDTO";

// Firebase
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { firebaseAuth } from "../config/firebase";

// Instanciar services
const userService = new UserServices();
const stockService = new StockServices();
const supplierService = new SupplierService();
const sectionService = new SectionService();
const merchandiseTypeService = new MerchandiseTypeService();
const merchandiseService = new MerchandiseService();
const orderService = new OrderService();

// Helpers para CNPJ na execução de seeds (mantém serviços intactos)
function normalizeCnpjStr(cnpj: string): string {
  return (cnpj || '').replace(/\D/g, '');
}

function calcDigit(numbers: number[], weights: number[]): number {
  let sum = 0;
  for (let i = 0; i < numbers.length; i++) {
    sum += numbers[i] * weights[i];
  }
  const mod = sum % 11;
  return mod < 2 ? 0 : 11 - mod;
}

function fixCnpj(cnpj: string): string {
  const n = normalizeCnpjStr(cnpj);
  const base12 = n.slice(0, 12).split('').map(Number);
  if (base12.length !== 12) return n; // caso não tenha 12 dígitos base, retorna como está
  const d1 = calcDigit(base12, [5,4,3,2,9,8,7,6,5,4,3,2]);
  const d2 = calcDigit([...base12, d1], [6,5,4,3,2,9,8,7,6,5,4,3,2]);
  return base12.join('') + String(d1) + String(d2);
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
    try {
      // Verificar se usuário já existe
      const existingUser = await userRepository.findOne({
        where: { email: userData.email }
      });

      if (existingUser) {
        console.log(`Usuário já existe: ${userData.email}`);
        createdUsers.push(existingUser);
        continue;
      }

      // Criar usuário no Firebase
      const firebaseUid = await createFirebaseUser(userData.email, userData.password);

      // Criar usuário no banco usando service
      const userToCreate: UsersType = {
        email: userData.email,
        name: userData.name,
        firebaseUid: firebaseUid,
        role: userData.role
      };

      await userService.createUser(userToCreate);

      // Buscar usuário criado
      const createdUser = await userRepository.findOne({
        where: { email: userData.email }
      });

      if (createdUser) {
        createdUsers.push(createdUser);
        console.log(`Usuário criado: ${userData.name} (${userData.email})`);
      }
    } catch (error) {
      console.error(`Erro ao criar usuário ${userData.email}:`, error);
    }
  }

  console.log(`${createdUsers.length} usuários processados.`);
  return createdUsers;
}

async function seedStocks() {
  console.log("=== Criando Stocks ===");

  const stocksData = [
    { name: "Farmácia", location: "Prédio A - Térreo" },
    { name: "Almoxarifado", location: "Prédio B - Subsolo" }
  ];

  const createdStocks: Stock[] = [];

  for (const stockData of stocksData) {
    try {
      const stock = await stockService.createStock(stockData.name, stockData.location);
      createdStocks.push(stock);
      console.log(`Stock criado: ${stockData.name}`);
    } catch (error) {
      console.error(`Erro ao criar stock ${stockData.name}:`, error);
    }
  }

  console.log(`${createdStocks.length} stocks criados.`);
  return createdStocks;
}

async function seedUserStocks(users: User[], stocks: Stock[]) {
  console.log("=== Associando Usuários aos Stocks ===");

  const userStockRepository = AppDataSource.getRepository(UserStock);

  const associations = [
    { userEmail: "admin@admin.com", stockName: "Farmácia", responsibility: StockResponsibility.ADMIN },
    { userEmail: "admin@admin.com", stockName: "Almoxarifado", responsibility: StockResponsibility.ADMIN },
    { userEmail: "supervisor@supervisor.com", stockName: "Farmácia", responsibility: StockResponsibility.MANAGER },
    { userEmail: "supervisor@supervisor.com", stockName: "Almoxarifado", responsibility: StockResponsibility.MANAGER },
    { userEmail: "soldado@soldado.com", stockName: "Almoxarifado", responsibility: StockResponsibility.USER }
  ];

  for (const assoc of associations) {
    try {
      const user = users.find(u => u.email === assoc.userEmail);
      const stock = stocks.find(s => s.name === assoc.stockName);

      if (!user || !stock) {
        console.log(`Usuário ou stock não encontrado para associação: ${assoc.userEmail} -> ${assoc.stockName}`);
        continue;
      }

      // Verificar se associação já existe
      const existingAssoc = await userStockRepository.findOne({
        where: { userId: user.id, stockId: stock.id }
      });

      if (existingAssoc) {
        console.log(`Associação já existe: ${user.name} -> ${stock.name}`);
        continue;
      }

      const userStock = userStockRepository.create({
        userId: user.id,
        stockId: stock.id,
        responsibility: assoc.responsibility,
        user: user,
        stock: stock
      });

      await userStockRepository.save(userStock);
      console.log(`Associação criada: ${user.name} -> ${stock.name} (${assoc.responsibility})`);
    } catch (error) {
      console.error(`Erro ao criar associação ${assoc.userEmail} -> ${assoc.stockName}:`, error);
    }
  }
}

async function seedSuppliers() {
  console.log("=== Criando Fornecedores ===");

  const suppliersData: SupplierCreateType[] = [
    {
      razaoSocial: "Farmácia Central LTDA",
      nomeResponsavel: "Dr. João Silva",
      cargoResponsavel: "Diretor Comercial",
      cnpj: "12.345.678/0001-90",
      emailPrimario: "comercial@farmaciacentral.com.br",
      emailSecundario: "vendas@farmaciacentral.com.br"
    },
    {
      razaoSocial: "Distribuidora Médica Sul",
      nomeResponsavel: "Maria Santos",
      cargoResponsavel: "Gerente de Vendas",
      cnpj: "98.765.432/0001-10",
      emailPrimario: "vendas@medisul.com.br"
    },
    {
      razaoSocial: "Papelaria Escritório Total",
      nomeResponsavel: "Carlos Oliveira",
      cargoResponsavel: "Proprietário",
      cnpj: "11.222.333/0001-44",
      emailPrimario: "contato@escritoriototal.com.br",
      emailSecundario: "vendas@escritoriototal.com.br"
    },
    {
      razaoSocial: "TechEquip Informática",
      nomeResponsavel: "Ana Costa",
      cargoResponsavel: "Diretora",
      cnpj: "55.666.777/0001-88",
      emailPrimario: "ana@techequip.com.br"
    }
  ];

  const createdSuppliers: any[] = [];

  for (const supplierData of suppliersData) {
    try {
      // Garantir CNPJ válido conforme algoritmo antes de chamar o service
      const fixedCnpj = fixCnpj(supplierData.cnpj);
      const supplier = await supplierService.createSupplier({
        ...supplierData,
        cnpj: fixedCnpj
      });
      createdSuppliers.push(supplier);
      console.log(`Fornecedor criado: ${supplierData.razaoSocial}`);
    } catch (error) {
      console.error(`Erro ao criar fornecedor ${supplierData.razaoSocial}:`, error);
    }
  }

  console.log(`${createdSuppliers.length} fornecedores criados.`);
  return createdSuppliers;
}

async function seedSections() {
  console.log("=== Criando Seções ===");

  const sectionsData = [
    { name: "Enfermaria Geral" },
    { name: "UTI" },
    { name: "Centro Cirúrgico" },
    { name: "Emergência" },
    { name: "Administração" },
    { name: "Recursos Humanos" },
    { name: "Financeiro" },
    { name: "TI" }
  ];

  const createdSections: Section[] = [];

  for (const sectionData of sectionsData) {
    try {
      const section = await sectionService.create(sectionData);
      createdSections.push(section);
      console.log(`Seção criada: ${sectionData.name}`);
    } catch (error) {
      console.error(`Erro ao criar seção ${sectionData.name}:`, error);
    }
  }

  console.log(`${createdSections.length} seções criadas.`);
  return createdSections;
}

async function seedMerchandiseTypes(stocks: Stock[]) {
  console.log("=== Criando Tipos de Mercadoria ===");

  const merchandiseTypesData: Omit<MerchandiseTypeType, 'id'>[] = [
    // FARMÁCIA - Medicamentos e Materiais Médicos
    {
      name: "Paracetamol 500mg",
      recordNumber: "MED001",
      unitOfMeasure: "Comprimido",
      controlled: true,
      group: MerchandiseGroup.ALMOX_VIRTUAL,
      minimumStock: 100,
      stockId: stocks[0].id // Farmácia
    },
    {
      name: "Dipirona 500mg",
      recordNumber: "MED002",
      unitOfMeasure: "Comprimido",
      controlled: true,
      group: MerchandiseGroup.ALMOX_VIRTUAL,
      minimumStock: 150,
      stockId: stocks[0].id // Farmácia
    },
    {
      name: "Soro Fisiológico 0,9% 500ml",
      recordNumber: "MED003",
      unitOfMeasure: "Frasco",
      controlled: true,
      group: MerchandiseGroup.ALMOX_VIRTUAL,
      minimumStock: 50,
      stockId: stocks[0].id // Farmácia
    },
    {
      name: "Seringa Descartável 10ml",
      recordNumber: "MED004",
      unitOfMeasure: "Unidade",
      controlled: false,
      group: MerchandiseGroup.EXPEDIENTE,
      minimumStock: 200,
      stockId: stocks[0].id // Farmácia
    },
    {
      name: "Luva Descartável Nitrilo",
      recordNumber: "MED005",
      unitOfMeasure: "Par",
      controlled: false,
      group: MerchandiseGroup.EXPEDIENTE,
      minimumStock: 500,
      stockId: stocks[0].id // Farmácia
    },

    // ALMOXARIFADO - Material de Escritório e Equipamentos
    {
      name: "Papel A4 75g",
      recordNumber: "ALM001",
      unitOfMeasure: "Resma",
      controlled: false,
      group: MerchandiseGroup.EXPEDIENTE,
      minimumStock: 100,
      stockId: stocks[1].id // Almoxarifado
    },
    {
      name: "Caneta Esferográfica Azul",
      recordNumber: "ALM002",
      unitOfMeasure: "Unidade",
      controlled: false,
      group: MerchandiseGroup.EXPEDIENTE,
      minimumStock: 200,
      stockId: stocks[1].id // Almoxarifado
    },
    {
      name: "Computador Desktop",
      recordNumber: "ALM003",
      unitOfMeasure: "Unidade",
      controlled: true,
      group: MerchandiseGroup.PERMANENTE,
      minimumStock: 3,
      stockId: stocks[1].id // Almoxarifado
    },
    {
      name: "Monitor LED 24\"",
      recordNumber: "ALM004",
      unitOfMeasure: "Unidade",
      controlled: true,
      group: MerchandiseGroup.PERMANENTE,
      minimumStock: 5,
      stockId: stocks[1].id // Almoxarifado
    },
    {
      name: "Impressora Multifuncional",
      recordNumber: "ALM005",
      unitOfMeasure: "Unidade",
      controlled: true,
      group: MerchandiseGroup.PERMANENTE,
      minimumStock: 2,
      stockId: stocks[1].id // Almoxarifado
    },

    // ALMOXARIFADO - Materiais de Limpeza e Manutenção (movidos para o almoxarifado)
    {
      name: "Detergente Neutro 5L",
      recordNumber: "LMP001",
      unitOfMeasure: "Galão",
      controlled: false,
      group: MerchandiseGroup.LIMPEZA,
      minimumStock: 20,
      stockId: stocks[1].id // Almoxarifado
    },
    {
      name: "Álcool 70% 1L",
      recordNumber: "LMP002",
      unitOfMeasure: "Frasco",
      controlled: false,
      group: MerchandiseGroup.LIMPEZA,
      minimumStock: 30,
      stockId: stocks[1].id // Almoxarifado
    },
    {
      name: "Papel Higiênico",
      recordNumber: "LMP003",
      unitOfMeasure: "Rolo",
      controlled: false,
      group: MerchandiseGroup.EXPEDIENTE,
      minimumStock: 100,
      stockId: stocks[1].id // Almoxarifado
    },
    {
      name: "Sabonete Líquido 500ml",
      recordNumber: "LMP004",
      unitOfMeasure: "Frasco",
      controlled: false,
      group: MerchandiseGroup.LIMPEZA,
      minimumStock: 25,
      stockId: stocks[1].id // Almoxarifado
    },
    {
      name: "Vassoura",
      recordNumber: "LMP005",
      unitOfMeasure: "Unidade",
      controlled: false,
      group: MerchandiseGroup.PERMANENTE,
      minimumStock: 10,
      stockId: stocks[1].id // Almoxarifado
    }
  ];

  const createdMerchandiseTypes: MerchandiseType[] = [];

  for (const typeData of merchandiseTypesData) {
    try {
      const merchandiseType = await merchandiseTypeService.createMerchandiseType(typeData);
      createdMerchandiseTypes.push(merchandiseType);
      console.log(`Tipo de mercadoria criado: ${typeData.name}`);
    } catch (error) {
      console.error(`Erro ao criar tipo de mercadoria ${typeData.name}:`, error);
    }
  }

  console.log(`${createdMerchandiseTypes.length} tipos de mercadoria criados.`);
  return createdMerchandiseTypes;
}

async function seedBatches(suppliers: any[]) {
  console.log("=== Criando Lotes ===");

  const batchRepository = AppDataSource.getRepository(Batch);

  const batchesData = [
    {
      expirationDate: new Date("2025-12-31")
    },
    {
      expirationDate: new Date("2025-06-30")
    },
    {
      expirationDate: new Date("2026-03-15")
    },
    {
      expirationDate: new Date("2027-01-20")
    }
  ];

  const createdBatches: Batch[] = [];

  for (const batchData of batchesData) {
    try {
      const batch = batchRepository.create(batchData);
      const savedBatch = await batchRepository.save(batch);
      createdBatches.push(savedBatch);
      console.log(`Lote criado com vencimento: ${savedBatch.expirationDate.toISOString().split('T')[0]}`);
    } catch (error) {
      console.error(`Erro ao criar lote com vencimento ${batchData.expirationDate}:`, error);
    }
  }

  console.log(`${createdBatches.length} lotes criados.`);
  return createdBatches;
}

async function seedMerchandises(merchandiseTypes: MerchandiseType[], batches: Batch[]) {
  console.log("=== Criando Mercadorias ===");

  const merchandisesData: MerchandiseCreateByRecordNumber[] = [
    // Medicamentos
    { recordNumber: "MED001", quantity: 500, status: MerchandiseStatus.AVAILABLE },
    { recordNumber: "MED002", quantity: 750, status: MerchandiseStatus.AVAILABLE },
    { recordNumber: "MED003", quantity: 200, status: MerchandiseStatus.AVAILABLE },
    { recordNumber: "MED004", quantity: 1000, status: MerchandiseStatus.AVAILABLE },
    { recordNumber: "MED005", quantity: 2000, status: MerchandiseStatus.AVAILABLE },

    // Material de escritório
    { recordNumber: "ALM001", quantity: 300, status: MerchandiseStatus.AVAILABLE },
    { recordNumber: "ALM002", quantity: 800, status: MerchandiseStatus.AVAILABLE },
    { recordNumber: "ALM003", quantity: 15, status: MerchandiseStatus.AVAILABLE },
    { recordNumber: "ALM004", quantity: 20, status: MerchandiseStatus.AVAILABLE },
    { recordNumber: "ALM005", quantity: 8, status: MerchandiseStatus.AVAILABLE },

    // Material de limpeza
    { recordNumber: "LMP001", quantity: 50, status: MerchandiseStatus.AVAILABLE },
    { recordNumber: "LMP002", quantity: 80, status: MerchandiseStatus.AVAILABLE },
    { recordNumber: "LMP003", quantity: 200, status: MerchandiseStatus.AVAILABLE },
    { recordNumber: "LMP004", quantity: 60, status: MerchandiseStatus.AVAILABLE },
    { recordNumber: "LMP005", quantity: 25, status: MerchandiseStatus.AVAILABLE }
  ];

  const createdMerchandises: any[] = [];
  const validDate = new Date();

  for (const merchandiseData of merchandisesData) {
    try {
      const merchandise = await merchandiseService.createMerchandiseByRecordNumber(merchandiseData, validDate);
      createdMerchandises.push(merchandise);
      console.log(`Mercadoria criada: ${merchandiseData.recordNumber} - Qtd: ${merchandiseData.quantity}`);
    } catch (error) {
      console.error(`Erro ao criar mercadoria ${merchandiseData.recordNumber}:`, error);
    }
  }

  console.log(`${createdMerchandises.length} mercadorias criadas.`);
  return createdMerchandises;
}

async function seedOrders(sections: Section[], stocks: Stock[], merchandiseTypes: MerchandiseType[]) {
  console.log("=== Criando Pedidos ===");

  const ordersData: Omit<OrderDTO, 'id'>[] = [
    // Pedidos para Enfermaria Geral
    {
      creationDate: new Date("2025-11-06"),
      withdrawalDate: new Date("2025-11-07"),
      status: "Finalizado",
      sectionId: sections[0].id, // Enfermaria Geral
      stockId: stocks[0].id, // Farmácia
      orderItems: [
        { merchandiseId: merchandiseTypes.find(mt => mt.recordNumber === "MED001")?.id || "", quantity: 50 },
        { merchandiseId: merchandiseTypes.find(mt => mt.recordNumber === "MED003")?.id || "", quantity: 10 }
      ]
    },
    // Pedidos para UTI
    {
      creationDate: new Date("2025-11-07"),
      status: "Pendente",
      sectionId: sections[1].id, // UTI
      stockId: stocks[0].id, // Farmácia
      orderItems: [
        { merchandiseId: merchandiseTypes.find(mt => mt.recordNumber === "MED002")?.id || "", quantity: 30 },
        { merchandiseId: merchandiseTypes.find(mt => mt.recordNumber === "MED004")?.id || "", quantity: 100 },
        { merchandiseId: merchandiseTypes.find(mt => mt.recordNumber === "MED005")?.id || "", quantity: 200 }
      ]
    },
    // Pedidos para Administração
    {
      creationDate: new Date("2025-11-05"),
      withdrawalDate: new Date("2025-11-05"),
      status: "Finalizado",
      sectionId: sections[4].id, // Administração
      stockId: stocks[1].id, // Almoxarifado
      orderItems: [
        { merchandiseId: merchandiseTypes.find(mt => mt.recordNumber === "ALM001")?.id || "", quantity: 20 },
        { merchandiseId: merchandiseTypes.find(mt => mt.recordNumber === "ALM002")?.id || "", quantity: 50 }
      ]
    },
    // Pedidos para TI
    {
      creationDate: new Date("2025-11-08"),
      status: "Pendente",
      sectionId: sections[7].id, // TI
      stockId: stocks[1].id, // Almoxarifado
      orderItems: [
        { merchandiseId: merchandiseTypes.find(mt => mt.recordNumber === "ALM003")?.id || "", quantity: 2 },
        { merchandiseId: merchandiseTypes.find(mt => mt.recordNumber === "ALM004")?.id || "", quantity: 3 }
      ]
    },
    // Pedidos para limpeza geral
    {
      creationDate: new Date("2025-11-04"),
      withdrawalDate: new Date("2025-11-05"),
      status: "Finalizado",
      sectionId: sections[4].id, // Administração
      stockId: stocks[1].id, // Almoxarifado
      orderItems: [
        { merchandiseId: merchandiseTypes.find(mt => mt.recordNumber === "LMP001")?.id || "", quantity: 5 },
        { merchandiseId: merchandiseTypes.find(mt => mt.recordNumber === "LMP002")?.id || "", quantity: 10 },
        { merchandiseId: merchandiseTypes.find(mt => mt.recordNumber === "LMP003")?.id || "", quantity: 30 }
      ]
    }
    ,
    // Pedidos recentes (Novembro/2025)
    {
      creationDate: new Date("2025-11-05"),
      status: "Pendente",
      sectionId: sections[1].id, // UTI
      stockId: stocks[0].id, // Farmácia
      orderItems: [
        { merchandiseId: merchandiseTypes.find(mt => mt.recordNumber === "MED001")?.id || "", quantity: 40 },
        { merchandiseId: merchandiseTypes.find(mt => mt.recordNumber === "MED003")?.id || "", quantity: 20 }
      ]
    },
    {
      creationDate: new Date("2025-11-06"),
      withdrawalDate: new Date("2025-11-06"),
      status: "Finalizado",
      sectionId: sections[4].id, // Administração
      stockId: stocks[1].id, // Almoxarifado
      orderItems: [
        { merchandiseId: merchandiseTypes.find(mt => mt.recordNumber === "ALM001")?.id || "", quantity: 30 },
        { merchandiseId: merchandiseTypes.find(mt => mt.recordNumber === "ALM002")?.id || "", quantity: 60 }
      ]
    },
    {
      creationDate: new Date("2025-11-07"),
      status: "Pendente",
      sectionId: sections[7].id, // TI
      stockId: stocks[1].id, // Almoxarifado
      orderItems: [
        { merchandiseId: merchandiseTypes.find(mt => mt.recordNumber === "ALM003")?.id || "", quantity: 1 },
        { merchandiseId: merchandiseTypes.find(mt => mt.recordNumber === "ALM004")?.id || "", quantity: 2 }
      ]
    },
    {
      creationDate: new Date("2025-11-07"),
      withdrawalDate: new Date("2025-11-08"),
      status: "Finalizado",
      sectionId: sections[0].id, // Enfermaria Geral
      stockId: stocks[0].id, // Farmácia
      orderItems: [
        { merchandiseId: merchandiseTypes.find(mt => mt.recordNumber === "MED004")?.id || "", quantity: 120 },
        { merchandiseId: merchandiseTypes.find(mt => mt.recordNumber === "MED005")?.id || "", quantity: 150 }
      ]
    },
    {
      creationDate: new Date("2025-11-04"),
      withdrawalDate: new Date("2025-11-05"),
      status: "Finalizado",
      sectionId: sections[3].id, // Emergência
      stockId: stocks[1].id, // Almoxarifado
      orderItems: [
        { merchandiseId: merchandiseTypes.find(mt => mt.recordNumber === "LMP001")?.id || "", quantity: 8 },
        { merchandiseId: merchandiseTypes.find(mt => mt.recordNumber === "LMP002")?.id || "", quantity: 12 }
      ]
    },
    {
      creationDate: new Date("2025-11-03"),
      status: "Pendente",
      sectionId: sections[2].id, // Centro Cirúrgico
      stockId: stocks[0].id, // Farmácia
      orderItems: [
        { merchandiseId: merchandiseTypes.find(mt => mt.recordNumber === "MED003")?.id || "", quantity: 25 },
        { merchandiseId: merchandiseTypes.find(mt => mt.recordNumber === "MED004")?.id || "", quantity: 80 }
      ]
    },
    {
      creationDate: new Date("2025-11-02"),
      withdrawalDate: new Date("2025-11-03"),
      status: "Finalizado",
      sectionId: sections[5].id, // Recursos Humanos
      stockId: stocks[1].id, // Almoxarifado
      orderItems: [
        { merchandiseId: merchandiseTypes.find(mt => mt.recordNumber === "ALM001")?.id || "", quantity: 40 },
        { merchandiseId: merchandiseTypes.find(mt => mt.recordNumber === "LMP003")?.id || "", quantity: 50 }
      ]
    },
    {
      creationDate: new Date("2025-11-01"),
      status: "Pendente",
      sectionId: sections[6].id, // Financeiro
      stockId: stocks[1].id, // Almoxarifado
      orderItems: [
        { merchandiseId: merchandiseTypes.find(mt => mt.recordNumber === "LMP004")?.id || "", quantity: 20 },
        { merchandiseId: merchandiseTypes.find(mt => mt.recordNumber === "LMP005")?.id || "", quantity: 5 }
      ]
    },
    {
      creationDate: new Date("2025-10-30"),
      withdrawalDate: new Date("2025-10-31"),
      status: "Finalizado",
      sectionId: sections[1].id, // UTI
      stockId: stocks[0].id, // Farmácia
      orderItems: [
        { merchandiseId: merchandiseTypes.find(mt => mt.recordNumber === "MED002")?.id || "", quantity: 60 }
      ]
    },
    {
      creationDate: new Date("2025-10-28"),
      status: "Pendente",
      sectionId: sections[4].id, // Administração
      stockId: stocks[1].id, // Almoxarifado
      orderItems: [
        { merchandiseId: merchandiseTypes.find(mt => mt.recordNumber === "ALM005")?.id || "", quantity: 2 }
      ]
    }
  ];

  const createdOrders: any[] = [];

  for (const orderData of ordersData) {
    try {
      // Filtrar orderItems que têm merchandiseId válido
      const validOrderItems = orderData.orderItems.filter(item => item.merchandiseId !== "");
      
      if (validOrderItems.length === 0) {
        console.log(`Pulando pedido sem itens válidos`);
        continue;
      }

      const orderToCreate = {
        ...orderData,
        orderItems: validOrderItems
      };

      const order = await orderService.create(orderToCreate);
      createdOrders.push(order);
      console.log(`Pedido criado: ${order.id} - ${validOrderItems.length} itens`);
    } catch (error) {
      console.error(`Erro ao criar pedido:`, error);
    }
  }

  console.log(`${createdOrders.length} pedidos criados.`);
  return createdOrders;
}

async function dropDatabase() {
  console.log("=== Limpando Banco de Dados ===");
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  try {
    // Monta lista dinâmica de tabelas a partir dos metadados
    const tableNames = AppDataSource.entityMetadatas
      .map(meta => `"${meta.tableName}"`)
      .join(", ");

    if (tableNames.length === 0) {
      console.log("Nenhuma tabela encontrada para truncar.");
      return;
    }

    const sql = `TRUNCATE TABLE ${tableNames} RESTART IDENTITY CASCADE;`;
    await queryRunner.query(sql);
    console.log("Todas as tabelas truncadas com CASCADE e RESTART IDENTITY.");
  } catch (error) {
    console.error("Erro ao truncar tabelas com CASCADE:", error);
    throw error;
  } finally {
    await queryRunner.release();
  }
}

async function recreateDatabase() {
  console.log("=== Recriando Estrutura do Banco ===");
  try {
    await AppDataSource.synchronize(true);
    console.log("Estrutura do banco recriada com sucesso.");
  } catch (error) {
    console.error("Erro ao recriar estrutura do banco:", error);
    throw error;
  }
}

export async function seedAll() {
  try {
    console.log("🌱 Iniciando seed completo do banco de dados...");
    
    // Conectar ao banco
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    // Limpar e recriar banco
    await dropDatabase();
    await recreateDatabase();

    // Executar seeds na ordem correta
    console.log("\n📋 Executando seeds na ordem de dependências...");
    
    const users = await seedUsers();
    const stocks = await seedStocks();
    await seedUserStocks(users, stocks);
    const suppliers = await seedSuppliers();
    const sections = await seedSections();
    const merchandiseTypes = await seedMerchandiseTypes(stocks);
    const batches = await seedBatches(suppliers);
    const merchandises = await seedMerchandises(merchandiseTypes, batches);
    const orders = await seedOrders(sections, stocks, merchandiseTypes);

    console.log("\n✅ Seed completo executado com sucesso!");
    console.log("📊 Resumo:");
    console.log(`   - ${users.length} usuários`);
    console.log(`   - ${stocks.length} stocks`);
    console.log(`   - ${suppliers.length} fornecedores`);
    console.log(`   - ${sections.length} seções`);
    console.log(`   - ${merchandiseTypes.length} tipos de mercadoria`);
    console.log(`   - ${batches.length} lotes`);
    console.log(`   - ${merchandises.length} mercadorias`);
    console.log(`   - ${orders.length} pedidos`);

  } catch (error) {
    console.error("❌ Erro durante execução do seed:", error);
    throw error;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  seedAll()
    .then(() => {
      console.log("🎉 Processo de seed finalizado!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Falha no processo de seed:", error);
      process.exit(1);
    });
}