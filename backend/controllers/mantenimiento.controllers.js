// controllers/mantenimiento.controllers.js
import { db } from '../database/connectionMySQL.js';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export const crearMantenimiento = async (req, res) => {
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

    const [[usuario]] = await db.query(
      'SELECT id_usuario FROM usuarios WHERE username = ?',
      [username]
    );

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const id_usuario = usuario.id_usuario;

    const [[ultimo]] = await db.query(
      'SELECT MAX(CAST(numero_ficha AS UNSIGNED)) AS ultimo FROM mantenimientos'
    );

    const nuevoNumero = ultimo.ultimo ? parseInt(ultimo.ultimo) + 1 : 1;
    const numero_ficha = nuevoNumero.toString().padStart(5, '0');

    const query = `
      INSERT INTO mantenimientos (
        numero_ficha, id_usuario, dni_propietario, nombre_producto,
        responsable_de_retiro, telefono, direccion_propietario, mail,
        empleado_asignado, descripcion_producto, observaciones,
        fecha_inicio, estado, fecha_finalizacion
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      numero_ficha,
      id_usuario,
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
    ];

    const [result] = await db.query(query, values);

    // 🔽 GENERAR PDF
    const doc = new PDFDocument();
    const filename = `ficha-${numero_ficha}.pdf`;
    const filepath = path.join('./pdfs', filename);
    doc.pipe(fs.createWriteStream(filepath));

    doc.fontSize(18).text(`📄 Ficha de Mantenimiento Nº ${numero_ficha}`, { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`📌 Usuario: ${username}`);
    doc.text(`📧 Email: ${mail}`);
    doc.text(`📱 Teléfono: ${telefono}`);
    doc.text(`📍 Dirección: ${direccion_propietario}`);
    doc.text(`🧍 Responsable de retiro: ${responsable_de_retiro}`);
    doc.text(`🛠 Producto: ${nombre_producto}`);
    doc.text(`📝 Descripción: ${descripcion_producto}`);
    doc.text(`💬 Observaciones: ${observaciones}`);
    doc.text(`🧑 Empleado asignado (ID): ${empleado_asignado}`);
    doc.text(`📅 Fecha inicio: ${fecha_inicio}`);
    doc.text(`📅 Fecha fin: ${fecha_finalizacion}`);
    doc.text(`📂 Estado: ${estado}`);

    doc.end();

    // Esperar a que se escriba y luego responder con el archivo
    doc.on('finish', () => {
      res.download(filepath, filename, (err) => {
        if (err) {
          console.error('Error al enviar el PDF:', err);
          res.status(500).json({ error: 'Error al generar el PDF' });
        }
      });
    });

  } catch (error) {
    console.error('❌ Error al crear mantenimiento:', error);
    res.status(500).json({ error: 'Error al crear mantenimiento' });
  }
};
