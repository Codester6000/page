// routes/usuarios.routes.js
import express from "express";
import { body, validationResult } from "express-validator";
import { db } from "../backend/database/connectionMySQL.js";
import bcrypt from "bcrypt";
import {
  validarBodyInfoUsuario,
  validarBodyRegister,
} from "../backend/middleware/validaciones.js";
import { validarJwt, validarRol } from "../backend/auth.js";

const usuarioRouter = express.Router();

// ============================================
// RUTAS PÚBLICAS (Sin autenticación)
// ============================================

// Registrar nuevo usuario (cliente)
usuarioRouter.post("/registro", validarBodyRegister(), async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array() });
  }

  try {
    const { username, password, email, fechaNacimiento } = req.body;

    // Verificar username duplicado
    const [usuarioRepetido] = await db.execute(
      "SELECT * FROM usuarios WHERE username = ?",
      [username]
    );
    if (usuarioRepetido.length > 0) {
      return res.status(400).json({
        error: "Ya existe un usuario registrado con ese username",
      });
    }

    // Verificar email duplicado
    const [emailRepetido] = await db.execute(
      "SELECT * FROM usuarios WHERE email = ?",
      [email]
    );
    if (emailRepetido.length > 0) {
      return res.status(400).json({
        error: "Ya existe un usuario registrado con ese email",
      });
    }

    const passwordHashed = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
      "INSERT INTO usuarios (username, password, email, fechaNacimiento, id_rol) VALUES (?, ?, ?, ?, 3)",
      [username, passwordHashed, email, fechaNacimiento]
    );

    res.status(201).json({
      mensaje: "Usuario registrado exitosamente",
      id_usuario: result.insertId,
    });
  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// Obtener usuario por username (público)
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

// ============================================
// RUTAS PROTEGIDAS (Requieren autenticación)
// ============================================

