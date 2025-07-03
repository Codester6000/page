// routes/usuarios.routes.js
import { Router } from 'express';
import { buscarUsuariosPorUsername } from '../controllers/usuarios.controllers.js';

const router = Router();

router.get('/buscar-usuarios', buscarUsuariosPorUsername); // <- esta línea debe existir

export default router;
