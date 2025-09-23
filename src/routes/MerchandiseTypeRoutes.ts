import { Router } from "express";
import { MerchandiseTypeController } from "../controllers/MerchandiseTypeController";
import { AuthMiddleware } from "../middlewares/authContext";
import { RoleEnum } from "../database/enums/RoleEnum";

const merchandiseTypeController = new MerchandiseTypeController();
const router = Router();

router.get("/", AuthMiddleware.requireRole(RoleEnum.SOLDADO), merchandiseTypeController.listAll);
router.get("/:id", AuthMiddleware.requireRole(RoleEnum.SOLDADO), merchandiseTypeController.getById);

router.post("/", AuthMiddleware.requireRole(RoleEnum.SOLDADO), merchandiseTypeController.create);
router.put("/:id", AuthMiddleware.requireRole(RoleEnum.SOLDADO), merchandiseTypeController.update);

router.delete("/:id", AuthMiddleware.requireRole(RoleEnum.SUPERVISOR), merchandiseTypeController.delete);

export default router;
