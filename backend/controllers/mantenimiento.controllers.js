import { db } from '../database/connectionMySQL.js';

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

    // Buscar el ID del usuario a partir del username
    const [[usuario]] = await db.query(
      'SELECT id_usuario FROM usuarios WHERE username = ?',
      [username]
    );

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const id_usuario = usuario.id_usuario;

    // Obtener el último numero_ficha actual
    const [[ultimo]] = await db.query(
      'SELECT MAX(CAST(numero_ficha AS UNSIGNED)) AS ultimo FROM mantenimientos'
    );

    const nuevoNumero = ultimo.ultimo ? parseInt(ultimo.ultimo) + 1 : 1;
    const numero_ficha = nuevoNumero.toString().padStart(5, '0'); // formato: 00001

    const query = `
      INSERT INTO mantenimientos (
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
        fecha_finalizacion
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

    res.status(201).json({
      message: '✅ Mantenimiento creado exitosamente',
      id_mantenimiento: result.insertId,
      numero_ficha,
    });
  } catch (error) {
    console.error('❌ Error al crear mantenimiento:', error);
    res.status(500).json({ error: 'Error al crear mantenimiento' });
  }
};
