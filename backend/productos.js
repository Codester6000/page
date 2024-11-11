import express from "express";
import {db} from "./database/connectionMySQL.js"
import { body,query,validationResult} from "express-validator"
export const productosRouter = express.Router()

const validarQuerys = () => {
query("categoria").isAlpha()
query("precio_gt").isFloat({min:0})
query("precio_lt").isFloat({min:0})
}
productosRouter.get("/",async (req, res) => {
    let sql = `SELECT pr.nombre,pr.stock,pr.peso,pr.garantia_meses,pr.codigo_fabricante,GROUP_CONCAT(c.nombre_categoria SEPARATOR ', ') AS categorias
,GROUP_CONCAT(i.url_imagen SEPARATOR ', ') AS url_imagenes,
p.precio_dolar, p.precio_dolar_iva, p.iva,p.precio_pesos, p.precio_pesos_iva,
d.alto,d.ancho,d.largo,pro.nombre_proveedor
FROM productos pr 
INNER JOIN precios p 
ON pr.id_producto = p.id_producto 
INNER JOIN productos_categorias pc 
ON pr.id_producto = pc.id_producto 
INNER JOIN categorias c ON pc.id_categoria = c.id_categoria
INNER JOIN productos_imagenes pi ON pi.id_producto = pr.id_producto
INNER JOIN imagenes i ON pi.id_imagen = i.id_imagen
INNER JOIN dimensiones d ON d.id_producto = pr.id_producto
INNER JOIN proveedores pro ON pro.id_proveedor = p.id_proveedor
WHERE 
    p.precio_dolar = (
        SELECT MIN(precio_dolar) 
        FROM precios 
        WHERE id_producto = pr.id_producto
    ) `

    

let sqlParteFinal = ` group by pr.id_producto, p.precio_dolar, p.precio_dolar_iva,p.iva,p.precio_pesos, p.precio_pesos_iva,d.alto,d.ancho,d.largo,pro.nombre_proveedor;`
    const filtros = []
    const parametros = []

    const categoria = req.query.categoria;
    if (categoria != undefined){
        filtros.push("c.nombre_categoria = ?")
        parametros.push(categoria)
    }
    const precio_gt = req.query.precio_gt;
    if (precio_gt != undefined){
        filtros.push("p.precio_pesos_iva > ?")
        parametros.push(precio_gt)
    }
    const precio_lt = req.query.precio_lt;
    if (precio_lt != undefined){
        filtros.push("p.precio_pesos_iva < ?")
        parametros.push(precio_lt)
    }

    if (filtros.length > 0) {
        sql += ` AND ${filtros.join(" AND ")}`;
      }

      sql += sqlParteFinal

    const [resultado,fields] = await db.execute(sql,parametros)
    console.log(resultado);
    return res.status(200).send({data:resultado})

})  
export default productosRouter;