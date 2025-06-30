import { db } from '../database/connectionMySQL.js';

export const obtenerEmpleados = async (req, res) => {
  try {
    const [result] = await db.query(
      'SELECT id_empleado, nombre, apellido FROM empleados'
    );
    res.json(result);
  } catch (error) {
    console.error('❌ Error al obtener empleados:', error);
    res.status(500).json({ error: 'Error interno' });
  }
};