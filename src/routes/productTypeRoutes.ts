import { Router } from "express";
import { ProductTypeController } from "../controllers/ProductTypeController";
import { AuthMiddleware } from "../middlewares/authContext";
import { RoleEnum } from "../database/enums/RoleEnum";

const productTypeController = new ProductTypeController();
const router = Router();

router.get("/", AuthMiddleware.requireRole(RoleEnum.SOLDADO), productTypeController.listAll);
router.get("/:id", AuthMiddleware.requireRole(RoleEnum.SOLDADO), productTypeController.getById);

router.post("/", AuthMiddleware.requireRole(RoleEnum.SOLDADO), productTypeController.create);
router.put("/:id", AuthMiddleware.requireRole(RoleEnum.SOLDADO), productTypeController.update);

router.delete("/:id", AuthMiddleware.requireRole(RoleEnum.SUPERVISOR), productTypeController.delete);

export default router;
