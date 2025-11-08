import { db } from "../database/connectionMySQL.js";
import bcrypt from "bcrypt";

const Usuario = {
  obtenerRolPorNombre: async (nombreRol) => {
    const sql = `SELECT id_rol FROM roles WHERE nombre_rol = ?`;
    const [result] = await db.execute(sql, [nombreRol]);
    return result.length > 0 ? result[0] : null;
  },

  crearRolSiNoExiste: async (nombreRol) => {
    const rolExistente = await Usuario.obtenerRolPorNombre(nombreRol);
    if (!rolExistente) {
      const sql = `INSERT INTO roles (nombre_rol) VALUES (?)`;
      const [result] = await db.execute(sql, [nombreRol]);
      console.log(`Rol '${nombreRol}' creado con ID: ${result.insertId}`);
      return result.insertId;
    }
    return rolExistente.id_rol;
  },

  contarAdmins: async () => {
    const sql = `
      SELECT COUNT(*) AS count 
      FROM usuarios u 
      INNER JOIN roles r ON u.id_rol = r.id_rol 
      WHERE r.nombre_rol = 'admin'
    `;
    const [result] = await db.execute(sql);
    return result[0].count;
  },

  existeUsuario: async (username) => {
    const sql = `SELECT id_usuario FROM usuarios WHERE username = ?`;
    const [result] = await db.execute(sql, [username]);
    return result.length > 0;
  },

  existeEmail: async (email) => {
    const sql = `SELECT id_usuario FROM usuarios WHERE email = ?`;
    const [result] = await db.execute(sql, [email]);
    return result.length > 0;
  },

  crearAdmin: async () => {
    const username = process.env.USERNAME_ADMIN;
    const password = process.env.PASSWORD_ADMIN;
    const email = process.env.EMAIL_ADMIN;

    const usuarioExiste = await Usuario.existeUsuario(username);
    const emailExiste = await Usuario.existeEmail(email);

    if (usuarioExiste) {
      console.log(`Usuario '${username}' ya existe`);
      return false;
    }

    if (emailExiste) {
      console.log(`Email '${email}' ya está en uso`);
      return false;
    }

    // Asegurar que existe el rol 'admin'
    const idRolAdmin = await Usuario.crearRolSiNoExiste("admin");

    // Hash de la contraseña
    const passwordHashed = await bcrypt.hash(password, 10);

    // Crear usuario administrador con datos completos
    const sql = `
      INSERT INTO usuarios (
        username, 
        password, 
        email, 
        id_rol, 
        fechaNacimiento, 
        nombre, 
        apellido, 
        direccion, 
        telefono, 
        compro_usado
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const fechaNacimiento = "1990-01-01";
    const nombre = "Administrador";
    const apellido = "Sistema";
    const direccion = "Oficina Principal";
    const telefono = "000-000-0000";
    const compro_usado = 0;

    try {
      const [result] = await db.execute(sql, [
        username,
        passwordHashed,
        email,
        idRolAdmin,
        fechaNacimiento,
        nombre,
        apellido,
        direccion,
        telefono,
        compro_usado,
      ]);

      console.log(`Admin creado exitosamente:
        - ID: ${result.insertId}
        - Username: ${username}
        - Email: ${email}
        - Rol ID: ${idRolAdmin}`);

      return true;
    } catch (error) {
      console.error("Error al crear administrador:", error.message);
      throw error;
    }
  },

  inicializarRoles: async () => {
    const roles = ["empleado", "admin", "cliente", "subAdmin"];
    const rolesCreados = [];

    for (const rol of roles) {
      const idRol = await Usuario.crearRolSiNoExiste(rol);
      rolesCreados.push({ nombre: rol, id: idRol });
    }

    console.log("Roles inicializados:", rolesCreados);
    return rolesCreados;
  },

  obtenerUsuarioCompleto: async (username) => {
    const sql = `
      SELECT 
        u.id_usuario,
        u.username,
        u.email,
        u.fechaNacimiento,
        u.nombre,
        u.apellido,
        u.direccion,
        u.telefono,
        u.compro_usado,
        r.nombre_rol
      FROM usuarios u
      INNER JOIN roles r ON u.id_rol = r.id_rol
      WHERE u.username = ?
    `;

    const [result] = await db.execute(sql, [username]);
    return result.length > 0 ? result[0] : null;
  },
};

export default Usuario;
