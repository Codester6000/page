import { Router } from 'express';
import { obtenerEmpleados } from '../controllers/empleados.controller.js';
import { verificarToken } from '../middleware/verificarToken.js';

const router = Router();

router.get('/empleados', verificarToken, obtenerEmpleados);

export default router;