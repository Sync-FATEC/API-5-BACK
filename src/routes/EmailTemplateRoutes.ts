import { Router } from "express";
import { EmailTemplateController } from "../controllers/EmailTemplateController";
import { AuthMiddleware } from "../middlewares/authContext";
import { RoleEnum } from "../database/enums/RoleEnum";

const controller = new EmailTemplateController();
const router = Router();

router.get('/allowed-vars', controller.allowed);
router.get('/', AuthMiddleware.requireRole(RoleEnum.ADMIN), controller.list);
router.get('/:id', AuthMiddleware.requireRole(RoleEnum.ADMIN), controller.get);
router.get('/:id/versions', AuthMiddleware.requireRole(RoleEnum.ADMIN), controller.versions);
router.post('/', AuthMiddleware.requireRole(RoleEnum.ADMIN), controller.create);
router.patch('/:id', AuthMiddleware.requireRole(RoleEnum.ADMIN), controller.update);
router.patch('/:id/autosave', AuthMiddleware.requireRole(RoleEnum.ADMIN), controller.autosave);
router.post('/:id/restore/:versionId', AuthMiddleware.requireRole(RoleEnum.ADMIN), controller.restore);
router.post('/:id/preview', AuthMiddleware.requireRole(RoleEnum.ADMIN), controller.preview);

export default router;