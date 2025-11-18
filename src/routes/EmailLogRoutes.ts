import { Router } from 'express';
import { EmailLogController } from '../controllers/EmailLogController';

const router = Router();
const controller = new EmailLogController();

router.get('/commitment-notes/:id', (req, res, next) => controller.listByCommitmentNote(req, res, next));
router.get('/suppliers/:id', (req, res, next) => controller.listBySupplier(req, res, next));

export default router;