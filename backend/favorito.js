import express from "express"
import { db } from "./database/connectionMySQL.js"
import { validarJwt } from "./auth.js"
import { validarBodyCarrito,validarId,verificarValidaciones} from "./middleware/validaciones.js"
const favoritoRouter = express.Router()

favoritoRouter.get('/',validarJwt,async (req,res) =>{
    const id = req.user.userId
    const sql = `SELECT pr.id_producto,pr.nombre,p.stock,pr.peso,pr.garantia_meses,pr.codigo_fabricante,
    (SELECT JSON_ARRAYAGG(nombre_categoria)
        FROM (
            SELECT DISTINCT c.nombre_categoria
            FROM productos_categorias pc3
            INNER JOIN categorias c ON pc3.id_categoria = c.id_categoria
            WHERE pc3.id_producto = pr.id_producto
        ) AS distinct_categories) AS categorias,
(SELECT JSON_ARRAYAGG(url_imagen)
        FROM (
            SELECT DISTINCT i.url_imagen
            FROM productos_imagenes pi
            INNER JOIN imagenes i ON pi.id_imagen = i.id_imagen
            WHERE pi.id_producto = pr.id_producto
        ) AS distinct_images
       ) AS url_imagenes,
        p.precio_dolar,
		p.precio_dolar_iva,
		p.iva, 
		p.precio_pesos,
        p.precio_pesos_iva,
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
pr.alto,pr.ancho,pr.largo,pro.nombre_proveedor
FROM productos pr 
INNER JOIN precios p 
ON pr.id_producto = p.id_producto 
INNER JOIN productos_categorias pc 
ON pr.id_producto = pc.id_producto 
INNER JOIN categorias c ON pc.id_categoria = c.id_categoria
INNER JOIN productos_imagenes pi ON pi.id_producto = pr.id_producto
INNER JOIN imagenes i ON pi.id_imagen = i.id_imagen
INNER JOIN proveedores pro ON pro.id_proveedor = p.id_proveedor
INNER JOIN favoritos fa ON fa.id_producto = pr.id_producto
INNER JOIN usuarios u ON u.id_usuario = fa.id_usuario
WHERE 
    p.precio_dolar = (
        SELECT MIN(precio_dolar) 
        FROM precios 
        WHERE id_producto = pr.id_producto
        ) AND fa.id_usuario = ?
group by pr.id_producto, p.stock,p.precio_dolar, p.precio_dolar_iva,p.iva,p.precio_pesos, p.precio_pesos_iva,pr.alto,pr.ancho,pr.largo,pro.nombre_proveedor;`
    const [resultado,fields] = await db.execute(sql,[id])

    res.status(200).send({favoritos:resultado})
})

favoritoRouter.post('/',validarJwt,validarBodyCarrito(),verificarValidaciones, async (req,res) =>{
    const {id_producto } = req.body;
    const parametros = [req.user.userId,id_producto];
    const sql = 'INSERT INTO favoritos (id_usuario,id_producto) VALUES (?,?);';
    const [resul, fields] = await db.execute(sql,parametros)
    res.status(201).send({resultado:resul})
})

favoritoRouter.delete('/',validarJwt,validarId,validarBodyCarrito(),async (req, res) => {
    const {id_producto } = req.body;
    try {
        const parametros = [id_producto,req.user.userId];
        const sql = 'DELETE FROM favoritos WHERE id_producto = ? and id_usuario = ?';
        const [resultado, fields] = await db.execute(sql,parametros)
        if(resultado.affectedRows == 0) {
            return res.status(404).send({mensaje:"Producto no encontrado en favoritos"})
        }
        res.status(200).send({mensaje:"Producto eliminado de favoritos"})
    } catch(error){
        console.log(error)
        res.status(500).send({error:"Error al eliminar el producto"})
    }
})
export default favoritoRouter;