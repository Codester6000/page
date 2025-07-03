import { db } from '../database/connectionMySQL.js';

export const obtenerEmpleados = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id_empleado, nombre FROM empleados');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener empleados:', error);
    res.status(500).json({ error: 'Error al obtener empleados' });
  }
};
