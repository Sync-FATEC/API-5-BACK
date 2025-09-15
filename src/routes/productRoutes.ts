import { Router } from "express";
import { ProductController } from "../controllers/ProductController";
import { AuthMiddleware } from "../middlewares/authContext";
import { RoleEnum } from "../database/enums/RoleEnum";

const productController = new ProductController();
const router = Router();

router.get("/", AuthMiddleware.requireRole([RoleEnum.SOLDADO, RoleEnum.SUPERVISOR, RoleEnum.ADMIN]), productController.listAll);
router.get("/:id", AuthMiddleware.requireRole([RoleEnum.SOLDADO, RoleEnum.SUPERVISOR, RoleEnum.ADMIN]), productController.getById);

router.post("/", AuthMiddleware.requireRole([RoleEnum.SOLDADO, RoleEnum.SUPERVISOR, RoleEnum.ADMIN]), productController.create);
router.put("/:id", AuthMiddleware.requireRole([RoleEnum.SOLDADO, RoleEnum.SUPERVISOR, RoleEnum.ADMIN]), productController.update);

router.delete("/:id", AuthMiddleware.requireRole([RoleEnum.SUPERVISOR, RoleEnum.ADMIN]), productController.delete);

export default router;
