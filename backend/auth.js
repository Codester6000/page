// backend/auth.js
import express from "express";
import { body, validationResult } from "express-validator";
import { db } from "./database/connectionMySQL.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ExtractJwt, Strategy } from "passport-jwt";
import passport from "passport";

const router = express.Router();

// Configuración de autenticación JWT
export function authConfig() {
  // Opciones configuración jwt
  const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
  };

  // Crear estrategia jwt
  passport.use(
    new Strategy(jwtOptions, async (payload, next) => {
      next(null, payload);
    })
  );
}

// Middleware para validar JWT
export const validarJwt = passport.authenticate("jwt", {
  session: false,
});

// Middleware para validar rol(es) - Actualizado para soportar múltiples roles
export const validarRol = (rolesPermitidos) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).send({
      mensaje: "Usuario no autenticado",
    });
  }

  // Convertir a array si es un solo rol
  const roles = Array.isArray(rolesPermitidos)
    ? rolesPermitidos
    : [rolesPermitidos];

  // Verificar si el rol del usuario está en los roles permitidos
  if (!roles.includes(req.user.rol)) {
    return res.status(403).send({
      mensaje: "No está autorizado para realizar esta acción",
    });
  }

  next();
};

// Helpers de validación de roles comunes
export const validarAdminOSubAdmin = validarRol([2, 4]);
export const validarSoloAdminGeneral = validarRol(2);
export const validarEmpleado = validarRol(1);
export const validarCliente = validarRol(3);

// Ruta de login
router.post(
  "/login",
  body("username").isAlphanumeric().notEmpty().isLength({ max: 25 }),
  body("password").isStrongPassword({
    minLength: 8,
    minNumbers: 1,
    minUppercase: 1,
    minLowercase: 1,
    minSymbols: 0,
  }),
  async (req, res) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).send({ errores: errores.array() });
    }

    try {
      const { username, password } = req.body;

      const [usuarios] = await db.execute(
        "SELECT * FROM usuarios WHERE username = ?",
        [username]
      );

      if (usuarios.length === 0) {
        return res.status(400).send({
          error: "Usuario o contraseña incorrecta",
        });
      }

      // Verificar usuario y contraseña
      const passwordCompared = await bcrypt.compare(
        password,
        usuarios[0].password
      );

      if (!passwordCompared) {
        return res.status(400).send({
          error: "Usuario o contraseña incorrecta",
        });
      }

      // Crear JWT
      const payload = {
        username,
        rol: usuarios[0].id_rol,
        userId: usuarios[0].id_usuario,
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "2h",
      });

      // Enviar JWT y datos del usuario
      res.send({
        username: usuarios[0].username,
        rol: usuarios[0].id_rol,
        userId: usuarios[0].id_usuario,
        nombre: usuarios[0].nombre,
        apellido: usuarios[0].apellido,
        token,
      });
    } catch (error) {
      console.error("Error en login:", error);
      res.status(500).send({ error: "Error en el servidor" });
    }
  }
);

export default router;
