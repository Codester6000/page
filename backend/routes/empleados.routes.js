import express from "express";
import { db } from "../database/connectionMySQL.js";
import { body, param } from "express-validator";
import { verificarValidaciones } from "../middleware/validaciones.js";

const empleadosRouter = express.Router();

// Crear empleado
empleadosRouter.post(
  "/",
  [
    body("nombre").notEmpty().withMessage("El nombre es obligatorio"),
    body("apellido").notEmpty(),
    body("email").isEmail(),
    body("direccion").notEmpty(),
    body("dni").isNumeric(),
    body("telefono").notEmpty(),
    body("fecha_ingreso").notEmpty().isDate(),
    verificarValidaciones,
  ],
  async (req, res) => {
    const {
      nombre,
      apellido,
      email,
      direccion,
      dni,
      telefono,
      fecha_ingreso,
    } = req.body;

    try {
      const sql = `INSERT INTO empleados 
        (nombre, apellido, email, direccion, dni, telefono, fecha_ingreso)
        VALUES (?, ?, ?, ?, ?, ?, ?)`;

      await db.execute(sql, [
        nombre,
        apellido,
        email,
        direccion,
        dni,
        telefono,
        fecha_ingreso,
      ]);

      return res.status(201).json({ mensaje: "Empleado creado con éxito" });

    } catch (error) {
      console.error(error);

      if (error.code === "ER_DUP_ENTRY") {
        if (error.message.includes("dni")) {
          return res.status(400).json({ error: "El DNI ya está registrado." });
        }
        if (error.message.includes("email")) {
          return res.status(400).json({ error: "El email ya está registrado." });
        }
        return res.status(400).json({ error: "Dato duplicado." });
      }

      return res.status(500).json({ error: "Error al crear empleado" });
    }
  }
);

// Obtener todos los empleados
empleadosRouter.get("/", async (req, res) => {
  try {
    const [empleados] = await db.execute("SELECT * FROM empleados");
    res.status(200).json({ empleados });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener los empleados" });
  }
});

// Editar datos de un empleado
empleadosRouter.put(
  "/:id",
  [
    param("id").isNumeric(),
    body("nombre").optional().notEmpty(),
    body("apellido").optional().notEmpty(),
    body("email").optional().isEmail(),
    body("direccion").optional().notEmpty(),
    body("dni").optional().isNumeric(),
    body("telefono").optional().notEmpty(),
    body("fecha_ingreso").optional().isDate(),
    verificarValidaciones,
  ],
  async (req, res) => {
    const id = req.params.id;
    const campos = req.body;

    if (Object.keys(campos).length === 0) {
      return res.status(400).json({ error: "No se enviaron datos para actualizar" });
    }

    const columnas = Object.keys(campos)
      .map((key) => `${key} = ?`)
      .join(", ");

    const valores = Object.values(campos);

    try {
      const sql = `UPDATE empleados SET ${columnas} WHERE id_empleado = ?`;
      await db.execute(sql, [...valores, id]);
      res.status(200).json({ mensaje: "Empleado actualizado con éxito" });
    } catch (error) {
      console.error(error);

      if (error.code === "ER_DUP_ENTRY") {
        if (error.message.includes("dni")) {
          return res.status(400).json({ error: "El DNI ya está registrado." });
        }
        if (error.message.includes("email")) {
          return res.status(400).json({ error: "El email ya está registrado." });
        }
        return res.status(400).json({ error: "Dato duplicado." });
      }

      res.status(500).json({ error: "Error al actualizar el empleado" });
    }
  }
);

// Cambiar estado (activo / inactivo)
empleadosRouter.patch(
  "/estado/:id",
  [
    param("id").isNumeric(),
    body("estado")
      .isIn(["Activo", "Inactivo"])
      .withMessage("El estado debe ser 'Activo' o 'Inactivo'"),
    verificarValidaciones,
  ],
  async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;

    try {
      const [result] = await db.execute(
        "UPDATE empleados SET estado = ? WHERE id_empleado = ?",
        [estado, id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Empleado no encontrado" });
      }

      const [rows] = await db.execute(
        "SELECT * FROM empleados WHERE id_empleado = ?",
        [id]
      );

      res.status(200).json({ mensaje: `Estado actualizado a ${estado}`, empleado: rows[0] });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error al cambiar el estado del empleado" });
    }
  }
);

// 👇 exportación por defecto corregida
export default empleadosRouter;
