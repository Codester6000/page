// routes/mantenimientos.routes.js
import express from 'express';
import multer from 'multer';
import {
  crearMantenimiento,
  consultarMantenimientoPublico,
  actualizarEstadoMantenimiento,
  subirImagenPaso,
  eliminarImagenPaso,
  obtenerTodosLosMantenimientos
} from '../controllers/mantenimientos.controllers.js';
import { verificarToken } from '../middleware/verificarToken.js';

const router = express.Router();

// Configuración de multer para subir imágenes a carpeta temporal
const upload = multer({ dest: 'temp/' });

// Crear nuevo mantenimiento (requiere autenticación)
router.post('/', verificarToken, crearMantenimiento);

// Consulta pública por DNI y número de ficha
router.get('/consulta', consultarMantenimientoPublico);

// Actualiza estado y pasos del mantenimiento (requiere autenticación)
router.put('/actualizar-estado/:id', verificarToken, actualizarEstadoMantenimiento);

// Obtener todos los mantenimientos (para vista general)
router.get('/todos', verificarToken, obtenerTodosLosMantenimientos);

// Subir imagen asociada a un paso (requiere autenticación)
router.post('/subir-imagen-paso', verificarToken, upload.single('imagen'), subirImagenPaso);

// Eliminar una imagen de un paso (si implementado)
router.delete('/imagen-paso/:id_imagen', verificarToken, eliminarImagenPaso);

export default router;
