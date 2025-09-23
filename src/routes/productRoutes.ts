import { Router } from "express";
import { ProductController } from "../controllers/ProductController";
import { AuthMiddleware } from "../middlewares/authContext";
import { RoleEnum } from "../database/enums/RoleEnum";

const productController = new ProductController();
const router = Router();

router.get("/", AuthMiddleware.requireRole(RoleEnum.SOLDADO), productController.listAll);
router.get("/:id", AuthMiddleware.requireRole(RoleEnum.SOLDADO), productController.getById);
router.get("/:id/qrcode", AuthMiddleware.requireRole(RoleEnum.SOLDADO), productController.generateQRCode);

router.post("/", AuthMiddleware.requireRole(RoleEnum.SOLDADO), productController.create);
router.put("/:id", AuthMiddleware.requireRole(RoleEnum.SOLDADO), productController.update);

router.delete("/:id", AuthMiddleware.requireRole(RoleEnum.SUPERVISOR), productController.delete);

export default router;
