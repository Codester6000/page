import express from "express"
import { db } from "./database/connectionMySQL.js"
import { validarJwt, validarRol } from "./auth.js"
import { validarBodyCarrito,validarId,verificarValidaciones,validarBodyPutCarrito} from "./middleware/validaciones.js"
const carritoRouter = express.Router()

carritoRouter.get('/',validarJwt,async (req,res) =>{
    const id = req.user.userId
    const sql = `SELECT ca.id_carrito,pr.id_producto,pr.nombre,cd.cantidad,GROUP_CONCAT(c.nombre_categoria SEPARATOR ', ') AS categorias
,(SELECT JSON_ARRAYAGG(url_imagen)
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
INNER JOIN carrito_detalle cd 
    ON cd.id_producto = pr.id_producto
INNER JOIN carrito ca 
    ON ca.id_carrito = cd.id_carrito
INNER JOIN usuarios u ON u.id_usuario = ca.id_usuario
WHERE 
    p.precio_dolar = (
        SELECT MIN(precio_dolar) 
        FROM precios 
        WHERE id_producto = pr.id_producto
        ) AND ca.id_usuario = ? AND ca.estado = "activo"
group by pr.id_producto,ca.id_carrito,cd.cantidad,p.precio_dolar, p.precio_dolar_iva,p.iva,p.precio_pesos, p.precio_pesos_iva,pro.nombre_proveedor;`
    const [resultado,fields] = await db.execute(sql,[id])

    res.status(200).send({carrito:resultado})
})

carritoRouter.post('/',validarJwt,validarBodyCarrito(),verificarValidaciones, async (req,res) =>{
    const {id_producto,cantidad } = req.body;
    const parametros = [req.user.userId,id_producto,cantidad];
    const sql = 'call schemamodex.cargar_carrito(?, ?, ?);'
    const [resul, fields] = await db.execute(sql,parametros)
    res.status(201).send({resultado:resul})
})

carritoRouter.post('/armador',validarJwt,async (req,res) =>{

})
carritoRouter.put('/',validarJwt,validarBodyPutCarrito(),async (req,res)=>{
    const {id_producto,cantidad} = req.body;
    try {
        const parametros = [id_producto,cantidad,req.user.userId]
        const sql = "call schemamodex.alterar_carrito(?, ?, ?);"
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
        const sql = 'call schemamodex.borrar_producto_carrito(?, ?);';
        const [resultado, fields] = await db.execute(sql,parametros);
        if(resultado.affectedRows == 0) {
            return res.status(404).send({mensaje:"Producto no encontrado en el carrito"})
        }
        res.status(200).send({mensaje:"Producto eliminado del carrito"})
    } catch(error){
        console.log(error)
        res.status(500).send({error:"Error al eliminar el producto"})
    }
})

carritoRouter.get("/ventas",validarJwt,validarRol(2), async(req ,res) =>{
    try {
        const sql =`SELECT 
    c.id_carrito AS id, 
    u.username, 
    c.fecha_finalizada, 
    c.estado, 
    c.total_a_pagar,
    (
        SELECT GROUP_CONCAT(CONCAT(p.nombre, ' x', cd.cantidad) SEPARATOR '\n')
        FROM carrito_detalle cd
        INNER JOIN productos p ON p.id_producto = cd.id_producto
        WHERE cd.id_carrito = c.id_carrito
    ) AS productos
FROM carrito c
INNER JOIN usuarios u ON u.id_usuario = c.id_usuario
WHERE c.estado = 'completado';`

    const [resultado] = await db.execute(sql)

    res.status(200).send(resultado)
    } catch (error) {
        
    }
})

carritoRouter.get('/stats',validarJwt,validarRol(2),async(req,res)=>{
    try {
        const sql = `SELECT sum(c.total_a_pagar) AS total_vendido,
count(c.id_carrito) AS pedidos,
count(distinct c.id_usuario) AS clientes
FROM carrito c 
WHERE c.estado = 'completado';`
        const [resultado] = await db.execute(sql)
        res.status(200).send(resultado)
    } catch (error) {
        
    }
})
export default carritoRouter;