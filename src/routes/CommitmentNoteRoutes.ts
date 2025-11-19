import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { CommitmentNoteController } from '../controllers/CommitmentNoteController';

const router = Router();
const controller = new CommitmentNoteController();

// Configurar multer para uploads de PDF
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req: any, file: any, cb: any) => {
    console.log(`📝 Multer fileFilter - file: ${file.fieldname}, mimetype: ${file.mimetype}`);
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos PDF são permitidos'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

/**
 * @swagger
 * /commitment-notes:
 *   get:
 *     summary: Lista todas as notas de empenho
 *     tags: [CommitmentNotes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de notas de empenho
 */
router.get('/', (req, res, next) => controller.listAll(req, res, next));

/**
 * @swagger
 * /commitment-notes/{id}:
 *   get:
 *     summary: Busca nota de empenho por ID
 *     tags: [CommitmentNotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da nota de empenho
 *     responses:
 *       200:
 *         description: Nota de empenho encontrada
 */
router.get('/:id', (req, res, next) => controller.getById(req, res, next));

/**
 * @swagger
 * /commitment-notes:
 *   post:
 *     summary: Cria uma nova nota de empenho
 *     tags: [CommitmentNotes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - supplierId
 *               - valor
 *               - numeroNota
 *               - dataNota
 *               - ug
 *               - razaoSocial
 *               - cnpj
 *             properties:
 *               supplierId:
 *                 type: string
 *                 format: uuid
 *               valor:
 *                 type: number
 *               numeroNota:
 *                 type: string
 *               dataNota:
 *                 type: string
 *                 format: date
 *               ug:
 *                 type: string
 *               razaoSocial:
 *                 type: string
 *               cnpj:
 *                 type: string
 *               nomeResponsavelExtraido:
 *                 type: string
 *               nomeResponsavelManual:
 *                 type: string
 *               cargoResponsavel:
 *                 type: string
 *               frequenciaCobrancaDias:
 *                 type: number
 *                 default: 15
 *               urgencia:
 *                 type: string
 *               dataPrevistaEntrega:
 *                 type: string
 *                 format: date
 *               pdfFile:
 *                 type: string
 *                 format: binary
 *                 description: Arquivo PDF da Nota de Empenho (opcional)
 *     responses:
 *       201:
 *         description: Nota de empenho criada com sucesso
 */
router.post('/', (req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  
  console.log(`📝 [POST /commitment-notes] Content-Type: ${contentType}`);
  
  // Se for multipart/form-data, usar multer
  if (contentType.includes('multipart/form-data')) {
    console.log(`   → Processando como multipart/form-data (multer)`);
    upload.single('pdfFile')(req, res, (err) => {
      console.log(`📝 [DEPOIS MULTER] req.file:`, req.file ? `EXISTS - ${req.file.originalname}` : 'UNDEFINED');
      console.log(`📝 [DEPOIS MULTER] req.body keys:`, req.body ? Object.keys(req.body) : 'UNDEFINED');
      
      if (err) {
        console.error(`❌ Erro no multer:`, err.message);
        return res.status(400).json({ error: err.message });
      }
      
      controller.create(req, res, next);
    });
  } else {
    // Se for application/json, processar sem multer (o JSON pode conter pdfFile em base64)
    console.log(`   → Processando como application/json`);
    console.log(`📝 [NO MULTER] req.body tem pdfFile:`, req.body?.pdfFile ? 'SIM' : 'NÃO');
    controller.create(req, res, next);
  }
});

/**
 * @swagger
 * /commitment-notes/{id}:
 *   put:
 *     summary: Atualiza uma nota de empenho
 *     tags: [CommitmentNotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Nota de empenho atualizada com sucesso
 */
router.put('/:id', (req, res, next) => controller.update(req, res, next));

/**
 * @swagger
 * /commitment-notes/{id}/admin-fields:
 *   patch:
 *     summary: Atualiza campos administrativos da nota de empenho (ADMIN)
 *     tags: [CommitmentNotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               processoAdm:
 *                 type: boolean
 *               materialRecebido:
 *                 type: boolean
 *               nfEntregueNoAlmox:
 *                 type: boolean
 *               justificativaMais60Dias:
 *                 type: string
 *               enviadoParaLiquidar:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Campos administrativos atualizados com sucesso
 */
router.patch('/:id/admin-fields', (req, res, next) => controller.updateAdminFields(req, res, next));

/**
 * @swagger
 * /commitment-notes/{id}/finalize:
 *   post:
 *     summary: Finaliza a nota de empenho (ADMIN)
 *     tags: [CommitmentNotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Nota de empenho finalizada com sucesso
 */
router.post('/:id/finalize', (req, res, next) => controller.finalize(req, res, next));

/**
 * @swagger
 * /commitment-notes/{id}:
 *   delete:
 *     summary: Remove uma nota de empenho
 *     tags: [CommitmentNotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Nota de empenho removida com sucesso
 */
router.delete('/:id', (req, res, next) => controller.delete(req, res, next));

export default router;