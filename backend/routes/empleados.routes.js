// routes/empleados.routes.js
import { Router } from 'express';
import { verificarToken } from '../middleware/verificarToken.js';
import { obtenerEmpleados } from '../controllers/empleados.controller.js';

const router = Router();

router.get('/', verificarToken, obtenerEmpleados);

export default router;
