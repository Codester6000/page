import express from "express";
import { db } from "./database/connectionMySQL.js";
import { verificarToken } from "./middleware/verificarToken.js";

const routerBorradoAutomatico = express.Router();

routerBorradoAutomatico.post("/", async (req, res) => {
  try {
    const sql = `CALL borrar_todos_productos()`;
    const [result] = await db.query(sql);
    res.status(200).json({ Mensaje: "Productos eliminados correctamente" });
    console.log(result);
  } catch (error) {
    throw new Error(`Error al eliminar datos: ${error.message}`);
  }
});

export default routerBorradoAutomatico;
