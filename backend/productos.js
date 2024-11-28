import express from "express";
import {db} from "./database/connectionMySQL.js"
import { validarQuerysProducto,validarBodyProducto,verificarValidaciones,validarId } from "./middleware/validaciones.js";

import passport from "passport";
import { validarJwt, validarRol } from "./auth.js";
export const productosRouter = express.Router()


productosRouter.get("/",validarJwt,validarQuerysProducto(),verificarValidaciones,async (req, res) => {
    let sql = `SELECT pr.nombre,p.stock,pr.peso,pr.garantia_meses,pr.codigo_fabricante,GROUP_CONCAT(c.nombre_categoria SEPARATOR ', ') AS categorias
,GROUP_CONCAT(DISTINCT i.url_imagen SEPARATOR ', ') AS url_imagenes,
p.precio_dolar, p.precio_dolar_iva, p.iva,p.precio_pesos, p.precio_pesos_iva,
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
WHERE 
    p.precio_dolar = (
        SELECT MIN(precio_dolar) 
        FROM precios 
        WHERE id_producto = pr.id_producto AND p.stock > 0
    ) `

let sqlParteFinal = ` group by pr.id_producto, p.stock,p.precio_dolar, p.precio_dolar_iva,p.iva,p.precio_pesos, p.precio_pesos_iva,pr.alto,pr.ancho,pr.largo,pro.nombre_proveedor`
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
    const nombre = req.query.nombre;
    if (nombre != undefined){
        filtros.push('pr.nombre LIKE CONCAT("%", ?, "%")')
        parametros.push(nombre)
    }
    let sqlCuenta = `SELECT count(DISTINCT pr.id_producto) AS cuenta
    FROM productos pr 
    INNER JOIN precios p 
    ON pr.id_producto = p.id_producto 
    INNER JOIN productos_categorias pc 
    ON pr.id_producto = pc.id_producto 
    INNER JOIN categorias c ON pc.id_categoria = c.id_categoria
    INNER JOIN productos_imagenes pi ON pi.id_producto = pr.id_producto
    INNER JOIN imagenes i ON pi.id_imagen = i.id_imagen
    INNER JOIN proveedores pro ON pro.id_proveedor = p.id_proveedor
    WHERE 
    p.precio_dolar = (
        SELECT MIN(precio_dolar) 
        FROM precios 
        WHERE id_producto = pr.id_producto AND p.stock > 0
        ) `
    
        if (filtros.length > 0) {
            sql += ` AND ${filtros.join(" AND ")}`;
            sqlCuenta += ` AND ${filtros.join(" AND ")}`;
        }
        
        const [cuenta,fields2] = await db.execute(sqlCuenta,parametros)
    let limit = req.query.limit;

    const offset = req.query.offset;
    if (offset != undefined){
        parametros.push(offset)
    }else{
        parametros.push(0)
    }
    if (Number(offset) > Number(cuenta[0].cuenta)- 1){
        return res.status(400).send("El offset no puede ser mayor al total de productos")
    }
    parametros.push(limit)
    
        
        sql += sqlParteFinal
        
        sql += " LIMIT ? , ?;"
    
    const [resultado,fields] = await db.execute(sql,parametros)
    return res.status(200).send({productos:resultado, cantidadProductos:cuenta[0].cuenta})

})  

productosRouter.get("/:id",validarJwt,validarId,verificarValidaciones,async (req, res) => {
    const id = req.params.id
    const [resultado, fields] = await db.execute(`SELECT pr.nombre,p.stock,pr.peso,pr.garantia_meses,pr.codigo_fabricante,GROUP_CONCAT(c.nombre_categoria SEPARATOR ', ') AS categorias
,GROUP_CONCAT(DISTINCT i.url_imagen SEPARATOR ', ') AS url_imagenes,
p.precio_dolar, p.precio_dolar_iva, p.iva,p.precio_pesos, p.precio_pesos_iva,
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
WHERE 
    p.precio_dolar = (
        SELECT MIN(precio_dolar) 
        FROM precios 
        WHERE id_producto = pr.id_producto
        ) AND pr.id_producto = ?
        group by pr.id_producto, p.stock,p.precio_dolar, p.precio_dolar_iva,p.iva,p.precio_pesos, p.precio_pesos_iva,pr.alto,pr.ancho,pr.largo,pro.nombre_proveedor;`,[id])
        
res.status(200).send({datos: resultado})
})

productosRouter.post("/", validarJwt,validarRol(2),validarBodyProducto(),verificarValidaciones,async(req, res) => {


    const {
        nombre,
        stock,
        garantia_meses,
        detalle,
        largo,
        alto,
        ancho,
        peso,
        codigo_fabricante,
        marca,
        categoria,
        sub_categoria,
        proveedor,
        precio_dolar,
        precio_dolar_iva,
        iva,
        precio_pesos,
        precio_pesos_iva,
        url_imagen,
    } = req.body;

    try {
        const resultado = await db.execute(
            `CALL cargarDatosProducto(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                nombre,
                stock,
                garantia_meses,
                detalle,
                largo,
                alto,
                ancho,
                peso,
                codigo_fabricante,
                marca,
                categoria,
                sub_categoria,
                proveedor,
                precio_dolar,
                precio_dolar_iva,
                iva,
                precio_pesos,
                precio_pesos_iva,
                url_imagen,
            ]
        );

        res.status(201).json({ mensaje: "Producto cargado exitosamente", resultado });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al cargar el producto" });
    }
})

productosRouter.delete("/:id",validarJwt,validarRol(2),validarId,async (req,res)=> {
    const id = req.params.id
    try {
        const sql = "DELETE FROM productos WHERE id_producto = ?;"
        const [resultado] = db.execute(sql,[id])
        if(resultado.affectedRows == 0){
            return res.status(400).send({mensaje:"Prodcuto no encontrado"})
        }
        return res.status(200).send({mensaje:"Producto eliminado con exito"})
    
        
    }catch(error){
        return res.status(500).send({error:error})
    }
})
productosRouter.put("/:id",validarJwt,validarRol(2),validarId,verificarValidaciones,async (req,res)=>{
    const id = req.params.id
    const {nuevo_precio,producto_id,proveedor_id} = req.query
    try{
        const sql = "UPDATE precios SET precio_pesos_iva = ? WHERE (id_producto = ? AND id_proveedor = ?);"
        const resultado = db.execute(sql,[nuevo_precio,producto_id,proveedor_id])
        if(resultado.affectedRows == 0){
            res.status(400).send({mensaje:"Id producto o id proveedor invalido"})
        }
        res.status(200).send({mensaje:"Precio actualizado"})
    }catch(error){
    res.status(500).send({error:error})
    }
})
export default productosRouter;