// Agregar info extra del usuario autenticado
usuarioRouter.post(
  "/agregar-info",
  validarJwt,
  validarBodyInfoUsuario(),
  async (req, res) => {
    const id = req.user.userId;
    const { nombre, apellido, direccion, telefono } = req.body;

    try {
      const [result] = await db.execute(
        "UPDATE usuarios SET nombre = ?, apellido = ?, direccion = ?, telefono = ? WHERE id_usuario = ?",
        [nombre, apellido, direccion, telefono, id]
      );

      res.status(200).json({
        mensaje: "Información actualizada exitosamente",
        result,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error en el servidor" });
    }
  }
);

// ============================================
// RUTAS DE GESTIÓN DE USUARIOS (Admin y Sub-Admin)
// Roles permitidos: 2 (Admin General) y 4 (Sub-Admin)
// ============================================

// Obtener roles disponibles para asignar
usuarioRouter.get(
  "/roles-disponibles",
  validarJwt,
  validarRol([2, 4]),
  async (req, res) => {
    try {
      const [result] = await db.execute("CALL sp_obtener_roles_disponibles()");
      res.status(200).json({ roles: result[0] });
    } catch (error) {
      console.error("Error al obtener roles:", error);
      res.status(500).json({ error: "Error al obtener roles disponibles" });
    }
  }
);

// Obtener información del admin general (solo para visualización)
usuarioRouter.get(
  "/admin-general",
  validarJwt,
  validarRol([2, 4]),
  async (req, res) => {
    try {
      const [usuarios] = await db.execute(
        `SELECT 
          u.id_usuario,
          u.username,
          u.email,
          u.id_rol,
          r.nombre_rol,
          u.fechaNacimiento,
          u.nombre,
          u.apellido,
          u.direccion,
          u.telefono
        FROM usuarios u
        INNER JOIN roles r ON u.id_rol = r.id_rol
        WHERE u.id_rol = 2
        LIMIT 1`
      );

      if (usuarios.length > 0) {
        res.status(200).json({ admin: usuarios[0] });
      } else {
        res.status(404).json({ error: "Admin general no encontrado" });
      }
    } catch (error) {
      console.error("Error al obtener admin general:", error);
      res.status(500).json({ error: "Error al obtener admin general" });
    }
  }
);

// Listar todos los usuarios gestionables (Empleados y Sub-Admins)
usuarioRouter.get(
  "/gestion",
  validarJwt,
  validarRol([2, 4]),
  async (req, res) => {
    try {
      const [result] = await db.execute("CALL sp_listar_usuarios()");
      res.status(200).json({ usuarios: result[0] });
    } catch (error) {
      console.error("Error al listar usuarios:", error);
      res.status(500).json({ error: "Error al obtener usuarios" });
    }
  }
);

// Obtener un usuario específico por ID
usuarioRouter.get(
  "/gestion/:id",
  validarJwt,
  validarRol([2, 4]),
  async (req, res) => {
    const { id } = req.params;

    try {
      const [result] = await db.execute("CALL sp_obtener_usuario_por_id(?)", [
        id,
      ]);

      if (result[0].length === 0) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      res.status(200).json({ usuario: result[0][0] });
    } catch (error) {
      console.error("Error al obtener usuario:", error);
      res.status(500).json({ error: "Error al obtener usuario" });
    }
  }
);

// Crear nuevo usuario (Empleado o Sub-Admin)
usuarioRouter.post(
  "/gestion",
  validarJwt,
  validarRol([2, 4]),
  [
    body("username")
      .trim()
      .notEmpty()
      .withMessage("El username es requerido")
      .isLength({ min: 3, max: 25 })
      .withMessage("El username debe tener entre 3 y 25 caracteres"),
    body("password")
      .notEmpty()
      .withMessage("La contraseña es requerida")
      .isLength({ min: 6 })
      .withMessage("La contraseña debe tener al menos 6 caracteres"),
    body("email")
      .trim()
      .notEmpty()
      .withMessage("El email es requerido")
      .isEmail()
      .withMessage("Debe ser un email válido"),
    body("id_rol")
      .notEmpty()
      .withMessage("El rol es requerido")
      .isInt({ min: 1, max: 4 })
      .withMessage("Rol inválido"),
    body("nombre").trim().notEmpty().withMessage("El nombre es requerido"),
    body("apellido").trim().notEmpty().withMessage("El apellido es requerido"),
    body("fechaNacimiento")
      .notEmpty()
      .withMessage("La fecha de nacimiento es requerida")
      .isDate()
      .withMessage("Debe ser una fecha válida"),
  ],
  async (req, res) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({ errores: errores.array() });
    }

    try {
      const {
        username,
        password,
        email,
        id_rol,
        fechaNacimiento,
        nombre,
        apellido,
        direccion,
        telefono,
      } = req.body;

      // Validar que el rol sea 1 (empleado) o 4 (sub-admin)
      if (![1, 4].includes(parseInt(id_rol))) {
        return res.status(400).json({
          error: "Solo se pueden crear empleados o sub-admins",
        });
      }

      // Hash de la contraseña
      const passwordHashed = await bcrypt.hash(password, 10);

      // Llamar al SP para crear usuario
      const [result] = await db.execute(
        "CALL sp_crear_usuario(?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          username,
          passwordHashed,
          email,
          id_rol,
          fechaNacimiento,
          nombre,
          apellido,
          direccion || null,
          telefono || null,
        ]
      );

      res.status(201).json({
        mensaje: "Usuario creado exitosamente",
        id_usuario: result[0][0].id_usuario,
      });
    } catch (error) {
      console.error("Error al crear usuario:", error);

      // Manejar errores específicos
      if (error.sqlMessage) {
        if (error.sqlMessage.includes("Duplicate entry")) {
          if (error.sqlMessage.includes("username")) {
            return res.status(400).json({
              error: "El username ya está en uso",
            });
          }
          if (error.sqlMessage.includes("email")) {
            return res.status(400).json({
              error: "El email ya está en uso",
            });
          }
        }
        return res.status(400).json({ error: error.sqlMessage });
      }

      res.status(500).json({ error: "Error al crear usuario" });
    }
  }
);

