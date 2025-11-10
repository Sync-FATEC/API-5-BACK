import { Router } from "express";
import { ExamTypeController } from "../controllers/ExamTypeController";
import { AuthMiddleware } from "../middlewares/authContext";
import { RoleEnum } from "../database/enums/RoleEnum";

const controller = new ExamTypeController();
const router = Router();

// Listagem aberta para autenticados
router.get('/', controller.list);

// Somente COORDENADOR_AGENDA gerencia tipos de exame
router.post('/', AuthMiddleware.requireRole(RoleEnum.COORDENADOR_AGENDA), controller.create);
router.patch('/:id', AuthMiddleware.requireRole(RoleEnum.COORDENADOR_AGENDA), controller.update);
router.delete('/:id', AuthMiddleware.requireRole(RoleEnum.COORDENADOR_AGENDA), controller.delete);

export default router;