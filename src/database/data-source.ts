import "reflect-metadata";
import { DataSource } from "typeorm";
import { config } from "dotenv";
import { User } from "./entities/User";
import { Batch } from "./entities/Batch";
import { Merchandise } from "./entities/Merchandise";
import { MerchandiseType } from "./entities/MerchandiseType";
import { Product } from "./entities/Product";
import { ProductType } from "./entities/ProductType";
import { Order } from "./entities/Order";
import { OrderItem } from "./entities/OrderItem";
import { Stock } from "./entities/Stock";
import { UserStock } from "./entities/UserStock";
import { Section } from "./entities/Section";
config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: false,
  entities: [User, Batch, Merchandise, MerchandiseType, Product, ProductType, Order, OrderItem, Stock, UserStock, Section],
});
