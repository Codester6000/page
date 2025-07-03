import { db } from '../database/connectionMySQL.js';

export const buscarUsuariosPorUsername = async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) return res.status(400).json({ error: 'Falta el parámetro username' });

    const [result] = await db.query(
      `SELECT id_usuario, username FROM usuarios WHERE username LIKE ? LIMIT 10`,
      [`%${username}%`]
    );

    res.json(result);
  } catch (error) {
    console.error('❌ Error al buscar usuarios:', error);
    res.status(500).json({ error: 'Error interno' });
  }
};
