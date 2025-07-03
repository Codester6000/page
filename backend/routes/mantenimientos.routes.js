// routes/mantenimientos.routes.js
import express from 'express';
import { db } from '../database/connectionMySQL.js';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';

const router = express.Router();

// Crear nuevo mantenimiento y generar PDF
router.post('/mantenimientos', async (req, res) => {
  try {
    const {
      username,
      dni_propietario,
      nombre_producto,
      responsable_de_retiro,
      telefono,
      direccion_propietario,
      mail,
      empleado_asignado,
      descripcion_producto,
      observaciones,
      fecha_inicio,
      estado,
      fecha_finalizacion,
    } = req.body;

    // 🔍 Buscar id_usuario a partir del username
    const [[usuario]] = await db.query('SELECT id_usuario FROM usuarios WHERE username = ?', [username]);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    // 🧠 Generar nuevo número de ficha de 5 dígitos
    const [[{ ultimo }]] = await db.query('SELECT MAX(numero_ficha) AS ultimo FROM mantenimientos');
    const numeroFicha = String((parseInt(ultimo) || 0) + 1).padStart(5, '0');

    // ✅ Insertar mantenimiento
    await db.query(
      `INSERT INTO mantenimientos 
      (id_usuario, dni_propietario, nombre_producto, responsable_de_retiro, telefono, direccion_propietario, mail,
       empleado_asignado, descripcion_producto, observaciones, fecha_inicio, estado, fecha_finalizacion, numero_ficha)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        usuario.id_usuario,
        dni_propietario,
        nombre_producto,
        responsable_de_retiro,
        telefono,
        direccion_propietario,
        mail,
        empleado_asignado,
        descripcion_producto,
        observaciones,
        fecha_inicio,
        estado,
        fecha_finalizacion,
        numeroFicha,
      ]
    );

    // 📄 Crear PDF
    const pdfDir = path.resolve('pdfs');
    const pdfPath = path.join(pdfDir, `ficha-${numeroFicha}.pdf`);
    if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir);

    const doc = new PDFDocument();
    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);

    doc.fontSize(18).text(`Ficha de Mantenimiento N° ${numeroFicha}`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(12);
    doc.text(`Usuario: ${username}`);
    doc.text(`DNI Propietario: ${dni_propietario}`);
    doc.text(`Producto: ${nombre_producto}`);
    doc.text(`Responsable de Retiro: ${responsable_de_retiro}`);
    doc.text(`Teléfono: ${telefono}`);
    doc.text(`Dirección: ${direccion_propietario}`);
    doc.text(`Email: ${mail}`);
    doc.text(`Empleado Asignado: ${empleado_asignado}`);
    doc.text(`Descripción: ${descripcion_producto}`);
    doc.text(`Observaciones: ${observaciones}`);
    doc.text(`Fecha de Inicio: ${fecha_inicio}`);
    doc.text(`Fecha de Finalización: ${fecha_finalizacion}`);
    doc.text(`Estado: ${estado}`);
    doc.end();

    // Esperar a que se termine de escribir el PDF antes de responder
    stream.on('finish', () => {
      return res.status(201).json({ numero_ficha: numeroFicha });
    });

    stream.on('error', (err) => {
      console.error('Error escribiendo PDF:', err);
      return res.status(500).json({ error: 'Error generando PDF' });
    });

  } catch (error) {
    console.error('Error creando mantenimiento:', error);
    res.status(500).json({ error: 'Error creando mantenimiento' });
  }
});

// 📥 Endpoint para descargar PDF
router.get('/mantenimientos/pdf/:numeroFicha', (req, res) => {
  const { numeroFicha } = req.params;
  const filePath = path.resolve(`pdfs/ficha-${numeroFicha}.pdf`);
  res.download(filePath, `ficha-${numeroFicha}.pdf`, (err) => {
    if (err) {
      console.error('Error al enviar PDF:', err);
      res.status(500).json({ error: 'No se pudo descargar el PDF' });
    }
  });
});

export default router;
