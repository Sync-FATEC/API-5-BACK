import { Router } from "express";
import { MerchandiseController } from "../controllers/MerchandiseController";
import { AuthMiddleware } from "../middlewares/authContext";
import { RoleEnum } from "../database/enums/RoleEnum";

const merchandiseController = new MerchandiseController();
const router = Router();

router.get("/", AuthMiddleware.requireRole(RoleEnum.SOLDADO), merchandiseController.listAll);
router.get("/:id", AuthMiddleware.requireRole(RoleEnum.SOLDADO), merchandiseController.getById);
router.get("/:id/qrcode", AuthMiddleware.requireRole(RoleEnum.SOLDADO), merchandiseController.generateQRCode);

router.post("/", AuthMiddleware.requireRole(RoleEnum.SOLDADO), merchandiseController.create);
router.put("/:id", AuthMiddleware.requireRole(RoleEnum.SOLDADO), merchandiseController.update);

router.delete("/:id", AuthMiddleware.requireRole(RoleEnum.SUPERVISOR), merchandiseController.delete);

export default router;
