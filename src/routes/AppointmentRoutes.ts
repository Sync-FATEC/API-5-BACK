import { Router } from "express";
import { AppointmentController } from "../controllers/AppointmentController";
import { AuthMiddleware } from "../middlewares/authContext";
import { RoleEnum } from "../database/enums/RoleEnum";

const controller = new AppointmentController();
const router = Router();

// Consulta (PACIENTE vê apenas os próprios; coordenador vê todos)
router.get('/', controller.list);

// Criação/Atualização/Cancelamento restritos ao COORDENADOR_AGENDA
router.post('/', AuthMiddleware.requireRole(RoleEnum.COORDENADOR_AGENDA), controller.create);
router.patch('/:id', AuthMiddleware.requireRole(RoleEnum.COORDENADOR_AGENDA), controller.update);
router.delete('/:id', AuthMiddleware.requireRole(RoleEnum.COORDENADOR_AGENDA), controller.cancel);

// Recibo em PDF: PACIENTE (apenas do próprio) e COORDENADOR_AGENDA
router.get('/:id/receipt', controller.receipt);

// Relatório por período (apenas coordenador)
router.get('/report', AuthMiddleware.requireRole(RoleEnum.COORDENADOR_AGENDA), controller.report);

// Busca de pacientes para seleção (apenas coordenador)
router.get('/patients', AuthMiddleware.requireRole(RoleEnum.COORDENADOR_AGENDA), controller.searchPatients);

export default router;