import express, { Request, Response } from "express";
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import cors from "cors";
import { AppDataSource } from "./database/data-source";
import { authMiddleware } from "./middlewares/authContext";
import { systemErrorHandler } from "./middlewares/SystemError";
import { OrderScheduler } from "./schedulers/OrderScheduler";
import { AppointmentScheduler } from "./schedulers/AppointmentScheduler";
import { CommitmentNoteScheduler } from "./schedulers/CommitmentNoteScheduler";

import authRouter from "./routes/authRoutes";
import stockRouter from "./routes/StockRoutes";
import merchandiseRouter from "./routes/MerchandiseRoutes";
import merchandiseTypeRouter from "./routes/MerchandiseTypeRoutes";
import sectionRouter from "./routes/SectionRoutes";
import orderRouter from "./routes/OrderRoutes";
import supplierRouter from "./routes/SupplierRoutes";
import reportRouter from "./routes/ReportRoutes";
import examTypeRouter from "./routes/ExamTypeRoutes";
import appointmentRouter from "./routes/AppointmentRoutes";
import commitmentNoteRouter from "./routes/CommitmentNoteRoutes";
import examPreparationRouter from "./routes/ExamPreparationInstructionRoutes";
import emailTemplateRouter from "./routes/EmailTemplateRoutes";
import emailLogRouter from "./routes/EmailLogRoutes";

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API 2025',
      version: '1.0.0',
      description: 'Documentação da API 2025',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/database/entities/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

const app = express();
app.use(cors());

// Custom middleware to skip body parsing for multipart requests
app.use((req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  
  console.log(`📝 [BODY_PARSER_MIDDLEWARE] ${req.method} ${req.path} - Content-Type: ${contentType}`);
  
  if (contentType.includes('multipart/form-data')) {
    console.log(`   → Pulando body parser (deixando multer processar)`);
    return next();
  }
  
  // For other content types, use standard parsing
  if (contentType.includes('application/json') || contentType === '') {
    console.log(`   → Aplicando JSON parser`);
    express.json({ limit: '10mb' })(req, res, next);
  } else {
    console.log(`   → Aplicando URL-encoded parser`);
    express.urlencoded({ limit: '10mb', extended: true })(req, res, next);
  }
});

// Servir arquivos estáticos (uploads)
app.use(express.static('uploads'));

// Swagger route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/auth", authRouter);
app.use(authMiddleware);

// Rotas protegidas por autenticação
app.use("/commitment-notes", commitmentNoteRouter);
app.use("/sections", sectionRouter);
app.use("/orders", orderRouter);
app.use("/merchandise", merchandiseRouter);
app.use("/merchandise-types", merchandiseTypeRouter);
app.use("/stocks", stockRouter);
app.use("/suppliers", supplierRouter);
app.use("/reports", reportRouter);
app.use("/exam-types", examTypeRouter);
app.use("/exam-preparations", examPreparationRouter);
app.use("/email-templates", emailTemplateRouter);
app.use("/email-logs", emailLogRouter);
app.use("/appointments", appointmentRouter);
app.use(systemErrorHandler);

AppDataSource.initialize()
  .then(() => {
    app.listen(3000, () => {
      console.log("API on http://localhost:3000 \n Swagger on http://localhost:3000/api-docs ");
      
      const orderScheduler = new OrderScheduler();
      orderScheduler.startScheduler(15);
      const neScheduler = new CommitmentNoteScheduler();
      const rawInterval = process.env.NE_SCHEDULER_INTERVAL_MINUTES;
      const parsed = Number(rawInterval);
      const neInterval = Number.isFinite(parsed) && parsed > 0 ? parsed : 60;
      neScheduler.startScheduler(neInterval);
    });
  })
  .catch((err) => console.error("Data Source init error:", err));
