import express, { Request, Response } from "express";
import cors from "cors";
import { AppDataSource } from "./database/data-source";
const firebase = require("../firebase/firebase.json");
import admin from "firebase-admin";
import { authMiddleware } from "./middlewares/authContext";
import { systemErrorHandler } from "./middlewares/SystemError";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

import authRouter from "./routes/authRoutes";
import stockRouter from "./routes/StockRoutes";
import productRouter from "./routes/productRoutes";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Inicializar Firebase
export const adminFirebase = admin.initializeApp({ credential: admin.credential.cert(firebase as admin.ServiceAccount) });
const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);

// CONFIGURAÇÕES GLOBAIS DAS ROTAS
const app = express();
app.use(cors());

// Middleware JSON para outras rotas
app.use(express.json());

app.use("/auth", authRouter);

// Apatir daqui todas as rotas precisam de autenticação
app.use(authMiddleware);

// Rotas protegidas por autenticação
app.use("/products", productRouter);
app.use("/stocks", stockRouter);

// Middleware para tratamento de erros SystemError
app.use(systemErrorHandler);

AppDataSource.initialize()
  .then(() => {
    app.listen(3000, () => console.log("API on http://localhost:3000"));
  })
  .catch((err) => console.error("Data Source init error:", err));
