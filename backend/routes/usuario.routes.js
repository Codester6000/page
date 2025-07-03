import express from 'express';
import { buscarUsuariosPorUsername } from '../controllers/usuarios.controllers.js';

const router = express.Router();

router.get('/usuarios', buscarUsuariosPorUsername);

export default router;