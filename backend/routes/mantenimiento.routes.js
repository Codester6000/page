import express from "express";
import { db } from "../database/connectionMySQL.js";
import { validarJwt, validarRol } from "../auth.js";

const mantenimientoRouter = express.Router();

mantenimientoRouter.post("/", validarJwt, validarRol(2), async (req, res) => {
  console.log("Entró al POST de mantenimiento");
  console.log("req.body:", req.body);

  try {
    const {
      nombre_producto,
      responsable_de_retiro,
      telefono,
      direccion_propietario,
      mail,
      empleado_asignado,
      descripcion_producto,
      observaciones,
    } = req.body;

    // Obtener el último numero_ficha
    const [[{ ultimo }]] = await db.execute(
      "SELECT MAX(numero_ficha) AS ultimo FROM mantenimientos"
    );
    const nuevoNumeroFicha = (ultimo || 0) + 1;

    const sql = `
      INSERT INTO mantenimientos (
        numero_ficha,
        nombre_producto,
        responsable_de_retiro,
        telefono,
        direccion_propietario,
        mail,
        empleado_asignado,
        descripcion_producto,
        observaciones,
        fecha_inicio,
        estado
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 'Pendiente')
    `;

    const [result] = await db.execute(sql, [
      nuevoNumeroFicha,
      nombre_producto,
      responsable_de_retiro,
      telefono,
      direccion_propietario,
      mail,
      empleado_asignado,
      descripcion_producto,
      observaciones,
    ]);

    res.status(201).json({
      message: "Producto registrado para mantenimiento",
      id: result.insertId,
      numero_ficha: nuevoNumeroFicha,
    });
  } catch (error) {
    console.error("Error al guardar mantenimiento:", error);
    res.status(500).json({ error: "Error al registrar el mantenimiento" });
  }
});

export default mantenimientoRouter;
