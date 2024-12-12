import express from "express"
import { db } from "./database/connectionMySQL.js"
import { validarJwt } from "./auth.js"
import { validarBodyCarrito,validarId,verificarValidaciones,validarBodyPutCarrito} from "./middleware/validaciones.js"
const carritoRouter = express.Router()

carritoRouter.get('/',validarJwt,async (req,res) =>{
    const id = req.user.userId
    const sql = `SELECT pr.id_producto,pr.nombre,ca.cantidad,GROUP_CONCAT(c.nombre_categoria SEPARATOR ', ') AS categorias
,GROUP_CONCAT(DISTINCT i.url_imagen SEPARATOR ', ') AS url_imagenes,
CASE
    WHEN pro.nombre_proveedor = 'elit' AND pr.id_producto IN (
        SELECT pc2.id_producto
        FROM productos_categorias pc2
        INNER JOIN categorias c2 ON pc2.id_categoria = c2.id_categoria
        WHERE c2.nombre_categoria IN ('procesadores')
        GROUP BY pc2.id_producto
    ) THEN p.precio_dolar * 1.15
        WHEN pro.nombre_proveedor = 'elit' THEN p.precio_dolar * 1.20
        WHEN pro.nombre_proveedor = 'air' AND pr.id_producto IN (
        SELECT pc2.id_producto
        FROM productos_categorias pc2
        INNER JOIN categorias c2 ON pc2.id_categoria = c2.id_categoria
        WHERE c2.nombre_categoria IN ('procesadores')
        GROUP BY pc2.id_producto
    ) THEN p.precio_dolar * 1.20
        WHEN pro.nombre_proveedor = 'air' THEN p.precio_dolar * 1.25
        ELSE p.precio_dolar
    END AS precio_dolar_ajustado,
    CASE
    WHEN pro.nombre_proveedor = 'elit' AND pr.id_producto IN (
        SELECT pc2.id_producto
        FROM productos_categorias pc2
        INNER JOIN categorias c2 ON pc2.id_categoria = c2.id_categoria
        WHERE c2.nombre_categoria IN ('procesadores')
        GROUP BY pc2.id_producto
    ) THEN p.precio_dolar_iva * 1.15
        WHEN pro.nombre_proveedor = 'elit' THEN p.precio_dolar_iva * 1.20
        WHEN pro.nombre_proveedor = 'air' AND pr.id_producto IN (
        SELECT pc2.id_producto
        FROM productos_categorias pc2
        INNER JOIN categorias c2 ON pc2.id_categoria = c2.id_categoria
        WHERE c2.nombre_categoria IN ('procesadores')
        GROUP BY pc2.id_producto
    ) THEN p.precio_dolar_iva * 1.20
        WHEN pro.nombre_proveedor = 'air' THEN p.precio_dolar_iva * 1.25
        ELSE p.precio_dolar_iva
    END AS precio_dolar_iva_ajustado,
    p.iva, 
    CASE
    WHEN pro.nombre_proveedor = 'elit' AND pr.id_producto IN (
        SELECT pc2.id_producto
        FROM productos_categorias pc2
        INNER JOIN categorias c2 ON pc2.id_categoria = c2.id_categoria
        WHERE c2.nombre_categoria IN ('procesadores')
        GROUP BY pc2.id_producto
    ) THEN p.precio_pesos * 1.15
        WHEN pro.nombre_proveedor = 'elit' THEN p.precio_pesos * 1.2
        WHEN pro.nombre_proveedor = 'air' AND pr.id_producto IN (
        SELECT pc2.id_producto
        FROM productos_categorias pc2
        INNER JOIN categorias c2 ON pc2.id_categoria = c2.id_categoria
        WHERE c2.nombre_categoria IN ('procesadores')
        GROUP BY pc2.id_producto
    ) THEN p.precio_pesos * 1.20
        WHEN pro.nombre_proveedor = 'air' THEN p.precio_pesos * 1.25
        ELSE p.precio_pesos
    END AS precio_pesos_ajustado,
    CASE
    WHEN pro.nombre_proveedor = 'elit' AND pr.id_producto IN (
        SELECT pc2.id_producto
        FROM productos_categorias pc2
        INNER JOIN categorias c2 ON pc2.id_categoria = c2.id_categoria
        WHERE c2.nombre_categoria IN ('procesadores')
        GROUP BY pc2.id_producto
    ) THEN p.precio_pesos_iva * 1.15
        WHEN pro.nombre_proveedor = 'elit' THEN p.precio_pesos_iva * 1.2
        WHEN pro.nombre_proveedor = 'air' AND pr.id_producto IN (
        SELECT pc2.id_producto
        FROM productos_categorias pc2
        INNER JOIN categorias c2 ON pc2.id_categoria = c2.id_categoria
        WHERE c2.nombre_categoria IN ('procesadores')
        GROUP BY pc2.id_producto
    ) THEN p.precio_pesos_iva * 1.20
        WHEN pro.nombre_proveedor = 'air' THEN p.precio_pesos_iva * 1.25
        ELSE p.precio_pesos_iva
    END AS precio_pesos_iva_ajustado,
pro.nombre_proveedor
FROM productos pr 
INNER JOIN precios p 
ON pr.id_producto = p.id_producto 
INNER JOIN productos_categorias pc 
ON pr.id_producto = pc.id_producto 
INNER JOIN categorias c ON pc.id_categoria = c.id_categoria
INNER JOIN productos_imagenes pi ON pi.id_producto = pr.id_producto
INNER JOIN imagenes i ON pi.id_imagen = i.id_imagen
INNER JOIN proveedores pro ON pro.id_proveedor = p.id_proveedor
INNER JOIN carritos ca ON ca.id_producto = pr.id_producto
INNER JOIN usuarios u ON u.id_usuario = ca.id_usuario
WHERE 
    p.precio_dolar = (
        SELECT MIN(precio_dolar) 
        FROM precios 
        WHERE id_producto = pr.id_producto
        ) AND ca.id_usuario = ?
group by pr.id_producto,ca.cantidad,p.precio_dolar, p.precio_dolar_iva,p.iva,p.precio_pesos, p.precio_pesos_iva,pro.nombre_proveedor;`
    const [resultado,fields] = await db.execute(sql,[id])

    res.status(200).send({carrito:resultado})
})

carritoRouter.post('/',validarJwt,validarBodyCarrito(),verificarValidaciones, async (req,res) =>{
    const {id_producto } = req.body;
    const parametros = [req.user.userId,id_producto];
    const sql = 'INSERT INTO carritos (id_usuario,id_producto) VALUES (?,?);';
    const [resul, fields] = await db.execute(sql,parametros)
    res.status(201).send({resultado:resul})
})
carritoRouter.put('/',validarJwt,validarBodyPutCarrito(),async (req,res)=>{
    const {id_producto,cantidad} = req.body;
    try {
        const parametros = [cantidad,id_producto,req.user.userId]
        const sql = "UPDATE carritos SET cantidad = ? WHERE id_producto = ? AND id_usuario = ?;"
        const resultado = db.execute(sql,parametros)
        if(resultado.affectedRows == 0){
            res.status(400).send({mensaje:"Id producto o id usuario invalido"})
        }
        res.status(200).send({mensaje:"cantidad Actualizada"})

    }catch(error){
        res.status(500).send({mensaje:"Se produjo un error en el servidor"})
    }
})
carritoRouter.delete('/',validarJwt,validarBodyCarrito(),async (req, res) => {
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