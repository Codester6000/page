// routes/usuarios.routes.js
import { Router } from 'express';
import {
  buscarUsuariosPorUsername,
  obtenerTodosLosUsuarios
} from '../controllers/usuarios.controllers.js';
import { verificarToken } from '../middleware/verificarToken.js';

const router = Router();

// ✅ Ruta para buscar por username parcial (autocomplete)
router.get('/buscar-usuarios', verificarToken, buscarUsuariosPorUsername);

// ✅ Ruta para obtener todos los usuarios (para el formulario)
router.get('/', verificarToken, obtenerTodosLosUsuarios); // ESTA ES LA QUE FALTABA

export default router;
