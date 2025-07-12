  import { db } from '../database/connectionMySQL.js';
  import path from 'path';
  import fs from 'fs';
  import { v4 as uuidv4 } from 'uuid';

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

    // Generar pasos por defecto si no se pasaron
    const pasosIniciales =
      Array.isArray(detalles) && detalles.length > 0
        ? detalles
        : [
            {
              titulo: 'Revisión inicial',
              icono: 'Lupa',
              comentario: '',
              completado: false,
              foto: null,
            },
          ];

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
        JSON.stringify(pasosIniciales),
      ]
    );

    // Generar y guardar número de ficha
    const numeroFichaGenerado = `${nombre_producto.toUpperCase()}-${String(resultado.insertId).padStart(5, "0")}`;

    await db.query(
      `UPDATE ${tabla} SET numero_ficha = ? WHERE id_mantenimiento = ?`,
      [numeroFichaGenerado, resultado.insertId]
    );

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
      const { estado, observaciones, detalles } = req.body;
      const { rol } = req.user;

      if (rol !== 'admin' && rol !== 2) {
        return res.status(403).json({ error: 'No autorizado' });
      }

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

      const campos = ['estado', 'observaciones'];
      const valores = [estado, observaciones];

      if (detalles) {
        campos.push('detalles');
        valores.push(JSON.stringify(detalles));
      }

      valores.push(id);

      await db.query(
        `UPDATE ${tabla} SET ${campos.map(c => `${c} = ?`).join(', ')} WHERE id_mantenimiento = ?`,
        valores
      );

      res.json({ mensaje: 'Estado y detalles actualizados correctamente' });
    } catch (error) {
      console.error('❌ Error al actualizar estado del mantenimiento:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };

  // NUEVO: subir imagen del paso
export const subirImagenPaso = async (req, res) => {
  try {
    const { numero_ficha, tipo_producto, orden_paso } = req.body;
    const archivo = req.file;

    if (!archivo) {
      return res.status(400).json({ error: 'No se envió ninguna imagen' });
    }

    const nombreArchivo = `${uuidv4()}${path.extname(archivo.originalname)}`;
    const carpetaDestino = path.join('public', 'uploads', 'imagenes-pasos');

    if (!fs.existsSync(carpetaDestino)) {
      fs.mkdirSync(carpetaDestino, { recursive: true });
    }

    const rutaFinal = path.join(carpetaDestino, nombreArchivo);
    fs.renameSync(archivo.path, rutaFinal);

    const urlImagen = `/uploads/imagenes-pasos/${nombreArchivo}`;

    // Determinar la tabla
    let tabla = 'mantenimientos_general';
    if (tipo_producto === 'PC') tabla = 'mantenimientos_pc';
    else if (tipo_producto === 'Notebook') tabla = 'mantenimientos_notebook';
    else if (tipo_producto === 'Celular') tabla = 'mantenimientos_celular';

    // Obtener los pasos existentes
    const [rows] = await db.query(
      `SELECT detalles FROM ${tabla} WHERE numero_ficha = ?`,
      [numero_ficha]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Mantenimiento no encontrado' });
    }

    // Interpretar detalles
    let raw = rows[0].detalles;
    let pasos;

    try {
      pasos = Array.isArray(raw) ? raw : JSON.parse(raw || '[]');
    } catch (err) {
      console.error('❌ Error al interpretar detalles:', err);
      pasos = [];
    }

    // Asegurar que el paso exista
    if (!pasos[orden_paso]) {
      pasos[orden_paso] = {
        titulo: 'Paso sin título',
        icono: 'Llave',
        comentario: '',
        completado: false,
        foto: null,
      };
    }

    // Insertar URL de imagen en el paso correspondiente
    pasos[orden_paso].foto = urlImagen;

    // Guardar en la DB
    await db.query(
      `UPDATE ${tabla} SET detalles = ? WHERE numero_ficha = ?`,
      [JSON.stringify(pasos), numero_ficha]
    );

    res.status(201).json({ mensaje: 'Imagen subida correctamente', url: urlImagen });
  } catch (error) {
    console.error('❌ Error al subir imagen del paso:', error);
    res.status(500).json({ error: 'Error al subir imagen del paso' });
  }
};


