// routes/mantenimientos.routes.js
import express from 'express';
import {
  crearMantenimiento,
  consultarMantenimientoPublico,
  actualizarEstadoMantenimiento,
} from '../controllers/mantenimientos.controllers.js';
import { verificarToken } from '../middleware/verificarToken.js';

const router = express.Router(); // ✅ ESTA es la forma correcta

router.post('/', verificarToken, crearMantenimiento);
router.get('/consulta', consultarMantenimientoPublico);
router.put('/actualizar-estado/:id', verificarToken, actualizarEstadoMantenimiento);

export default router;
