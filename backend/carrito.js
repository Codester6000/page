import express from "express"
import { db } from "./database/connectionMySQL.js"
import { validarJwt } from "./auth.js"
import { validarBodyCarrito,validarId,verificarValidaciones} from "./middleware/validaciones.js"
const carritoRouter = express.Router()

carritoRouter.get('/',validarJwt,async (req,res) =>{
    const id = req.user.userId
    console.log(req.user)
    const [resultado,fields] = await db.execute("SELECT * FROM carritos WHERE id_usuario = ?",[id])

    res.status(200).send({carrito:resultado})
})

carritoRouter.post('/',validarJwt,validarBodyCarrito(),verificarValidaciones, async (req,res) =>{
    const {id_producto } = req.body;
    const parametros = [req.user.userId,id_producto];
    const sql = 'INSERT INTO carritos (id_usuario,id_producto) VALUES (?,?);';
    console.log(parametros)
    const [resul, fields] = await db.execute(sql,parametros)
    res.status(201).send({resultado:resul})
})

carritoRouter.delete('/:id',validarJwt,validarId,validarBodyCarrito(),async (req, res) => {
    const {id_producto } = req.body;
    const parametros = [req.user.userId,id_producto];
    const sql = 'INSERT INTO carritos (id_usuario,id_producto) VALUES (?,?);';
    console.log(parametros)
    const [resul, fields] = await db.execute(sql,parametros)
    res.status(201).send({resultado:resul})
})
export default carritoRouter;