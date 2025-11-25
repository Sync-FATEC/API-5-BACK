import "reflect-metadata";
import { DataSource } from "typeorm";
import { config } from "dotenv";
import { User } from "./entities/User";
import { Batch } from "./entities/Batch";
import { Merchandise } from "./entities/Merchandise";
import { MerchandiseType } from "./entities/MerchandiseType";
import { Order } from "./entities/Order";
import { OrderItem } from "./entities/OrderItem";
import { Stock } from "./entities/Stock";
import { UserStock } from "./entities/UserStock";
import { Section } from "./entities/Section";
import { LogMerchandiseType } from "./entities/LogMerchandiseType";
import { Supplier } from "./entities/Supplier";
import { CommitmentNote } from "./entities/CommitmentNote";
import { ExamType } from "./entities/ExamType";
import { ExamPreparationInstruction } from "./entities/ExamPreparationInstruction";
import { Appointment } from "./entities/Appointment";
import { EntryHistory } from "./entities/EntryHistory";
import { EmailLog } from "./entities/EmailLog";
import { NotificationLog } from "./entities/NotificationLog";
import { EmailTemplate } from "./entities/EmailTemplate";
import { EmailTemplateVersion } from "./entities/EmailTemplateVersion";
config();

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DB_URL,
  synchronize: true,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  logging: false,
  extra: {
    keepAlive: true,
    keepAliveInitialDelayMillis: Number(process.env.DB_KEEPALIVE_DELAY_MS || 0),
    connectionTimeoutMillis: Number(process.env.DB_CONN_TIMEOUT_MS || 5000),
    idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT_MS || 10000),
    max: Number(process.env.DB_POOL_MAX || 10),
    query_timeout: Number(process.env.DB_QUERY_TIMEOUT_MS || 0),
    statement_timeout: Number(process.env.DB_STATEMENT_TIMEOUT_MS || 0),
  },
  entities: [User, Batch, Merchandise, MerchandiseType, Order, OrderItem, Stock, UserStock, Section, LogMerchandiseType, Supplier, EntryHistory, ExamType, Appointment, CommitmentNote, ExamPreparationInstruction, NotificationLog, EmailTemplate, EmailTemplateVersion, EmailLog, EmailTemplate],
});