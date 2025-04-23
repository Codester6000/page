import express from "express";
import { db } from "./database/connectionMySQL.js";

export const categoriasRouter = express.Router();

categoriasRouter.get('/', async (req, res) => {
    const [categorias] = await db.execute('SELECT id_categoria, nombre_categoria FROM categorias ORDER BY nombre_categoria ASC;');
    console.log(categorias)
    res.status(200).send({categorias:categorias});
})