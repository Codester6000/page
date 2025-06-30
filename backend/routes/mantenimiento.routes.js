// backend/routes/mantenimiento.routes.js
import express from 'express';
import { crearMantenimiento } from '../controllers/mantenimiento.controllers.js';

const router = express.Router();

router.post('/', crearMantenimiento); // ruta relativa

export default router;