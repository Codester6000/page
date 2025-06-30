import express from 'express';
import { buscarUsuariosPorUsername } from '../controllers/usuarios.controller.js';

const router = express.Router();

router.get('/usuarios', buscarUsuariosPorUsername);

export default router;