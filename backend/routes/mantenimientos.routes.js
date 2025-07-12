import express from 'express';
import multer from 'multer';
import {
  crearMantenimiento,
  consultarMantenimientoPublico,
  actualizarEstadoMantenimiento,
  subirImagenPaso
} from '../controllers/mantenimientos.controllers.js';
import { verificarToken } from '../middleware/verificarToken.js';

const router = express.Router();

// Multer configurado para subir a carpeta temporal
const upload = multer({ dest: 'temp/' });

router.post('/', verificarToken, crearMantenimiento);
router.get('/consulta', consultarMantenimientoPublico);
router.put('/actualizar-estado/:id', verificarToken, actualizarEstadoMantenimiento);

//  Ruta para subir imagen asociada a un paso del mantenimiento
router.post('/subir-imagen-paso', verificarToken, upload.single('imagen'), subirImagenPaso);

export default router;
