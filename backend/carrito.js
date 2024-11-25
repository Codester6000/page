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

carritoRouter.delete('/',validarJwt,validarId,validarBodyCarrito(),async (req, res) => {
    const {id_producto } = req.body;
    try {
        const parametros = [id_producto,req.user.userId];
        const sql = 'DELETE FROM carritos WHERE id_producto = ? and id_usuario = ?';
        const [resultado, fields] = await db.execute(sql,parametros)
        if(resultado.affectedRows == 0) {
            return res.status(404).send({mensaje:"Producto no encontrado en el carrito"})
        }
        res.status(200).send({mensaje:"Producto eliminado del carrito"})
    } catch(error){
        console.log(error)
        res.status(500).send({error:"Error al eliminar el producto"})
    }
})
export default carritoRouter;