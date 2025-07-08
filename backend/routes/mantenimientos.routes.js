import { Router } from 'express';
import { crearMantenimiento } from '../controllers/mantenimientos.controllers.js';
import { verificarToken } from '../middleware/verificarToken.js';

const router = Router();

router.post('/mantenimientos', verificarToken, crearMantenimiento);

export default router;
