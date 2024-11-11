import express from "express";
import {db} from "./database/connectionMySQL.js"
export const productosRouter = express.Router()

productosRouter.get("/",async (req, res) => {
    const [resultado,fields] = await db.execute(`SELECT pr.nombre,pr.stock,pr.peso,pr.garantia_meses,pr.codigo_fabricante,GROUP_CONCAT(c.nombre_categoria SEPARATOR ', ') AS categorias
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
    )
group by pr.id_producto, p.precio_dolar, p.precio_dolar_iva,p.iva,p.precio_pesos, p.precio_pesos_iva,d.alto,d.ancho,d.largo,pro.nombre_proveedor;`)
    console.log(resultado);
    return res.status(200).send({data:resultado})

})  
export default productosRouter;

productosRouter.get("/:id", async (req, res) => {
    const id = req.params.id
    const [resultado, fields] = await db.execute(`SELECT pr.nombre,pr.stock,pr.peso,pr.garantia_meses,pr.codigo_fabricante,GROUP_CONCAT(c.nombre_categoria SEPARATOR ', ') AS categorias
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
    ) AND pr.id_producto = ?
group by pr.id_producto, p.precio_dolar, p.precio_dolar_iva,p.iva,p.precio_pesos, p.precio_pesos_iva,d.alto,d.ancho,d.largo,pro.nombre_proveedor;`,[id])

res.status(200).send({datos: resultado})
})