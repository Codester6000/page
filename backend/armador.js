import express from "express"
import { validarQueryArmador,verificarValidaciones } from "./middleware/validaciones.js";
import { db } from "./database/connectionMySQL.js";
import {query} from "express-validator"

const armadorRouter = express.Router()

armadorRouter.get("/", validarQueryArmador(),verificarValidaciones, async (req, res) => {
const {procesador,motherboard,gpu,memoria,gabinete,almacenamiento} = req.query

const sql = `SELECT 
    pr.nombre, 
    p.stock, 
    pr.peso, 
    pr.garantia_meses, 
    pr.codigo_fabricante,
    GROUP_CONCAT(DISTINCT c.nombre_categoria SEPARATOR ', ') AS categorias,
    GROUP_CONCAT(DISTINCT i.url_imagen SEPARATOR ', ') AS url_imagenes,
    p.precio_dolar, 
    p.precio_dolar_iva, 
    p.iva, 
    p.precio_pesos, 
    p.precio_pesos_iva,
    pr.alto, 
    pr.ancho, 
    pr.largo, 
    pro.nombre_proveedor
FROM productos pr
INNER JOIN precios p ON pr.id_producto = p.id_producto
INNER JOIN productos_categorias pc ON pr.id_producto = pc.id_producto
INNER JOIN categorias c ON pc.id_categoria = c.id_categoria
INNER JOIN productos_imagenes pi ON pi.id_producto = pr.id_producto
INNER JOIN imagenes i ON pi.id_imagen = i.id_imagen
INNER JOIN proveedores pro ON pro.id_proveedor = p.id_proveedor
WHERE 
    p.precio_dolar = (
        SELECT MIN(precio_dolar) 
        FROM precios 
        WHERE id_producto = pr.id_producto AND stock > 0
    )
    AND pr.id_producto IN (
        SELECT pc2.id_producto
        FROM productos_categorias pc2
        INNER JOIN categorias c2 ON pc2.id_categoria = c2.id_categoria
        WHERE c2.nombre_categoria IN (?, ?)
        GROUP BY pc2.id_producto
        HAVING COUNT(DISTINCT c2.nombre_categoria) = ?
    )
GROUP BY pr.id_producto, p.stock, p.precio_dolar, p.precio_dolar_iva, p.iva, p.precio_pesos, p.precio_pesos_iva, pr.alto, pr.ancho, pr.largo, pro.nombre_proveedor;
`
const paramProcesadores = (procesador !=undefined) ? ["procesadores",procesador,2] : ["procesadores","",1]; 
const [procesadores] = await db.execute(sql,paramProcesadores)

const paramMotherboards = (motherboard !=undefined) ? ["motherboards",motherboard,2] : ["motherboards","",1];

const [motherboards] = await db.execute(sql,paramMotherboards);

const paramGpus = (gpu !=undefined) ?  ["Placas de Video",gpu,2]:["Placas de Video","",1]
const [gpus] = await db.execute(sql,paramGpus);
const paramMemorias = (memoria != undefined) ? ["memorias pc",memoria,2] : ["memorias pc","",1];
const [memorias] = await db.execute(sql,paramMemorias);

const paramFuente = ["fuentes","",1]
const [fuentes] = await db.execute(sql,paramFuente)

const paramGabinente = ["gabinetes","",1];
const [gabinetes] = await db.execute(sql,paramGabinente)
const paramAlmacenamiento = ["discos internos","discos internos ssd",1];
const [almacenamientos] = await db.execute(sql,paramAlmacenamiento)

    res.status(200).send({ productos : {"procesadores": procesadores, "motherboards": motherboards, "gpus":gpus,"memorias": memorias, "fuentes": fuentes, "gabinetes": gabinetes, "almacenamiento": almacenamientos }})
})

export default armadorRouter;