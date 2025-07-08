// routes/usuarios.routes.js
import express from "express";
import { body, validationResult } from "express-validator";
import { db } from "../backend/database/connectionMySQL.js";
import bcrypt from "bcrypt";
import { validarBodyInfoUsuario, validarBodyRegister } from "../backend/middleware/validaciones.js";
import { validarJwt, validarRol } from "../backend/auth.js";

const usuarioRouter = express.Router();

// Obtener todos los usuarios (solo admins)
usuarioRouter.get("/", validarJwt, validarRol(2), async (req, res) => {
  const [result] = await db.execute("SELECT * FROM usuarios");
  res.status(200).send({ resultado: result });
});

// Registrar nuevo usuario
usuarioRouter.post("/", validarBodyRegister(), async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    res.status(400).send({ errores: errores.array() });
    return;
  }
  try {
    const { username, password, email, fechaNacimiento } = req.body;
    const [usuarioRepetido] = await db.execute("SELECT * FROM usuarios WHERE username = ?", [username]);
    if (usuarioRepetido.length > 0) {
      return res.status(400).send("Ya existe un usuario registrado con ese username");
    }
    const [emailRepetido] = await db.execute("SELECT * FROM usuarios WHERE email = ?", [email]);
    if (emailRepetido.length > 0) {
      return res.status(400).send("Ya existe un usuario registrado con ese email");
    }

    const passwordHashed = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
      "INSERT INTO usuarios (username, password, email, fechaNacimiento) VALUES (?, ?, ?, ?)",
      [username, passwordHashed, email, fechaNacimiento]
    );
    res.status(200).send({ result });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error en el servidor");
  }
});

// Agregar info extra del usuario
usuarioRouter.post("/agregar-info", validarJwt, validarBodyInfoUsuario(), async (req, res) => {
  const id = req.user.userId;
  const { nombre, apellido, direccion, telefono } = req.body;
  try {
    const [result] = await db.execute(
      "UPDATE usuarios SET nombre = ?, apellido = ?, direccion = ?, telefono = ? WHERE id_usuario = ?",
      [nombre, apellido, direccion, telefono, id]
    );
    res.status(200).send({ result });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error en el servidor");
  }
});

// Obtener usuario por username (público o para usar en mantenimientos)
usuarioRouter.get("/username/:username", async (req, res) => {
  const { username } = req.params;
  try {
    const [[usuario]] = await db.query(
      "SELECT id_usuario, nombre, apellido, direccion, telefono, email FROM usuarios WHERE username = ?",
      [username]
    );
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.status(200).json(usuario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

export default usuarioRouter;