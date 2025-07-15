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

    let tabla = 'mantenimientos_general';
    if (nombre_producto === 'PC') tabla = 'mantenimientos_pc';
    else if (nombre_producto === 'Notebook') tabla = 'mantenimientos_notebook';
    else if (nombre_producto === 'Celular') tabla = 'mantenimientos_celular';

    let id_usuario = null;
    if (username) {
      const [[usuario]] = await db.query(
        "SELECT id_usuario FROM usuarios WHERE username = ?",
        [username]
      );
      id_usuario = usuario?.id_usuario || null;
    }

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

    const [resultado] = await db.query(
      `
      INSERT INTO ${tabla} (
        id_usuario, dni_propietario, nombre_producto,
        responsable_de_retiro, telefono, direccion_propietario,
        mail, empleado_asignado, descripcion_producto,
        observaciones, fecha_inicio, estado, detalles
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        id_usuario, dni_propietario, nombre_producto,
        responsable_de_retiro, telefono, direccion_propietario,
        mail, empleado_asignado, descripcion_producto,
        observaciones, fecha_inicio, estado, JSON.stringify(pasosIniciales),
      ]
    );

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

// 🔍 NUEVA VERSIÓN COMPLETA
export const consultarMantenimientoPublico = async (req, res) => {
  const { dni, ficha } = req.query;

  if (!dni || !ficha) {
    return res.status(400).json({ error: 'Faltan parámetros: dni o ficha' });
  }

  try {
    // Consulta principal al mantenimiento
    const [mantenimientos] = await db.query(
      'SELECT * FROM vista_mantenimientos_dni WHERE dni_propietario = ? AND numero_ficha = ?',
      [dni, ficha]
    );

    if (mantenimientos.length === 0) {
      return res.status(404).json({ error: 'Mantenimiento no encontrado' });
    }

    const mantenimiento = mantenimientos[0];

    // Consulta de pasos técnicos (detalles del proceso)
    const [pasos] = await db.query(
      `SELECT orden_paso, titulo, comentario, icono, imagen, fecha
       FROM imagenes_pasos_mantenimiento
       WHERE numero_ficha = ?
       ORDER BY orden_paso ASC`,
      [ficha]
    );

    // Devolver mantenimiento + pasos (si hay)
    res.json({
      ...mantenimiento,
      detalles_proceso: pasos.length > 0 ? pasos : null
    });

  } catch (error) {
    console.error('Error al consultar mantenimiento público:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};


export const actualizarEstadoMantenimiento = async (req, res) => {
  const { id } = req.params;
  const { estado, observaciones, detalles } = req.body;

  try {
    const tablas = [
      'mantenimientos_pc',
      'mantenimientos_notebook',
      'mantenimientos_celular',
      'mantenimientos_general'
    ];

    let tablaEncontrada = null;

    for (const tabla of tablas) {
      const [rows] = await db.query(
        `SELECT nombre_producto FROM ${tabla} WHERE id_mantenimiento = ?`,
        [id]
      );
      if (rows.length > 0) {
        tablaEncontrada = tabla;
        break;
      }
    }

    if (!tablaEncontrada) {
      return res.status(404).json({ error: 'Mantenimiento no encontrado' });
    }

    const actualizarFecha =
      estado === 'finalizado' || estado === 1 || estado === '1'
        ? ', fecha_finalizacion = NOW()'
        : '';

    await db.query(
      `UPDATE ${tablaEncontrada}
       SET estado = ?, observaciones = ?, detalles_proceso = ?
       ${actualizarFecha}
       WHERE id_mantenimiento = ?`,
      [estado, observaciones || '', JSON.stringify(detalles || []), id]
    );

    res.json({ mensaje: 'Estado actualizado correctamente' });
  } catch (error) {
    console.error('❌ Error al actualizar mantenimiento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

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

    let tabla = 'mantenimientos_general';
    if (tipo_producto === 'PC') tabla = 'mantenimientos_pc';
    else if (tipo_producto === 'Notebook') tabla = 'mantenimientos_notebook';
    else if (tipo_producto === 'Celular') tabla = 'mantenimientos_celular';

    const [rows] = await db.query(
      `SELECT detalles FROM ${tabla} WHERE numero_ficha = ?`,
      [numero_ficha]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Mantenimiento no encontrado' });
    }

    let raw = rows[0].detalles;
    let pasos;
    try {
      pasos = Array.isArray(raw) ? raw : JSON.parse(raw || '[]');
    } catch (err) {
      pasos = [];
    }

    if (!pasos[orden_paso]) {
      pasos[orden_paso] = {
        titulo: 'Paso sin título',
        icono: 'Llave',
        comentario: '',
        completado: false,
        foto: null,
      };
    }

    pasos[orden_paso].foto = urlImagen;

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

export const eliminarImagenPaso = async (req, res) => {
  const { id_imagen } = req.params;

  try {
    const [[imagen]] = await db.query(
      `SELECT url_imagen FROM imagenes_pasos_mantenimiento WHERE id_imagen = ?`,
      [id_imagen]
    );

    if (!imagen) {
      return res.status(404).json({ error: 'Imagen no encontrada' });
    }

    const rutaRelativa = path.join('public', imagen.url_imagen);
    if (fs.existsSync(rutaRelativa)) {
      fs.unlinkSync(rutaRelativa);
    }

    await db.query(`DELETE FROM imagenes_pasos_mantenimiento WHERE id_imagen = ?`, [id_imagen]);

    res.json({ mensaje: 'Imagen eliminada correctamente' });
  } catch (error) {
    console.error('❌ Error al eliminar imagen:', error);
    res.status(500).json({ error: 'Error al eliminar imagen' });
  }
};

export const obtenerTodosLosMantenimientos = async (req, res) => {
  try {
    const tablas = [
      'mantenimientos_pc',
      'mantenimientos_notebook',
      'mantenimientos_celular',
      'mantenimientos_general'
    ];

    let resultados = [];

    for (const tabla of tablas) {
      const [rows] = await db.query(
        `
        SELECT 
          m.id_mantenimiento,
          m.numero_ficha,
          m.dni_propietario,
          m.nombre_producto,
          m.descripcion_producto,
          m.estado,
          m.fecha_inicio AS fecha_ingreso,
          e.nombre AS empleado_nombre,
          m.empleado_asignado AS empleado_asignado_id
        FROM ${tabla} m
        LEFT JOIN empleados e ON m.empleado_asignado = e.id_empleado
        `
      );
      resultados = resultados.concat(rows);
    }

    res.json(resultados);
  } catch (error) {
    console.error('❌ Error al obtener mantenimientos:', error);
    res.status(500).json({ error: 'Error al obtener mantenimientos' });
  }
};
