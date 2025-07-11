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
      detalles,
    } = req.body;

    // Determinar la tabla según el tipo de producto
    let tabla = 'mantenimientos_general';
    if (nombre_producto === 'PC') tabla = 'mantenimientos_pc';
    else if (nombre_producto === 'Notebook') tabla = 'mantenimientos_notebook';
    else if (nombre_producto === 'Celular') tabla = 'mantenimientos_celular';

    // Buscar ID de usuario si se pasó username
    let id_usuario = null;
    if (username) {
      const [[usuario]] = await db.query(
        "SELECT id_usuario FROM usuarios WHERE username = ?",
        [username]
      );
      id_usuario = usuario?.id_usuario || null;
    }

    // Insertar el nuevo mantenimiento
    const [resultado] = await db.query(
      `
      INSERT INTO ${tabla} (
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
        detalles
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
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
        JSON.stringify(detalles),
      ]
    );

    // Generar y guardar número de ficha
    const numeroFichaGenerado = `${nombre_producto.toUpperCase()}-${String(resultado.insertId).padStart(5, "0")}`;

    await db.query(
      `UPDATE ${tabla} SET numero_ficha = ? WHERE id_mantenimiento = ?`,
      [numeroFichaGenerado, resultado.insertId]
    );

    // Devolver número generado
    res.status(201).json({ numero_ficha: numeroFichaGenerado });
  } catch (error) {
    console.error('❌ Error al crear mantenimiento:', error);
    res.status(500).json({ error: 'Error al crear el mantenimiento' });
  }
};

export const consultarMantenimientoPublico = async (req, res) => {
  const { dni, ficha } = req.query;

  if (!dni || !ficha) {
    return res.status(400).json({ error: "Faltan parámetros: dni y ficha" });
  }

  try {
    const [resultado] = await db.query(
      `
      SELECT *
      FROM vista_mantenimientos_dni
      WHERE dni_propietario = ? AND numero_ficha = ?
      `,
      [dni, ficha]
    );

    if (resultado.length === 0) {
      return res.status(404).json({ mensaje: "No se encontró mantenimiento con esos datos." });
    }

    res.json(resultado[0]);
  } catch (error) {
    console.error("❌ Error al consultar mantenimiento público:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const actualizarEstadoMantenimiento = async (req, res) => {
  try {
    const id = req.params.id;
    const { estado, observaciones } = req.body;
    const { rol } = req.user;

    if (rol !== 'admin' && rol !== 2) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    // Determinar la tabla a partir del número de ficha (idealmente esto lo deberías pasar desde el frontend o resolver desde DB)
    const [busqueda] = await db.query(
      `SELECT nombre_producto FROM vista_mantenimientos_dni WHERE id_mantenimiento = ?`,
      [id]
    );

    if (busqueda.length === 0) {
      return res.status(404).json({ error: 'Mantenimiento no encontrado' });
    }

    const tipo = busqueda[0].nombre_producto;
    let tabla = 'mantenimientos_general';
    if (tipo === 'PC') tabla = 'mantenimientos_pc';
    else if (tipo === 'Notebook') tabla = 'mantenimientos_notebook';
    else if (tipo === 'Celular') tabla = 'mantenimientos_celular';

    // Actualizar estado y observaciones
    await db.query(
      `UPDATE ${tabla} SET estado = ?, observaciones = ? WHERE id_mantenimiento = ?`,
      [estado, observaciones, id]
    );

    res.json({ mensaje: 'Estado actualizado correctamente' });
  } catch (error) {
    console.error('❌ Error al actualizar estado del mantenimiento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

