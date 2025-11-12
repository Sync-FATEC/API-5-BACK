import express, { Request, Response } from "express";
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import cors from "cors";
import { AppDataSource } from "./database/data-source";
import { authMiddleware } from "./middlewares/authContext";
import { systemErrorHandler } from "./middlewares/SystemError";
import { OrderScheduler } from "./schedulers/OrderScheduler";

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
app.use(express.json());

// Swagger route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/auth", authRouter);
app.use(authMiddleware);

// Rotas protegidas por autenticação
app.use("/sections", sectionRouter);
app.use("/orders", orderRouter);
app.use("/merchandise", merchandiseRouter);
app.use("/merchandise-types", merchandiseTypeRouter);
app.use("/stocks", stockRouter);
app.use("/suppliers", supplierRouter);
app.use("/commitment-notes", commitmentNoteRouter);
app.use("/reports", reportRouter);
app.use("/exam-types", examTypeRouter);
app.use("/appointments", appointmentRouter);
app.use(systemErrorHandler);

AppDataSource.initialize()
  .then(() => {
    app.listen(3000, () => {
      console.log("API on http://localhost:3000 \n Swagger on http://localhost:3000/api-docs ");
      
      const orderScheduler = new OrderScheduler();
      orderScheduler.startScheduler(15);
    });
  })
  .catch((err) => console.error("Data Source init error:", err));
