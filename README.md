# Sistema de Controle de Estoque - Backend

<div align="center">
  <h3>📦 Base Administrativa de Caçapava</h3>
  <p>Backend do sistema de gerenciamento de estoque do almoxarifado e farmácia</p>

  ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
  ![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
  ![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
  ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
</div>

## 📚 Documentação da API

Acesse a documentação da API em:
```bash
http://localhost:3000/api-docs
```

# 🚦 Como Executar

## 📋 Pré-requisitos
- [Node.js](https://nodejs.org/) ou [Python](https://www.python.org/)  
- [PostgreSQL](https://www.postgresql.org/)  
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/) instalado  

---

## 📥 Instalação
Clone o repositório e instale as dependências:  
```bash
git clone https://github.com/Sync-FATEC/API-5-BACK
cd API-5-BACK/src
npm install
```

---

## ⚙️ Configuração
Antes de rodar o projeto, é necessário configurar alguns arquivos **não incluídos no repositório** por conterem informações sensíveis:  

- Coloque o arquivo `firebase.json` dentro da pasta:  
  ```
  /firebase
  ```

- Crie ou adicione o arquivo `.env` na **raiz do projeto**:  
  ```
  API-5-BACK/.env
  ```

> ⚠️ Esses arquivos não estão disponíveis neste repositório. Solicite ao responsável pelo projeto ou configure-os conforme a documentação oficial (Firebase e variáveis de ambiente necessárias).  

---

## 🗄️ Criar dados iniciais
Após configurar o ambiente e antes de iniciar o servidor, rode o seed para criar o usuário administrador padrão no banco de dados:  
```bash
npm run seed:admin
```

---

## ▶️ Execução
Rodar servidor em ambiente de desenvolvimento:  
```bash
npm run dev
```


## 📁 Estrutura de Diretórios
```
src/
├── config/                       # Configurações da aplicação
│   └── firebase.ts               # Configuração do Firebase Admin SDK
│
├── controllers/                  # Controladores (camada de requisição/resposta)
│   ├── AppointmentController.ts  # Controlador de agendamentos
│   ├── CommitmentNoteController.ts
│   ├── EmailLogController.ts
│   ├── EmailTemplateController.ts
│   ├── ExamPreparationInstructionController.ts
│   ├── ExamTypeController.ts
│   ├── MerchandiseController.ts
│   ├── MerchandiseTypeController.ts
│   ├── OrderController.ts
│   ├── ReportController.ts      # Controlador de relatórios e dashboards
│   ├── SectionController.ts
│   ├── StockController.ts
│   ├── SupplierController.ts
│   └── UserController.ts
│
├── services/                     # Serviços (lógica de negócio)
│   ├── AppointmentService.ts
│   ├── CommitmentNoteService.ts
│   ├── CommitmentNoteEmailService.ts
│   ├── CommitmentNotePdfService.ts
│   ├── EmailLogService.ts
│   ├── EmailTemplateService.ts
│   ├── ExamPreparationInstructionService.ts
│   ├── ExamTypeService.ts
│   ├── ForecastService.ts        # Serviço de previsão de estoque
│   ├── MerchandiseService.ts
│   ├── MerchandiseTypeService.ts
│   ├── NotificationService.ts
│   ├── OrderService.ts
│   ├── PdfService.ts
│   ├── ReportService.ts          # Serviço de relatórios
│   ├── SectionService.ts
│   ├── StockService.ts
│   ├── SupplierService.ts
│   ├── UserService.ts
│   └── predict_balance_forecast.py  # Script Python para previsão
│
├── repository/                   # Repositórios (acesso a dados)
│   ├── AppointmentRepository.ts
│   ├── CommitmentNoteRepository.ts
│   ├── EmailLogRepository.ts
│   ├── EmailTemplateRepository.ts
│   ├── EntryHistoryRepository.ts
│   ├── ExamPreparationInstructionRepository.ts
│   ├── ExamTypeRepository.ts
│   ├── LogMerchandiseType.ts
│   ├── MerchandiseRepository.ts
│   ├── MerchandiseTypeRepository.ts
│   ├── NotificationLogRepository.ts
│   ├── OrderRepository.ts
│   ├── SectionRepository.ts
│   ├── StockRepository.ts
│   ├── SupplierRepository.ts
│   └── UsersRepository.ts
│
├── routes/                       # Rotas (endpoints da API)
│   ├── AppointmentRoutes.ts
│   ├── authRoutes.ts             # Rotas de autenticação
│   ├── CommitmentNoteRoutes.ts
│   ├── EmailLogRoutes.ts
│   ├── EmailTemplateRoutes.ts
│   ├── ExamPreparationInstructionRoutes.ts
│   ├── ExamTypeRoutes.ts
│   ├── MerchandiseRoutes.ts
│   ├── MerchandiseTypeRoutes.ts
│   ├── OrderRoutes.ts
│   ├── ReportRoutes.ts           # Rotas de relatórios
│   ├── SectionRoutes.ts
│   ├── StockRoutes.ts
│   ├── SupplierRoutes.ts
│   └── UserRoutes.ts
│
├── database/                     # Configuração e entidades do banco de dados
│   ├── data-source.ts            # Configuração do TypeORM
│   ├── entities/                 # Entidades (modelos do BD)
│   │   ├── Appointment.ts
│   │   ├── Batch.ts
│   │   ├── CommitmentNote.ts
│   │   ├── EmailLog.ts
│   │   ├── EmailTemplate.ts
│   │   ├── EmailTemplateVersion.ts
│   │   ├── EntryHistory.ts
│   │   ├── ExamPreparationInstruction.ts
│   │   ├── ExamType.ts
│   │   ├── LogMerchandiseType.ts
│   │   ├── Merchandise.ts
│   │   ├── MerchandiseType.ts
│   │   ├── NotificationLog.ts
│   │   ├── Order.ts
│   │   ├── OrderItem.ts
│   │   ├── Section.ts
│   │   ├── Stock.ts
│   │   ├── Supplier.ts
│   │   ├── User.ts
│   │   └── UserStock.ts
│   └── enums/                    # Enumerações do banco
│       ├── OrderStatus.ts
│       ├── UserRole.ts
│       └── ...
│
├── middlewares/                  # Middlewares (autenticação, tratamento de erros)
│   ├── authContext.ts            # Middleware de autenticação Firebase
│   └── SystemError.ts            # Tratamento de erros
│
├── types/                        # Definições de tipos TypeScript
│   ├── AuthContext.ts
│   └── ...
│
├── models/                       # Modelos/DTOs (estruturas de dados)
│   └── [modelos específicos]
│
├── schedulers/                   # Agendadores de tarefas (CRON jobs)
│   └── [tarefas recorrentes]
│
├── scripts/                      # Scripts utilitários
│   ├── seed.ts                   # Script para popular dados iniciais
│   └── ...
│
├── templates/                    # Templates (email, PDF, etc)
│   └── email/                    # Templates de email
│       └── ...
│
├── utils/                        # Funções utilitárias
│   ├── validators.ts
│   ├── formatters.ts
│   └── ...
│
└── index.ts                      # Ponto de entrada da aplicação
```

## 👥 Time
| Nome | Função |
|------|--------|
| José Eduardo Fernandes | Scrum Master |
| Ana Laura Moratelli | Product Owner |
| Arthur Karnas | Desenvolvedora |
| Erik Yokota | Desenvolvedor |
| Filipe Colla | Desenvolvedor |
| João Gabriel Solis | Desenvolvedor |
| Kauê Francisco | Desenvolvedor |

