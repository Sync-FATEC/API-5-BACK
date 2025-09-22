import { Router } from "express";

import { StockController } from "../controllers/StockController";
import { AuthMiddleware } from "../middlewares/authContext";
import { RoleEnum } from "../database/enums/RoleEnum";

const stockController = new StockController();
const router = Router();

router.get("/:userId", stockController.getStockByUser);

router.post("/", AuthMiddleware.requireRole(RoleEnum.ADMIN), stockController.createStock);

router.put("/:stockId", AuthMiddleware.requireRole(RoleEnum.ADMIN), stockController.updateStock);

router.delete("/:stockId", AuthMiddleware.requireRole(RoleEnum.ADMIN), stockController.deleteStock);

export default router;  
