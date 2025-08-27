import "reflect-metadata";
import { DataSource } from "typeorm";
import { config } from "dotenv";
import { Users } from "./entities/User";
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
  entities: [Users],
});
