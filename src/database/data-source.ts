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
config();

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DB_URL,
  synchronize: true,
  ssl: { rejectUnauthorized: false },
  logging: false,
  entities: [User, Batch, Merchandise, MerchandiseType, Order, OrderItem, Stock, UserStock, Section, LogMerchandiseType, Supplier],
});
