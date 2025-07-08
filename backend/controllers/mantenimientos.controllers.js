import {db} from "../database/connectionMySQL.js";

export const crearMantenimiento = async (req, res) => {
  try {
    const {
      username = null,
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
    } = req.body;

    let tablaDestino = "";

    switch (nombre_producto) {
      case "PC":
        tablaDestino = "mantenimientos_pc";
        break;
      case "Notebook":
        tablaDestino = "mantenimientos_notebook";
        break;
      case "Celular":
        tablaDestino = "mantenimientos_celular";
        break;
      default:
        tablaDestino = "mantenimientos_general";
    }

    const [resultado] = await pool.query(
      `INSERT INTO ${tablaDestino} (
        username, dni_propietario, nombre_producto, responsable_de_retiro, telefono,
        direccion_propietario, mail, empleado_asignado, descripcion_producto,
        observaciones, fecha_inicio, estado, detalles
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
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
        JSON.stringify(detalles)
      ]
    );

    res.status(201).json({
      message: "Ficha de mantenimiento registrada con éxito",
      numero_ficha: resultado.insertId,
    });

  } catch (error) {
    console.error("❌ Error al crear mantenimiento:", error);
    res.status(500).json({ error: "Error al crear mantenimiento" });
  }
};