// Actualizar usuario existente
usuarioRouter.put(
  "/gestion/:id",
  validarJwt,
  validarRol([2, 4]),
  [
    body("username")
      .trim()
      .notEmpty()
      .withMessage("El username es requerido")
      .isLength({ min: 3, max: 25 })
      .withMessage("El username debe tener entre 3 y 25 caracteres"),
    body("email")
      .trim()
      .notEmpty()
      .withMessage("El email es requerido")
      .isEmail()
      .withMessage("Debe ser un email válido"),
    body("id_rol")
      .notEmpty()
      .withMessage("El rol es requerido")
      .isInt({ min: 1, max: 4 })
      .withMessage("Rol inválido"),
    body("nombre").trim().notEmpty().withMessage("El nombre es requerido"),
    body("apellido").trim().notEmpty().withMessage("El apellido es requerido"),
    body("fechaNacimiento")
      .notEmpty()
      .withMessage("La fecha de nacimiento es requerida")
      .isDate()
      .withMessage("Debe ser una fecha válida"),
  ],
  async (req, res) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({ errores: errores.array() });
    }

    const { id } = req.params;
    const {
      username,
      email,
      id_rol,
      fechaNacimiento,
      nombre,
      apellido,
      direccion,
      telefono,
    } = req.body;

    try {
      // Validar que el rol sea 1 (empleado) o 4 (sub-admin)
      if (![1, 4].includes(parseInt(id_rol))) {
        return res.status(400).json({
          error: "Solo se pueden asignar roles de empleado o sub-admin",
        });
      }

      const [result] = await db.execute(
        "CALL sp_actualizar_usuario(?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          id,
          username,
          email,
          id_rol,
          fechaNacimiento,
          nombre,
          apellido,
          direccion || null,
          telefono || null,
        ]
      );

      res.status(200).json({
        mensaje: "Usuario actualizado exitosamente",
      });
    } catch (error) {
      console.error("Error al actualizar usuario:", error);

      if (error.sqlMessage) {
        if (error.sqlMessage.includes("Duplicate entry")) {
          if (error.sqlMessage.includes("username")) {
            return res.status(400).json({
              error: "El username ya está en uso",
            });
          }
          if (error.sqlMessage.includes("email")) {
            return res.status(400).json({
              error: "El email ya está en uso",
            });
          }
        }
        return res.status(400).json({ error: error.sqlMessage });
      }

      res.status(500).json({ error: "Error al actualizar usuario" });
    }
  }
);

// Actualizar contraseña de un usuario
usuarioRouter.put(
  "/gestion/:id/password",
  validarJwt,
  validarRol([2, 4]),
  [
    body("password")
      .notEmpty()
      .withMessage("La contraseña es requerida")
      .isLength({ min: 6 })
      .withMessage("La contraseña debe tener al menos 6 caracteres"),
  ],
  async (req, res) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({ errores: errores.array() });
    }

    const { id } = req.params;
    const { password } = req.body;

    try {
      const passwordHashed = await bcrypt.hash(password, 10);

      const [result] = await db.execute(
        "CALL sp_actualizar_password_usuario(?, ?)",
        [id, passwordHashed]
      );

      res.status(200).json({
        mensaje: "Contraseña actualizada exitosamente",
      });
    } catch (error) {
      console.error("Error al actualizar contraseña:", error);
      res.status(500).json({ error: "Error al actualizar contraseña" });
    }
  }
);

// Eliminar usuario
usuarioRouter.delete(
  "/gestion/:id",
  validarJwt,
  validarRol([2, 4]),
  async (req, res) => {
    const { id } = req.params;

    try {
      const [result] = await db.execute("CALL sp_eliminar_usuario(?)", [id]);

      res.status(200).json({
        mensaje: "Usuario eliminado exitosamente",
      });
    } catch (error) {
      console.error("Error al eliminar usuario:", error);

      if (error.sqlMessage) {
        return res.status(400).json({ error: error.sqlMessage });
      }

      res.status(500).json({ error: "Error al eliminar usuario" });
    }
  }
);

// ============================================
// RUTA LEGACY (mantener compatibilidad)
// ============================================

// Obtener todos los usuarios (solo admin general - legacy)
usuarioRouter.get("/", validarJwt, validarRol(2), async (req, res) => {
  try {
    const [result] = await db.execute("SELECT * FROM usuarios");
    res.status(200).json({ resultado: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

export default usuarioRouter;
